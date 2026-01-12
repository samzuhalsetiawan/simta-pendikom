import "server-only";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getStudentById } from "../student/get-student-by-id";
import { Student } from "@/types/student";

export const requireAuthenticatedAsStudent: () => Promise<Student> = cache(async () => {
   const session = await getServerSession(authOptions);
      if (!session) {
         return redirect("/login");
      };
      const user = session.user;
      switch (user.role) {
         case "lecturer":
            return redirect("/");
            
         case "student":
            const student = await getStudentById(user.id);
            if (!student) {
               const error = new Error(`authenticated user has role student but user id: ${user.id} is not found in student database`);
               console.error(error.message);
               throw error;
            };
            return student;
   
         default:
            const error = new Error("Unknown user role");
            console.error(error.message);
            throw error;
      }
})