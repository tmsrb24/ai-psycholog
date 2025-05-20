import NextAuth, { type NextAuthOptions } from "next-auth"; // Přidán import NextAuthOptions
import GoogleProvider from "next-auth/providers/google";

// MongoDB related imports and code removed

// Detailed logging for debugging
console.log("Environment variables check:");
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);

// Simplified NextAuth configuration
export const authOptions: NextAuthOptions = { // Extrahováno do konstanty a exportováno
  // Adapter removed
  providers: [
    // Only Google OAuth provider for now to simplify debugging
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
  
  // Session configuration
  session: {
    strategy: "jwt", // Using JWT strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Pages configuration
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  
  // Callbacks
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Sign in callback called with user:", user?.email, "profile:", profile);
      // Pokud používáme Google, můžeme zde ověřit, zda profil obsahuje 'sub'
      if (account?.provider === "google" && profile?.sub) {
        // Můžeme zde např. vytvořit/aktualizovat uživatele v naší DB, pokud bychom nepoužívali Supabase Auth
        // user.id by mělo být automaticky nastaveno NextAuth na profile.sub
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        token.id = user.id;
        if (account.provider === "google" && profile?.sub && !token.id) {
          token.id = profile.sub;
        }
        token.email = user.email ?? undefined; // Zajistí string | undefined
        token.name = user.name ?? undefined;   // Zajistí string | undefined
        token.image = user.image ?? undefined; // Zajistí string | undefined
        
        if (account.access_token) { // accessToken je volitelný v Account
          token.accessToken = account.access_token;
        }
        token.provider = account.provider;
        console.log("JWT callback - initial sign in. Token populated:", JSON.stringify(token));
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; 
        session.user.name = token.name ?? null; // Pokud je token.name undefined, přiřadí se null
        session.user.email = token.email ?? null; // Pokud je token.email undefined, přiřadí se null
        session.user.image = token.image ?? null; // Pokud je token.image undefined, přiřadí se null
      }
      return session;
    },
  },
  
  // Enable debug mode for detailed logs
  debug: true,
  
  // Error handling
  logger: {
    error(code, metadata) {
      console.error("NextAuth error:", { code, metadata });
    },
    warn(code) {
      console.warn("NextAuth warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth debug:", { code, metadata });
    }
  }
};

export default NextAuth(authOptions); // Použití konstanty
