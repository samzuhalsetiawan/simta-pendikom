import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import pool from "./db";

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
               const tableName = credentials.role === "mahasiswa" ? "student" : "lecturer";
               const idNumberColumn = credentials.role === "mahasiswa" ? "nim" : "nip";

               const [rows] = await pool.execute(
                  `SELECT id, ${idNumberColumn} as idNumber, name, email, image, password FROM ${tableName} WHERE ${idNumberColumn} = ?`,
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
                  idNumber: user.idNumber,
                  name: user.name,
                  email: user.email,
                  image: user.image,
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
            token.id = user.id;
            token.idNumber = user.idNumber;
            token.role = user.role;
         }
         return token;
      },
      async session({ session, token }) {
         if (session.user) {
            session.user.id = token.id as string;
            session.user.idNumber = token.idNumber as string;
            session.user.role = token.role as string;
         }
         return session;
      },
   },
   pages: {
      signIn: "/login",
   },
   session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, // 7 days
   },
   secret: process.env.NEXTAUTH_SECRET,
};
