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
               const tableName = credentials.role === "student" ? "student"
                  : credentials.role === "lecturer" ? "lecturer"
                     : undefined;
               if (!tableName) {
                  throw new Error("Invalid role");
               }
               const idNumberColumn = credentials.role === "student" ? "nim"
                  : credentials.role === "lecturer" ? "nip"
                     : undefined;
               if (!idNumberColumn) {
                  throw new Error("Invalid role");
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
                  role: credentials.role as "lecturer" | "student",
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