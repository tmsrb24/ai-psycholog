import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

// Enhanced error handling for MongoDB connection
let clientPromise;
try {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables");
  } else {
    console.log("MongoDB URI exists in environment");
    const client = new MongoClient(uri);
    clientPromise = client.connect()
      .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        return null;
      });
  }
} catch (error) {
  console.error("Error setting up MongoDB connection:", error);
}

// Detailed logging for debugging
console.log("Environment variables check:");
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);

// Simplified NextAuth configuration
export default NextAuth({
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
    strategy: "jwt",
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
      // Add user info to token if available
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
      }
      // Add account info to token if available
      if (account) {
        token.accessToken = account.access_token as string;
        token.provider = account.provider as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        // Add custom properties to session using proper types
        session.accessToken = token.accessToken;
        session.provider = token.provider;
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
});
