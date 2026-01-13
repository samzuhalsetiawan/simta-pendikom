import "server-only";

import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { pool } from "./db";

export const authOptions: NextAuthOptions = {
   providers: [
      CredentialsProvider({
         id: "credentials",
         name: "Credentials",
         credentials: {
            role: { label: "Role", type: "text" },
            idNumber: { label: "ID Number", type: "text" },
            password: { label: "Password", type: "password" },
         },
         async authorize(credentials) {
            if (!credentials?.role || !credentials?.idNumber || !credentials?.password) {
               throw new Error("Missing credentials");
            }

            try {

               let tableName: "student" | "lecturer";
               switch (credentials.role) {
                  case "student":
                     tableName = "student";
                     break;
                  case "lecturer":
                     tableName = "lecturer";
                     break;
                  default:
                     throw new Error("Invalid role");
               }

               let idNumberColumn: "nip" | "nim";
               switch (tableName) {
                  case "student":
                     idNumberColumn = "nim";
                     break;
                  case "lecturer":
                     idNumberColumn = "nip";
                     break;
               }

               const [rows] = await pool.execute(
                  `SELECT id, ${idNumberColumn} as idNumber, password FROM ${tableName} WHERE ${idNumberColumn} = ?`,
                  [credentials.idNumber]
               );

               if (!Array.isArray(rows) || rows.length === 0) {
                  throw new Error("Invalid credentials");
               }

               const user = rows[0] as any;

               const passwordMatch = await bcryptjs.compare(credentials.password, user.password);

               if (!passwordMatch) {
                  throw new Error("Invalid credentials");
               }

               return {
                  id: user.id,
                  role: credentials.role,
               };
            } catch (error) {
               console.error("Auth error:", error);
               throw new Error("Authentication failed");
            }
         },
      }),
   ],
   callbacks: {
      async jwt({ token, user }) {
         if (user) {
            token.id = Number(user.id);
            token.role = user.role;
         }
         return token;
      },
      async session({ session, token }) {
         if (session.user) {
            session.user.id = token.id;
            session.user.role = token.role;
         }
         return session;
      },
   },
   pages: {
      signIn: "/login",
   },
   session: {
      strategy: "jwt",
      maxAge: 1 * 60 * 60, // 1 hours
   },
   secret: process.env.NEXTAUTH_SECRET,
};