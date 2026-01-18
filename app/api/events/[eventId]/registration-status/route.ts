import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import sql from "sql-template-strings";

export async function GET(
   req: Request,
   { params }: { params: Promise<{ eventId: string }> }
) {
   const session = await getServerSession(authOptions);
   if (!session?.user?.id || session.user.role !== "student") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   }

   const { eventId } = await params;
   const eventIdNum = parseInt(eventId, 10);

   if (isNaN(eventIdNum)) {
      return new Response(JSON.stringify({ error: "Invalid event ID" }), { status: 400 });
   }

   const studentId = session.user.id;

   try {
      const [rows]: any = await pool.query(
         sql`SELECT 1 FROM event_attendees 
             WHERE event_id = ${eventIdNum} AND student_id = ${studentId}
             LIMIT 1`
      );

      return new Response(
         JSON.stringify({ isRegistered: rows.length > 0 }),
         { status: 200 }
      );
   } catch (error) {
      console.error("Error checking registration status:", error);
      return new Response(
         JSON.stringify({ error: "Failed to check registration status" }),
         { status: 500 }
      );
   }
}
