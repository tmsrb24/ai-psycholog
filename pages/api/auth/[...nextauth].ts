import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local or Vercel environment variables");
}

const uri = process.env.MONGODB_URI;

// Standard Next.js MongoDB connection pattern
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  const client = new MongoClient(uri);
  clientPromise = client.connect();
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
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "psycholog_db", // Můžete si zvolit jiný název databáze
  }),
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
    strategy: "database", // Používá databázi pro ukládání sezení
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
    async session({ session, token, user }) { // `user` is the user from the database for "database" strategy
      console.log("Session callback. User from DB:", JSON.stringify(user), "Token:", JSON.stringify(token), "Initial session:", JSON.stringify(session));
      // Populate session.user with essential fields from the database user
      if (user && session.user) { // `user` is the user object from the database
        session.user.id = user.id;
        session.user.name = user.name; // Ensure these fields are on your user model in DB
        session.user.email = user.email;
        session.user.image = user.image;
      }
      // If you were previously adding custom properties like accessToken to the session object directly
      // (not session.user), and these were populated into `token` by the `jwt` callback:
      if (token) {
        // Example: if you need these directly on session and they are on the token
        // (session as any).accessToken = token.accessToken;
        // (session as any).provider = token.provider;
      }
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
});
