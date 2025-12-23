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

      if (!session || !session.user) {
         return errorResponse("Unauthorized", 401);
      }

      const eventId = (await params).id;
      const body = await req.json();
      const { pass_status } = body; // 'pass' | 'fail'

      if (!['pass', 'fail'].includes(pass_status)) {
         return errorResponse("Invalid status. Must be 'pass' or 'fail'", 400);
      }

      // Update events table
      // This triggers 'after_event_pass_fail_update' to update thesis progress
      const [result]: any[] = await pool.execute(
         `UPDATE events SET pass_status = ? WHERE id = ?`,
         [pass_status, eventId]
      );

      if (result.affectedRows === 0) {
         return errorResponse("Event not found", 404);
      }

      return successResponse({ message: `Event marked as ${pass_status}` });

   } catch (error) {
      return handleDbError(error);
   }
}
