import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSupabaseAdmin, supabase } from "../../../lib/supabaseClient"; 
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
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[NextAuth Credentials] Missing email or password in credentials object");
          return null;
        }
        
        console.log(`[NextAuth Credentials] Authorize attempt for email: ${credentials.email}`);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          console.error(`[NextAuth Credentials] Supabase signInWithPassword error for ${credentials.email}:`, error.message);
          // Vracíme null, což NextAuth interpretuje jako neúspěšné přihlášení.
          // Můžeme také vyhodit chybu s konkrétní zprávou, která se zobrazí na frontendu.
          // throw new Error(error.message); // Toto by přesměrovalo na chybovou stránku.
          return null;
        }

        if (data.user) {
          console.log(`[NextAuth Credentials] Successfully authenticated user: ${data.user.email}, ID: ${data.user.id}`);
          // Vracíme objekt uživatele, který NextAuth použije pro vytvoření session/tokenu.
          // Objekt musí obsahovat 'id' a další pole, která chceme v tokenu.
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || null,
            image: data.user.user_metadata?.avatar_url || null,
          };
        }
        
        // Pokud z nějakého důvodu není ani user ani error, vrátíme null.
        return null;
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
      console.log("[NextAuth] signIn callback:", { 
        userId: user?.id, 
        userEmail: user?.email, 
        accountProvider: account?.provider, 
        profileSub: (profile as any)?.sub 
      });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[NextAuth] JWT callback START:", { 
        token_arg: token ? JSON.parse(JSON.stringify(token)) : null,
        user_arg: user ? JSON.parse(JSON.stringify(user)) : null, 
        account_arg: account ? JSON.parse(JSON.stringify(account)) : null,
        profile_arg: profile ? JSON.parse(JSON.stringify(profile)) : null 
      });

      // This block runs on initial sign-in or when linking an account
      if (user && account) {
        console.log("[NextAuth] JWT: 'user' and 'account' objects are present. Processing as new sign-in / account link.");
        
        const newToken: { [key: string]: any } = {}; // Start with a clean token for new sign-ins
        let supabaseUserId: string | null = null;

        if (user.id && typeof user.id === 'string' && user.id.length === 36) { 
          supabaseUserId = user.id;
          console.log(`[NextAuth] JWT: Using user.id ('${user.id}') directly as Supabase UUID (this is unusual for Google).`);
        } else {
          console.warn(`[NextAuth] JWT: user.id ('${user.id}') from provider is not a UUID. Attempting to find or create Supabase user by email ('${user.email}').`);
          if (user.email) {
            const supabaseAdmin = getSupabaseAdmin();
            try {
              // Fetch a page of users and then filter by email, as listUsers doesn't directly take email filter.
              // This is not highly efficient for just finding one user but matches the previous logic's intent.
              const { data: { users: listedUsers }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 }); // Adjust perPage as needed
              
              let foundUser = null;
              if (listedUsers) {
                foundUser = listedUsers.find(u => u.email === user.email);
              }

              if (listUsersError) {
                console.error("[NextAuth] JWT: Error listing Supabase auth users:", listUsersError.message);
              } else if (foundUser) {
                supabaseUserId = foundUser.id;
                console.log(`[NextAuth] JWT: Found existing Supabase auth user by email ('${user.email}'). UUID: ${supabaseUserId}`);
              } else {
                console.warn(`[NextAuth] JWT: Supabase auth user not found for email '${user.email}'. Attempting to create new user.`);
                if (account.provider === 'google' && user.email) {
                  try {
                    const { data: { user: newSupabaseUser }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
                      email: user.email,
                      email_confirm: true, // Email is verified by Google
                      user_metadata: {
                        full_name: user.name || profile?.name,
                        avatar_url: user.image || (profile as any)?.picture,
                        provider_id: user.id, 
                      }
                    });
                    if (createUserError) {
                      console.error("[NextAuth] JWT: Error creating new Supabase auth user:", createUserError.message, JSON.stringify(createUserError));
                    } else if (newSupabaseUser) {
                      supabaseUserId = newSupabaseUser.id;
                      console.log(`[NextAuth] JWT: Successfully created new Supabase auth user. UUID: ${supabaseUserId}`);
                      console.log(`[NextAuth] JWT: Attempting to send welcome email to new user ${user.email}.`);
                      sendWelcomeEmail(user.email, user.name || profile?.name).catch(emailError => {
                        console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
                      });
                    } else {
                       console.error("[NextAuth] JWT: createUser call did not return a user object nor an error. SupabaseUserId remains null.");
                    }
                  } catch (createErr: any) {
                    console.error("[NextAuth] JWT: Exception during Supabase auth user creation:", createErr.message, createErr.stack);
                  }
                } else {
                  console.warn(`[NextAuth] JWT: Not a Google provider or email missing for creation. User email: ${user.email}, Provider: ${account.provider}`);
                }
              }
            } catch (e: any) {
              console.error("[NextAuth] JWT: General exception while fetching/creating Supabase auth user by email:", e.message, e.stack);
            }
          } else {
            console.error("[NextAuth] JWT CRITICAL: user.email is missing from provider, cannot look up or create Supabase user.");
          }
        }

        if (supabaseUserId) {
          newToken.sub = supabaseUserId;
          newToken.id = supabaseUserId; 
          newToken.email = user.email ?? undefined;
          newToken.name = user.name ?? profile?.name ?? undefined;
          newToken.image = user.image ?? (profile as any)?.picture ?? undefined;
          if (account.access_token) newToken.accessToken = account.access_token;
          if (account.provider) newToken.provider = account.provider;
          
          // Preserve iat and exp from original token if they exist and we are refreshing
          // For a completely new token, NextAuth will add these.
          if (token?.iat) newToken.iat = token.iat;
          if (token?.exp) newToken.exp = token.exp;


          console.log("[NextAuth] JWT: New sign-in processed. Returning newToken:", JSON.parse(JSON.stringify(newToken)));
          return newToken;
        } else {
          console.error(`[NextAuth] JWT CRITICAL: supabaseUserId is null for user (email: ${user.email}, providerId: ${user.id}). Invalidating token by returning empty object.`);
          return {}; // Return an empty object to effectively invalidate/reject the session.
        }
      }

      // If 'user' and 'account' are not present, it's a session revalidation.
      // The incoming 'token' argument should be the valid, existing JWT.
      if (!token?.sub) { // Check if the existing token is valid
        console.error("[NextAuth] JWT: Revalidation - token.sub is missing or token is null/undefined. Invalidating. Token:", token ? JSON.parse(JSON.stringify(token)) : token);
        return {}; // Invalid token, force re-auth
      }
      
      console.log("[NextAuth] JWT: Revalidation - 'user'/'account' not present. Returning existing token:", JSON.parse(JSON.stringify(token)));
      return token; // Return existing token for session revalidation
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", token ? JSON.parse(JSON.stringify(token)) : null);
      
      if (token && token.sub && typeof token.sub === 'string' && token.sub.length === 36) { 
        session.user.id = token.sub;
      } else {
        console.error(`[NextAuth] Session: token.sub ('${token.sub}') is invalid or missing! Cannot set session.user.id correctly.`);
        session.user.id = ""; // Indicate invalid session user ID
      }

      session.user.name = token.name as string | null ?? null;
      session.user.email = token.email as string | null ?? null;
      session.user.image = token.image as string | null ?? null;
      
      console.log("[NextAuth] Session callback END. Final session.user:", JSON.parse(JSON.stringify(session.user)));
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
