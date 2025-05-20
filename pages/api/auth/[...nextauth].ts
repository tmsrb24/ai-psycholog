import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log("Environment variables check:");
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);

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
      console.log("[NextAuth] JWT callback START:", { tokenId_before: token?.id, tokenSub_before: token?.sub, userId: user?.id, profileSub: (profile as any)?.sub, accountProvider: account?.provider });
      
      if (account && user) { // Pouze při prvním přihlášení
        let idToUse: string | undefined = undefined;
        if (account.provider === "google" && (profile as any)?.sub) {
          idToUse = String((profile as any).sub);
          console.log(`[NextAuth] JWT: Google provider, using profile.sub (${idToUse}) as ID.`);
        } else if (user.id) {
          idToUse = String(user.id);
          console.log(`[NextAuth] JWT: Using user.id (${idToUse}) as ID.`);
        }

        if (idToUse) {
          token.sub = idToUse; // Standardní JWT pole pro ID uživatele
          token.id = idToUse;  // Naše vlastní pole pro konzistenci v session callbacku
        } else {
          console.error(`[NextAuth] JWT CRITICAL: Could not determine a valid ID. User ID: ${user.id}, Profile Sub: ${(profile as any)?.sub}`);
          token.id = ""; // Musí být string dle next-auth.d.ts
          token.sub = ""; 
        }
        
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined; // NextAuth mapuje 'picture' z Google profilu na 'image'
        
        if (account.access_token) token.accessToken = account.access_token;
        token.provider = account.provider;
        console.log("[NextAuth] JWT callback - initial sign in. Token populated:", JSON.stringify(token, null, 2));
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback START. Token:", JSON.stringify(token, null, 2), "Initial session.user:", JSON.stringify(session?.user, null, 2));
      
      if (!session.user) {
        session.user = {} as { id: string; name?: string | null; email?: string | null; image?: string | null };
      }
      
      // Primárně použijeme token.sub, pokud existuje, jinak token.id (naše vlastní pole)
      const finalId = token.sub ? String(token.sub) : (token.id ? String(token.id) : "");
      session.user.id = finalId;
      
      session.user.name = (token.name as string | null | undefined) ?? null;
      session.user.email = (token.email as string | null | undefined) ?? null;
      session.user.image = (token.image as string | null | undefined) ?? null; // token.image je vlastně token.picture

      if (!session.user.id) {
          console.warn("[NextAuth] Session: session.user.id is empty. Original token.sub was:", token?.sub, "Original token.id was:", token?.id);
      }
      
      // (session as any).userIdFromToken = finalId; // Odstraněno testovací pole

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
