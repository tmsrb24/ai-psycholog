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
      
      const supabaseAdmin = getSupabaseAdmin();

      // Při prvním přihlášení nebo propojení účtu (když jsou user a account objekty dostupné)
      if (user && account && user.email) {
        try {
          // Získání skutečného Supabase User ID (UUID) na základě emailu
          // Použijeme iteraci přes listUsers, protože přímý filtr podle emailu nemusí být podporován nebo je složitější
          // Toto není ideální pro velký počet uživatelů, ale pro začátek postačí.
          // V produkci by bylo lepší použít specifickou funkci pro vyhledání podle emailu, pokud existuje,
          // nebo zajistit, že user.id z NextAuth je již správné Supabase UUID.
          let supabaseUserIdFromAuth: string | undefined = undefined; // Přejmenováno pro jasnost
          const { data: { users: allSupaUsers }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ // Přejmenováno na allSupaUsers
            page: 1,
            perPage: 1000, 
          });

          if (listUsersError) {
            console.error("[NextAuth] JWT: Error listing users from Supabase Auth:", listUsersError);
            throw listUsersError; // Správná proměnná pro chybu
          }

          const foundSupaUser = allSupaUsers.find(u => u.email === user.email); // Hledáme v allSupaUsers
          if (foundSupaUser) {
            supabaseUserIdFromAuth = foundSupaUser.id; // Přiřadíme ID nalezeného uživatele
          }
          
          if (supabaseUserIdFromAuth) { // Používáme novou proměnnou
            token.sub = supabaseUserIdFromAuth;
            token.id = supabaseUserIdFromAuth; 
            console.log(`[NextAuth] JWT: Successfully mapped email ${user.email} to Supabase UUID: ${supabaseUserIdFromAuth}`);

            // Kontrola pro odeslání uvítacího emailu
            const { data: existingProfile, error: profileError } = await supabaseAdmin
              .from('user_profiles')
              .select('id')
              .eq('id', supabaseUserIdFromAuth) // Používáme správné ID
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error("[NextAuth] JWT: Error checking user_profiles for welcome email:", profileError);
            }
            
            if (!existingProfile && user.email) {
              console.log(`[NextAuth] JWT: New user profile to be created for ${user.email}. Attempting to send welcome email.`);
              sendWelcomeEmail(user.email, user.name).catch(emailError => {
                console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
              });
            }
          } else { 
            console.error(`[NextAuth] JWT CRITICAL: Could not find Supabase user UUID for email ${user.email}.`);
            token.sub = ""; token.id = ""; 
          }
        } catch (error) { 
          console.error("[NextAuth] JWT: General error during Supabase user processing or email check:", error);
          token.sub = ""; token.id = ""; 
        }
        
        // Ostatní informace do tokenu, i když se nepodařilo získat supabaseUserId,
        // aby základní přihlášení mohlo fungovat (ale API volání budou selhávat)
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        if (account.access_token) token.accessToken = account.access_token;
        token.provider = account.provider;

        console.log("[NextAuth] JWT callback - user & account present. Token populated:", JSON.stringify(token, null, 2));
      
      } else if (user) {
        // Toto by mohlo být voláno při obnovení JWT, pokud user objekt je stále k dispozici,
        // ale account ne (např. není to první přihlášení v rámci tohoto JWT cyklu).
        // Zajistíme, že .sub je stále správně nastaven, pokud již existuje.
        if (!token.sub && user.id) {
           // Zde by user.id již mělo být UUID, pokud bylo správně nastaveno při prvním signIn
           // Ale pro jistotu bychom mohli znovu zkusit mapování, pokud by token.sub chyběl.
           // Prozatím předpokládáme, že pokud token.sub není, user.id je spolehlivé.
          console.warn(`[NextAuth] JWT: token.sub was missing, attempting to use user.id: ${user.id}`);
          token.sub = user.id;
          token.id = user.id;
        }
      }
      
      if (!token.sub) {
        console.error("[NextAuth] JWT: CRITICAL - token.sub is still missing or empty after all processing. This will cause issues. Token:", JSON.stringify(token, null, 2));
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", JSON.stringify(token, null, 2));
      
      if (token.sub && String(token.sub).length > 0) { // Ověříme, že token.sub není prázdný
        session.user.id = String(token.sub); // Toto by mělo být UUID
      } else {
        console.error("[NextAuth] Session: token.sub is missing or empty! Cannot reliably set session.user.id.");
        // Fallback na token.id nebo ponechat defaultní session.user.id, pokud existuje
        session.user.id = token.id ? String(token.id) : (session.user?.id || ""); 
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
