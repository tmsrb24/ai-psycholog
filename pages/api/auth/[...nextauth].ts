import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-psycholog";
const options = {};
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Apple OAuth provider
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    
    // Email provider for magic link authentication
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "",
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@psychollog.cz",
    }),
    
    // Credentials provider for username/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        // Here you would usually fetch the user from the database
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // For now, we'll use a simple check
        // In a real app, you would check against the database
        const dbUser = await clientPromise.then((client: MongoClient) => 
          client.db().collection("users").findOne({ 
            email: credentials.email 
          })
        );
        
        if (!dbUser) {
          return null;
        }
        
        // Here you would check the password
        // For now, we'll just return the user
        // Convert MongoDB document to NextAuth User
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          role: dbUser.role
        };
      }
    })
  ],
  
  // Database session handling
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-key-change-in-production",
  },
  
  // Pages configuration
  pages: {
    signIn: "/auth/login",
    // Note: NextAuth.js doesn't have a built-in signUp page option
    // The registration page is handled separately
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  
  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role as string) || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  // Debug mode (enable in development only)
  debug: process.env.NODE_ENV === "development",
});
