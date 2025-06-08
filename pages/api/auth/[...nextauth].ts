import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSupabaseAdmin } from "../../../lib/supabaseClient"; 
import { sendWelcomeEmail } from "../../../lib/emailService"; 

console.log("Environment variables check:");
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("- SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] signIn callback:", { userId: user?.id, userEmail: user?.email, accountProvider: account?.provider, profileSub: (profile as any)?.sub });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[NextAuth] JWT callback START:", { tokenId_before: token?.id, tokenSub_before: token?.sub, raw_user_id: user?.id, userEmail: user?.email, profileSub: (profile as any)?.sub, accountProvider: account?.provider });
      
      if (user) {
        let supabaseUserId: string | null = null;

        if (user.id && typeof user.id === 'string' && user.id.length === 36) { 
          supabaseUserId = user.id;
          console.log(`[NextAuth] JWT: Using user.id directly as Supabase UUID: ${supabaseUserId}`);
        } else {
          console.warn(`[NextAuth] JWT: user.id ('${user.id}') from provider is not a UUID. Attempting to find Supabase user by email ('${user.email}').`);
          if (user.email) {
            try {
              const supabaseAdmin = getSupabaseAdmin();
              // Supabase stores user identities in auth.users, email is unique there.
              // We need to query the raw auth.users table, not user_profiles for the auth ID.
              const { data: supabaseUser, error: fetchError } = await supabaseAdmin.from('users').select('id').eq('email', user.email).single(); // Assuming 'users' is the table in 'auth' schema

              if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error("[NextAuth] JWT: Error fetching Supabase user by email:", fetchError);
              } else if (supabaseUser) {
                supabaseUserId = supabaseUser.id;
                console.log(`[NextAuth] JWT: Found Supabase user by email. UUID: ${supabaseUserId}`);
              } else {
                console.error(`[NextAuth] JWT CRITICAL: Supabase user not found for email '${user.email}'. This might indicate a new user whose Supabase auth record hasn't been created or synced yet, or an issue with Supabase Auth setup.`);
              }
            } catch (e) {
              console.error("[NextAuth] JWT: Exception while fetching Supabase user by email:", e);
            }
          } else {
            console.error("[NextAuth] JWT CRITICAL: user.email is missing, cannot look up Supabase user.");
          }
        }

        if (supabaseUserId) {
          token.sub = supabaseUserId;
          token.id = supabaseUserId; // For consistency

          // Welcome email logic (only if account is present, indicating first sign-in/link)
          if (account && user.email) {
            try {
              const supabaseAdmin = getSupabaseAdmin();
              const { data: existingProfile, error: profileError } = await supabaseAdmin
                .from('user_profiles')
                .select('id')
                .eq('id', supabaseUserId) 
                .maybeSingle();

              if (profileError && profileError.code !== 'PGRST116') {
                console.error("[NextAuth] JWT: Error checking user_profiles for welcome email:", profileError);
              }
              
              if (!existingProfile) {
                console.log(`[NextAuth] JWT: New user profile to be created for ${user.email} (Supabase ID: ${supabaseUserId}). Attempting to send welcome email.`);
                // Note: user_profiles table should be populated by a Supabase trigger on auth.users insert.
                // If not, it needs to be created here or by such a trigger.
                // For now, just sending email.
                sendWelcomeEmail(user.email, user.name).catch(emailError => {
                  console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
                });
              }
            } catch (dbError) {
              console.error("[NextAuth] JWT: Database error during new user check for welcome email:", dbError);
            }
          }
        } else {
          token.sub = ""; 
          token.id = ""; 
          console.error(`[NextAuth] JWT CRITICAL: Could not determine a valid Supabase UUID for token.sub. User ID from provider: '${user.id}', Email: '${user.email}'`);
        }
        
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        if (account?.access_token) token.accessToken = account.access_token;
        if (account?.provider) token.provider = account.provider;
      }
      
      if (!token.sub) {
        console.error("[NextAuth] JWT: CRITICAL - token.sub is empty or missing at the end of JWT callback. Token:", JSON.stringify(token, null, 2));
      } else {
        console.log("[NextAuth] JWT callback END. Token populated:", JSON.stringify(token, null, 2));
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", JSON.stringify(token, null, 2));
      
      if (token.sub && typeof token.sub === 'string' && token.sub.length === 36) { 
        session.user.id = token.sub;
      } else {
        console.error(`[NextAuth] Session: token.sub ('${token.sub}') is not a valid UUID! Cannot reliably set session.user.id.`);
        session.user.id = ""; 
      }
      session.user.name = token.name as string | null;
      session.user.email = token.email as string | null;
      session.user.image = token.image as string | null;
      
      console.log("[NextAuth] Session callback END. Final session.user:", JSON.stringify(session.user, null, 2));
      return session;
    },
  },
  debug: true,
  logger: {
    error(code: any, metadata: any) { console.error("[NextAuth ERROR]", { code, ...metadata }); },
    warn(code: any) { console.warn("[NextAuth WARN]", code); },
    debug(code: any, metadata: any) { console.log("[NextAuth DEBUG]", { code, ...metadata }); }
  }
};

export default NextAuth(authOptions);
