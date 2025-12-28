"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentDashboard } from "./student-dashboard";
import { LecturerDashboard } from "./lecturer-dashboard";

export default async function DashboardPage() {
   const session = await getServerSession(authOptions);

   if (!session || !session.user) {
      redirect("/login");
   }

   const { role } = session.user;

   return (
      <div className="container mx-auto py-10 px-4">
         {role === "mahasiswa" && <StudentDashboard />}
         {role === "dosen" && <LecturerDashboard />}
      </div>
   );
}
