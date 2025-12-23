import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { handleDbError, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "dosen") {
         return errorResponse("Unauthorized", 401);
      }

      // Get pending approvals for this lecturer
      const [rows] = await pool.execute(
         `SELECT ea.*, e.type as event_type, e.event_date, e.location, t.title as thesis_title, s.name as student_name
          FROM event_approvals ea
          JOIN events e ON ea.event_id = e.id
          JOIN thesis t ON e.thesis_id = t.id
          JOIN student s ON t.student_id = s.id
          WHERE ea.lecturer_id = ? AND ea.approval_status = 'pending'`,
         [session.user.id]
      );

      return successResponse(rows);

   } catch (error) {
      return handleDbError(error);
   }
}
