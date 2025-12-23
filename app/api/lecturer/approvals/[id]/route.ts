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

      const eventId = (await params).id;
      const body = await req.json();
      const { approval_status } = body;

      if (!['approved', 'rejected'].includes(approval_status)) {
         return errorResponse("Invalid status", 400);
      }

      // Update event_approvals table
      // This will trigger 'after_approval_update_check_status'
      const [result]: any[] = await pool.execute(
         `UPDATE event_approvals 
          SET approval_status = ? 
          WHERE event_id = ? AND lecturer_id = ?`,
         [approval_status, eventId, session.user.id]
      );

      if (result.affectedRows === 0) {
         return errorResponse("Approval record not found or already processed", 404);
      }

      return successResponse({ message: `Event ${approval_status}` });

   } catch (error) {
      return handleDbError(error);
   }
}
