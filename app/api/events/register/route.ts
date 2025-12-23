import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { handleDbError, successResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || session.user.role !== "mahasiswa") {
         return errorResponse("Unauthorized", 401);
      }

      const body = await req.json();
      const { event_id } = body;

      if (!event_id) {
         return errorResponse("Missing event_id", 400);
      }

      // Call stored procedure register_attendee(student_id, event_id)
      await pool.execute(
         `CALL register_attendee(?, ?)`,
         [session.user.id, event_id]
      );

      return successResponse({ message: "Successfully registered for event" }, 201);

   } catch (error) {
      return handleDbError(error);
   }
}
