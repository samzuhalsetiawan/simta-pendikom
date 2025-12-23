import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { handleDbError, successResponse, errorResponse } from "@/lib/api-utils";
import sql from "sql-template-strings";

export async function GET() {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "mahasiswa") {
         return errorResponse("Unauthorized", 401);
      }

      const connection = await pool.getConnection();

      try {
         // 1. Get Thesis Details
         // sql
         const [thesisRows]: any[] = await connection.execute(
            sql`SELECT id, title, progress_status FROM thesis WHERE student_id = ${session.user.id}`
         );

         if (thesisRows.length === 0) {
            return successResponse(null); // No thesis yet
         }

         const thesis = thesisRows[0];

         // 2. Get Assigned Lecturers
         const [lecturerRows]: any[] = await connection.execute(
            sql`SELECT l.id, l.name, l.email, tl.role 
             FROM thesis_lecturers tl
             JOIN lecturer l ON tl.lecturer_id = l.id
             WHERE tl.thesis_id = ${thesis.id}`
         );

         return successResponse({
            ...thesis,
            lecturers: lecturerRows,
         });
      } finally {
         connection.release();
      }
   } catch (error) {
      return handleDbError(error);
   }
}
