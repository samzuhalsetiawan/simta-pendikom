import { DefaultSession } from "next-auth";
import { User } from "@/types/user/user";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: User["id"];
      role: "lecturer" | "student";
    } & DefaultSession["user"];
  }

  interface User {
    id: User["id"];
    role: "lecturer" | "student";
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: User["id"];
    role: "lecturer" | "student";
  }
}
