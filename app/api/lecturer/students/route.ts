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

      // Get students where this lecturer is assigned (Supervisor or Examiner)
      const [rows] = await pool.execute(
         `SELECT s.id, s.nim, s.name, s.email, t.title as thesis_title, t.progress_status, tl.role
          FROM student s
          JOIN thesis t ON s.id = t.student_id
          JOIN thesis_lecturers tl ON t.id = tl.thesis_id
          WHERE tl.lecturer_id = ?
          ORDER BY s.name ASC`,
         [session.user.id]
      );

      return successResponse(rows);

   } catch (error) {
      return handleDbError(error);
   }
}
