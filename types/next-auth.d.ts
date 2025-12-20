import { DefaultSession } from "next-auth";

declare module "next-auth" {
   /**
    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
    */
   interface Session extends DefaultSession {
      user: {
         id: string;
         idNumber: string;
         role: string;
      } & DefaultSession["user"]
   }

   interface User {
      idNumber: string;
      role: string;
   }
}

declare module "next-auth/jwt" {
   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
   interface JWT {
      id: string;
      idNumber: string;
      role: string;
   }
}
