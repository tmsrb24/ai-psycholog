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
              // Try using email filter with listUsers, casting options to 'any' to bypass TS error
              const listUserParams: any = { email: user.email, page: 1, perPage: 5 };
              const { data: { users: foundUsers }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers(listUserParams);

              if (listUsersError) {
                console.error("[NextAuth] JWT: Error listing Supabase auth users by email:", listUsersError.message);
              } else if (foundUsers && foundUsers.length > 0) {
                // Assuming email is unique, the first user is the one.
                supabaseUserId = foundUsers[0].id; 
                console.log(`[NextAuth] JWT: Found Supabase auth user by email (using email filter). UUID: ${supabaseUserId}`);
              } else {
                console.warn(`[NextAuth] JWT: Supabase auth user not found for email '${user.email}' using listUsers with email filter.`);
              }
            } catch (e: any) {
              console.error("[NextAuth] JWT: Exception while fetching/handling Supabase auth user by email:", e.message);
            }
          } else {
            console.error("[NextAuth] JWT CRITICAL: user.email is missing, cannot look up Supabase user.");
          }
        }

        if (supabaseUserId) {
          token.sub = supabaseUserId;
          token.id = supabaseUserId; 

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
                console.log(`[NextAuth] JWT: User profile does not exist for ${user.email} (Supabase ID: ${supabaseUserId}). This might be the first sign-in. Attempting to send welcome email.`);
                sendWelcomeEmail(user.email, user.name).catch(emailError => {
                  console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
                });
              } else {
                console.log(`[NextAuth] JWT: User profile already exists for ${user.email} (Supabase ID: ${supabaseUserId}). Not a new user for welcome email purposes.`);
              }
            } catch (dbError: any) {
              console.error("[NextAuth] JWT: Database error during new user check for welcome email:", dbError.message);
            }
          }
        } else {
          token.sub = ""; 
          token.id = ""; 
          console.error(`[NextAuth] JWT CRITICAL: Could not determine a valid Supabase UUID for token.sub. User ID from provider: '${user.id}', Email: '${user.email}'. session.user.id will be empty.`);
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
