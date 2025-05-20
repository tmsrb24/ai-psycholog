import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID. */
      id: string;
    } & DefaultSession["user"]; // Zachová původní name, email, image z DefaultSession
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    // Zde můžete přidat další vlastnosti k User objektu, pokud je potřeba
    // Například, pokud byste chtěli id přímo na User objektu z providera
    // id: string; // Pokud byste chtěli id i zde
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    id: string; // Přidáno id do JWT tokenu
    accessToken?: string; // Přidáno pro accessToken z účtu
    provider?: string; // Přidáno pro providera účtu
  }
}
