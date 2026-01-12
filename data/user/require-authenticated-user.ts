import "server-only";

import { authOptions } from "@/lib/auth";
import { User } from "@/types/user/user";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getLecturerById } from "../lecturer/get-lecturer-by-id";
import { getStudentById } from "../student/get-student-by-id";

export const requireAuthenticatedUser: () => Promise<User> = cache(async () => {
   const session = await getServerSession(authOptions);
   if (!session) {
      return redirect("/login");
   };
   const user = session.user;
   switch (user.role) {
      case "lecturer":
         const lecturer = await getLecturerById(user.id);
         if (!lecturer) {
            const error = new Error(`authenticated user has role lecturer but user id: ${user.id} is not found in lecturer database`);
            console.error(error.message);
            throw error;
         };
         return {
            name: lecturer.name,
            email: lecturer.email,
            image: lecturer.image,
            role: "lecturer",
         };
      case "student":
         const student = await getStudentById(user.id);
         if (!student) {
            const error = new Error(`authenticated user has role student but user id: ${user.id} is not found in student database`);
            console.error(error.message);
            throw error;
         };
         return {
            name: student.name,
            email: student.email,
            image: student.image,
            role: "student",
         };

      default:
         const error = new Error("Unknown user role");
         console.error(error.message);
         throw error;
   }
});