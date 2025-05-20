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
        tokenId_before: token?.id, 
        userId: user?.id, 
        profileSub: (profile as any)?.sub,
        accountProvider: account?.provider
      });
      
      if (account && user) {
        let idFromProvider: string | undefined = undefined;
        if (user.id) { // user.id by mělo být nastaveno NextAuth (často z profile.sub)
            idFromProvider = String(user.id);
        }
        
        // Pro Google explicitně použijeme 'sub' z profilu, pokud je k dispozici,
        // a převedeme ho na string. 'sub' je garantované unikátní ID od Google.
        if (account.provider === "google" && (profile as any)?.sub) {
          idFromProvider = String((profile as any).sub);
          console.log(`[NextAuth] JWT: Google provider, using profile.sub (${idFromProvider}) as token.id`);
        }
        
        if (!idFromProvider) {
          console.error(`[NextAuth] JWT CRITICAL: Could not determine a valid ID for provider ${account.provider}. Setting token.id to empty string.`);
          token.id = ""; // TypeScript vyžaduje string, ale toto ID je neplatné
        } else {
          token.id = idFromProvider;
        }
        
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
        token.provider = account.provider;
        console.log("[NextAuth] JWT callback - initial sign in. Token populated:", JSON.stringify(token, null, 2));
      } else {
        // console.log("[NextAuth] JWT callback - subsequent call (user/account/profile not present). Token:", JSON.stringify(token, null, 2));
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", JSON.stringify(token, null, 2), "Initial session.user:", JSON.stringify(session?.user, null, 2));
      
      // Vytvoříme nový user objekt, abychom se vyhnuli problémům s referencemi
      const newSessionUser = {
        // Převezmeme existující vlastnosti z session.user, pokud existují (name, email, image z DefaultSession)
        name: session.user?.name ?? null,
        email: session.user?.email ?? null,
        image: session.user?.image ?? null,
        // Přidáme/přepíšeme id z tokenu
        id: token.id ? String(token.id) : "", 
      };

      if (!newSessionUser.id) {
          console.warn("[NextAuth] Session: newSessionUser.id is empty after assignment from token.id. Original token.id was:", token?.id);
      }
      
      session.user = newSessionUser; // Přiřadíme nový, kompletní user objekt

      console.log("[NextAuth] Session callback END. Final session.user:", JSON.stringify(session.user, null, 2));
      return session;
    },
  },
  debug: true, // Ponecháme debug zapnutý pro více logů
  logger: {
    error(code: any, metadata: any) {
      console.error("[NextAuth ERROR]", { code, ...metadata });
    },
    warn(code: any) {
      console.warn("[NextAuth WARN]", code);
    },
    debug(code: any, metadata: any) {
      console.log("[NextAuth DEBUG]", { code, ...metadata }); // Povolíme debug logy
    }
  }
};

export default NextAuth(authOptions);
