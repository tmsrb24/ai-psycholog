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
      console.log("Sign in callback called with user:", user?.email);
      return true;
    },
    async jwt({ token, user, account }) {
      // Add user info to token if available (on initial sign in)
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string; // Add name to token
        token.image = user.image as string; // Add image to token
      }
      // Add account info to token if available (on initial sign in)
      if (account) {
        token.accessToken = account.access_token as string;
        token.provider = account.provider as string;
      }
      return token;
    },
    async session({ session, token }) { // For JWT strategy, `user` (from DB) is not available here. Token is the source.
      console.log("Session callback (JWT strategy). Token:", JSON.stringify(token), "Initial session:", JSON.stringify(session));
      // Populate session.user with info from the token
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      // If you need custom properties like accessToken directly on the session object:
      // if (token) {
      //   (session as any).accessToken = token.accessToken;
      //   (session as any).provider = token.provider;
      // }
      console.log("Final session object being returned:", JSON.stringify(session));
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
