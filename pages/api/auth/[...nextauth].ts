import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSupabaseAdmin } from "../../../lib/supabaseClient"; // Pro kontrolu existence uživatele
import { sendWelcomeEmail } from "../../../lib/emailService"; // Pro odeslání emailu

console.log("Environment variables check:");
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("- SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY); // Kontrola pro SendGrid

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
      // Zde bychom mohli kontrolovat, zda je uživatel oprávněn se přihlásit, např. zda je jeho email na whitelistu.
      // Prozatím povolíme všechny.
      return true;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[NextAuth] JWT callback START:", { tokenId_before: token?.id, tokenSub_before: token?.sub, raw_user_id: user?.id, userEmail: user?.email, profileSub: (profile as any)?.sub, accountProvider: account?.provider });
      
      // Pokud je user objekt přítomen (typicky při signIn nebo při prvním vytvoření JWT)
      if (user) {
        // Předpokládáme, že user.id z NextAuth by MĚLO být Supabase auth.users.id (UUID)
        // Pokud tomu tak není, je problém v integraci NextAuth s Auth providerem (Supabase)
        if (user.id && typeof user.id === 'string' && user.id.length === 36) { // Jednoduchá kontrola, zda to vypadá jako UUID
          token.sub = user.id;
          token.id = user.id; // Pro konzistenci
          console.log(`[NextAuth] JWT: Using user.id as Supabase UUID: ${user.id}`);

          // Kontrola pro odeslání uvítacího emailu, pokud je to první přihlášení
          if (account && user.email) { // 'account' je přítomen jen při prvním sign-in/link
            try {
              const supabaseAdmin = getSupabaseAdmin();
              const { data: existingProfile, error: profileError } = await supabaseAdmin
                .from('user_profiles')
                .select('id')
                .eq('id', user.id) // user.id je zde již UUID
                .maybeSingle();

              if (profileError && profileError.code !== 'PGRST116') {
                console.error("[NextAuth] JWT: Error checking user_profiles for welcome email:", profileError);
              }
              
              if (!existingProfile) {
                console.log(`[NextAuth] JWT: New user profile to be created for ${user.email}. Attempting to send welcome email.`);
                sendWelcomeEmail(user.email, user.name).catch(emailError => {
                  console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
                });
              }
            } catch (dbError) {
              console.error("[NextAuth] JWT: Database error during new user check for welcome email:", dbError);
            }
          }
        } else {
          // Pokud user.id není validní UUID, je zde problém.
          // Může se stát, pokud se používá provider, který nevrací UUID jako user.id,
          // nebo pokud není správně nastaven adapter.
          console.error(`[NextAuth] JWT CRITICAL: user.id ('${user.id}') does not appear to be a valid Supabase UUID. Falling back to profile.sub if Google.`);
          if (account?.provider === "google" && (profile as any)?.sub) {
            // Toto je nouzové řešení a pravděpodobně způsobí chyby v API, pokud profile.sub není UUID.
            // Ale je to to, co tam bylo předtím a způsobovalo chybu.
            // Cílem je, aby user.id BYLO UUID.
            token.sub = String((profile as any).sub); 
            token.id = String((profile as any).sub);
             console.warn(`[NextAuth] JWT: Fallback - using Google profile.sub ('${token.sub}') as token.sub. THIS MAY CAUSE ISSUES IF NOT A UUID.`);
          } else {
            token.sub = ""; token.id = ""; // Signalizuje problém
            console.error(`[NextAuth] JWT CRITICAL: Could not determine a valid UUID for token.sub.`);
          }
        }
        
        // Ostatní informace do tokenu
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
      
      if (token.sub && String(token.sub).length === 36) { // Přísnější kontrola na UUID formát
        session.user.id = String(token.sub);
      } else {
        console.error(`[NextAuth] Session: token.sub ('${token.sub}') is not a valid UUID! Cannot reliably set session.user.id.`);
        session.user.id = ""; // Nastavit na prázdný string, aby bylo jasné, že ID je neplatné
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
