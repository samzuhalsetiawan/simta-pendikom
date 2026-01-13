import { DefaultSession } from "next-auth";
import { User } from "@/types/user/user";

type AuthUser = {
   id: User["id"];
   role: "lecturer" | "student";
}

declare module "next-auth" {
   /**
    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
    */
   interface Session extends DefaultSession {
      user: AuthUser & DefaultSession["user"]
   }

   interface User extends AuthUser {}
}

declare module "next-auth/jwt" {
   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
   interface JWT extends AuthUser {}
}
