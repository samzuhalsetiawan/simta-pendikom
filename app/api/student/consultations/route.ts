import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { handleDbError, successResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function GET() {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "mahasiswa") {
         return errorResponse("Unauthorized", 401);
      }

      // Fetch all consultations for this student's thesis
      // Join with lecturer to get names
      const query = `
         SELECT c.*, l.name as lecturer_name 
         FROM consultations c
         JOIN thesis t ON c.thesis_id = t.id
         JOIN lecturer l ON c.lecturer_id = l.id
         WHERE t.student_id = ?
         ORDER BY c.consultation_date DESC
      `;

      const [rows] = await pool.execute(query, [session.user.id]);
      return successResponse(rows);

   } catch (error) {
      return handleDbError(error);
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "mahasiswa") {
         return errorResponse("Unauthorized", 401);
      }

      const body = await req.json();
      const { lecturer_id, topic, consultation_date } = body;

      if (!lecturer_id || !topic) {
         return errorResponse("Missing required fields", 400);
      }

      const connection = await pool.getConnection();

      try {
         // 1. Get Student's Thesis ID
         const [thesisRows]: any[] = await connection.execute(
            `SELECT id FROM thesis WHERE student_id = ?`,
            [session.user.id]
         );

         if (thesisRows.length === 0) {
            return errorResponse("Thesis not found", 404);
         }

         const thesisId = thesisRows[0].id;

         // 2. Insert Consultation (This will trigger 'before_consultation_insert' validation)
         // Note: consultation_date is optional, defaults to CURRENT_TIMESTAMP in DB if needed, 
         // but typically user might specify a requested time or just 'now'.
         // If passed, use it, else let DB default.

         let query = `INSERT INTO consultations (thesis_id, lecturer_id, topic) VALUES (?, ?, ?)`;
         let params = [thesisId, lecturer_id, topic];

         if (consultation_date) {
            query = `INSERT INTO consultations (thesis_id, lecturer_id, topic, consultation_date) VALUES (?, ?, ?, ?)`;
            params = [thesisId, lecturer_id, topic, consultation_date];
         }

         await connection.execute(query, params);

         return successResponse({ message: "Consultation requested successfully" }, 201);

      } finally {
         connection.release();
      }
   } catch (error) {
      return handleDbError(error);
   }
}
