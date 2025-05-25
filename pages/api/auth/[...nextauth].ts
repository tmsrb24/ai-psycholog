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
      console.log("[NextAuth] JWT callback START:", { tokenSub_before: token?.sub, user_id_from_nextauth: user?.id, userEmail: user?.email, accountProvider: account?.provider });

      // Pokud je 'user' objekt přítomen (typicky při prvním přihlášení/linkování)
      if (user && user.email && account) {
        const supabaseAdmin = getSupabaseAdmin();
        try {
          // Pokusíme se získat uživatele ze Supabase Auth podle emailu
          // Toto je nejspolehlivější způsob, jak získat Supabase UUID
          const { data: supaUserData, error: supaUserError } = await supabaseAdmin.auth.admin.listUsers({
             // listUsers neumožňuje přímý filtr podle emailu, musíme iterovat nebo použít jinou metodu
             // Pro jednoduchost zde předpokládáme, že user.id z NextAuth JE Supabase UUID,
             // pokud ne, je potřeba robustnější řešení (např. iterace nebo @supabase/ssr)
          });

          let supabaseUserIdToUse: string | undefined = undefined;

          if (supaUserError) {
            console.error("[NextAuth] JWT: Error listing users from Supabase Auth:", supaUserError);
          } else if (supaUserData && supaUserData.users) {
            const foundUserInSupabase = supaUserData.users.find(u => u.email === user.email);
            if (foundUserInSupabase) {
              supabaseUserIdToUse = foundUserInSupabase.id;
              console.log(`[NextAuth] JWT: Found user in Supabase Auth by email. UUID: ${supabaseUserIdToUse}`);
            } else {
              console.warn(`[NextAuth] JWT: User with email ${user.email} not found directly in Supabase Auth user list. This might happen if user was just created.`);
              // Pokud uživatel nebyl nalezen v listUsers (což by se nemělo stát, pokud Supabase spravuje účet),
              // zkusíme se spolehnout na user.id z NextAuth, pokud vypadá jako UUID.
              if (user.id && typeof user.id === 'string' && user.id.length === 36) {
                supabaseUserIdToUse = user.id;
                console.log(`[NextAuth] JWT: Using user.id from NextAuth as potential Supabase UUID: ${supabaseUserIdToUse}`);
              }
            }
          }
          
          if (supabaseUserIdToUse) {
            token.sub = supabaseUserIdToUse;
            token.id = supabaseUserIdToUse; // Pro konzistenci

            // Kontrola pro odeslání uvítacího emailu
            const { data: existingProfile, error: profileError } = await supabaseAdmin
              .from('user_profiles')
              .select('id')
              .eq('id', supabaseUserIdToUse)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
              console.error("[NextAuth] JWT: Error checking user_profiles for welcome email:", profileError);
            }
            
            if (!existingProfile) {
              console.log(`[NextAuth] JWT: New user profile to be created for ${user.email}. Attempting to send welcome email.`);
              sendWelcomeEmail(user.email, user.name).catch(emailError => {
                console.error("[NextAuth] JWT: Failed to send welcome email:", emailError);
              });
            }
          } else {
            console.error(`[NextAuth] JWT CRITICAL: Could not determine Supabase UUID for user ${user.email}.`);
            token.sub = ""; token.id = ""; // Signalizuje problém
          }
        } catch (error) {
          console.error("[NextAuth] JWT: Error during Supabase user processing:", error);
          token.sub = ""; token.id = "";
        }

        // Ostatní informace do tokenu
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        if (account.access_token) token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      // Pokud user není přítomen (např. při obnovení JWT), token.sub by již měl být nastaven.
      
      if (!token.sub) {
        console.error("[NextAuth] JWT: CRITICAL - token.sub is empty or missing at the end of JWT callback. Token:", JSON.stringify(token, null, 2));
      } else {
        console.log("[NextAuth] JWT callback END. Token populated:", JSON.stringify(token, null, 2));
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", JSON.stringify(token, null, 2));
      
      // Přísnější kontrola, zda token.sub je validní UUID (36 znaků)
      if (token.sub && typeof token.sub === 'string' && token.sub.length === 36) {
        session.user.id = token.sub;
      } else {
        console.error(`[NextAuth] Session: token.sub ('${token.sub}') is not a valid UUID! Cannot reliably set session.user.id.`);
        session.user.id = ""; // Nastavit na prázdný string nebo nějakou defaultní hodnotu
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
