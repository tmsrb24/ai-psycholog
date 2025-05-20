import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Detailed logging for debugging
console.log("Environment variables check:");
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
// console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI); // MongoDB se nepoužívá

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
      console.log("[NextAuth] signIn callback", { userEmail: user?.email, accountProvider: account?.provider, profileSub: (profile as any)?.sub });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Tento callback se volá při vytvoření/aktualizaci JWT.
      // `user`, `account`, `profile` jsou k dispozici pouze při prvním přihlášení.
      if (account && user) { // První přihlášení
        token.id = user.id; // Standardní user.id z NextAuth (mělo by být profile.sub pro OAuth)
        
        // Pro Google explicitně použijeme 'sub' z profilu, pokud je k dispozici,
        // protože to je garantované unikátní ID uživatele od Google.
        if (account.provider === "google" && (profile as any)?.sub) {
          token.id = (profile as any).sub;
        }
        
        token.email = user.email ?? undefined; // Zajistí string | undefined
        token.name = user.name ?? undefined;   // Zajistí string | undefined
        token.image = user.image ?? undefined; // Zajistí string | undefined
        
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
        token.provider = account.provider;
        console.log("[NextAuth] JWT callback - initial sign in. Token populated:", JSON.stringify(token, null, 2));
      }
      return token;
    },
    async session({ session, token }) {
      // Tento callback se volá vždy, když se přistupuje k session.
      // Přidáváme data z tokenu do `session.user` objektu.
      if (session.user) {
        // Zajistíme, že id je vždy string. Pokud by token.id bylo undefined, session.user.id bude prázdný string.
        // To by mělo být ošetřeno v jwt callbacku, aby token.id vždy mělo hodnotu.
        session.user.id = (token.id as string) || ""; 
        session.user.name = (token.name as string | null | undefined) ?? null;
        session.user.email = (token.email as string | null | undefined) ?? null;
        session.user.image = (token.image as string | null | undefined) ?? null;
      }
      // console.log("[NextAuth] Session callback. Final session object:", JSON.stringify(session, null, 2));
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development', // Zapnout debug jen ve vývoji
  logger: {
    error(code: any, metadata: any) {
      console.error("[NextAuth ERROR]", { code, ...metadata });
    },
    warn(code: any) {
      console.warn("[NextAuth WARN]", code);
    },
    debug(code: any, metadata: any) {
      // console.log("[NextAuth DEBUG]", { code, ...metadata }); // Příliš ukecané, zapnout jen při potřebě
    }
  }
};

export default NextAuth(authOptions);
