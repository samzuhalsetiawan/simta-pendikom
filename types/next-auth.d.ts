import { DefaultSession } from "next-auth";

declare module "next-auth" {
   /**
    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
    */
   interface Session extends DefaultSession {
      user: {
         id: number;
         role: "lecturer" | "student";
      } & DefaultSession["user"]
   }

   interface User {
      id: number;
      role: "lecturer" | "student";
   }
}

declare module "next-auth/jwt" {
   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
   interface JWT {
      id: number;
      role: "lecturer" | "student";
   }
}
