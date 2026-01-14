import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getLecturerEvent } from "@/data/lecturer/get-lecturer-event";
import { getStudentEvent } from "@/data/student/get-student-event";
import { parse } from "date-fns";

function parseDate(dateString: string): Date | undefined {
   if (!dateString) return;
   try {
      // Parse format: 31-01-2025 (DD-MM-YYYY)
      return parse(dateString, "dd-MM-yyyy", new Date());
   } catch {
      return;
   }
}

export async function GET(req: Request) {
   const session = await getServerSession(authOptions);
   if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   }

   const user = session.user;
   // const user = { id: 1, role: "student" }; // TODO: Remove hardcoded user
   const url = new URL(req.url);
   const startParam = url.searchParams.get("from");
   const endParam = url.searchParams.get("to");

   const startDate = startParam ? parseDate(startParam) : undefined;
   const endDate = endParam ? parseDate(endParam) : undefined;

   if ((startParam && !startDate) || (endParam && !endDate)) {
      return new Response(JSON.stringify({ error: "Invalid date format. Use DD-MM-YYYY" }), { status: 400 });
   }

   try {
      if (user.role === "lecturer") {
         const events = await getLecturerEvent(user.id, startDate, endDate);
         return new Response(JSON.stringify(events), { status: 200 });
      } else if (user.role === "student") {
         const events = await getStudentEvent(user.id, startDate, endDate);
         return new Response(JSON.stringify(events), { status: 200 });
      } else {
         return new Response(JSON.stringify({ error: "Invalid user role" }), { status: 400 });
      }
   } catch (error) {
      console.error("Error fetching events:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch events" }), { status: 500 });
   }
}