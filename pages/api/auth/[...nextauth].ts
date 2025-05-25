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
      console.log("[NextAuth] JWT callback START:", { tokenId_before: token?.id, tokenSub_before: token?.sub, userId: user?.id, userEmail: user?.email, profileSub: (profile as any)?.sub, accountProvider: account?.provider });
      
      // Při přihlášení (když jsou user a account objekty dostupné)
      if (user && account) {
        // user.id by měl být UUID z tabulky auth.users (pokud je adapter správně nastaven)
        // Toto ID použijeme jako hlavní identifikátor v tokenu.
        if (user.id) {
          token.sub = user.id; // Primární identifikátor uživatele (UUID)
          token.id = user.id;   // Pro konzistenci, i když .sub je standardní pro JWT subject

          console.log(`[NextAuth] JWT: Populating token with user.id (UUID): ${user.id}`);

          // Kontrola pro odeslání uvítacího emailu (pouze pokud je to nové přihlášení a profil ještě neexistuje)
          // Předpokládáme, že user_profiles.id je stejné jako auth.users.id (user.id zde)
          // Toto se děje pouze při prvním vytvoření tokenu pro uživatele (nové přihlášení)
          try {
            const supabaseAdmin = getSupabaseAdmin();
            const { data: existingProfile, error: profileError } = await supabaseAdmin
              .from('user_profiles')
              .select('id')
              .eq('id', user.id) // Používáme user.id (UUID)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error("[NextAuth] JWT: Error checking user_profiles:", profileError);
            }
            
            if (!existingProfile && user.email) {
              console.log(`[NextAuth] JWT: New user detected (${user.email}). Attempting to send welcome email.`);
              sendWelcomeEmail(user.email, user.name).catch(emailError => {
                console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
              });
            }
          } catch (dbError) {
            console.error("[NextAuth] JWT: Database error during new user check:", dbError);
          }
        } else {
          // Toto by se nemělo stát, pokud NextAuth a jeho adapter fungují správně
          console.error(`[NextAuth] JWT CRITICAL: user.id is missing. Cannot set token.sub. User object:`, user);
          // Nastavíme sub na prázdný řetězec, aby to bylo zřejmé v session callbacku
          token.sub = ""; 
          token.id = "";
        }
        
        // Ostatní informace do tokenu
        token.email = user.email ?? undefined; // Zajistíme, že null se převede na undefined
        token.name = user.name ?? undefined;   // Zajistíme, že null se převede na undefined
        token.image = user.image ?? undefined; // Zajistíme, že null se převede na undefined
        if (account.access_token) token.accessToken = account.access_token;
        token.provider = account.provider;

        console.log("[NextAuth] JWT callback - user & account present. Token populated:", JSON.stringify(token, null, 2));
      }
      // Pokud user nebo account nejsou přítomny (např. při obnovení session), token by měl již obsahovat .sub
      // Pokud by .sub chyběl i zde, je to problém
      if (!token.sub) {
        console.warn("[NextAuth] JWT: token.sub is still missing after processing. Token:", JSON.stringify(token, null, 2));
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", JSON.stringify(token, null, 2));
      
      // Přenesení .sub (UUID) z tokenu do session.user.id
      // Ostatní pole (name, email, image) by měla být také v tokenu
      if (token.sub) {
        session.user.id = String(token.sub);
      } else {
        console.error("[NextAuth] Session: token.sub is missing! Cannot set session.user.id.");
        // session.user.id zůstane tak, jak ho NextAuth defaultně nastavil, nebo bude undefined
      }
      session.user.name = token.name as string | null;
      session.user.email = token.email as string | null;
      session.user.image = token.image as string | null;
      // Můžeme přidat i providera do session, pokud je to potřeba na klientovi
      // (session as any).provider = token.provider; 
      
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
