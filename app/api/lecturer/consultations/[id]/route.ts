import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { handleDbError, successResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PATCH(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "dosen") {
         return errorResponse("Unauthorized", 401);
      }

      const consultationId = (await params).id;
      const body = await req.json();
      const { request_status, lecturer_note } = body;

      // Update consultations table
      const [result]: any[] = await pool.execute(
         `UPDATE consultations 
          SET request_status = ?, lecturer_note = ?
          WHERE id = ? AND lecturer_id = ?`,
         [request_status || 'pending', lecturer_note || '', consultationId, session.user.id]
      );

      if (result.affectedRows === 0) {
         return errorResponse("Consultation not found or not owned by you", 404);
      }

      return successResponse({ message: "Consultation updated" });

   } catch (error) {
      return handleDbError(error);
   }
}
