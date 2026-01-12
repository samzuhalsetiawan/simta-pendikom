import "server-only";

import { authOptions } from "@/lib/auth";
import { Lecturer } from "@/types/user/lecturer";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getLecturerById } from "../lecturer/get-lecturer-by-id";

export const requireAuthenticatedAsLecturer: () => Promise<Lecturer> = cache(async () => {
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
            return lecturer;
         case "student":
            return redirect("/");
   
         default:
            const error = new Error("Unknown user role");
            console.error(error.message);
            throw error;
      }
})