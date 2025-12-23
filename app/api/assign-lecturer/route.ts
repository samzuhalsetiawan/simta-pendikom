import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { handleDbError, successResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "dosen") {
         return errorResponse("Unauthorized", 401);
      }

      const body = await req.json();
      const { studentId, lecturerId, role } = body;

      if (!studentId || !lecturerId || !role) {
         return errorResponse("Missing required fields", 400);
      }

      // Call assign_lecturer_to_student(lecturer_id, thesis_id, role)
      await pool.execute(
         `CALL assign_lecturer_to_student(?, ?, ?)`,
         [lecturerId, studentId, role]
      );

      return successResponse({ message: "Lecturer assigned successfully" }, 201);

   } catch (error) {
      return handleDbError(error);
   }
}
