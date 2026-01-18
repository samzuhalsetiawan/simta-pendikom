"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type RespondEventState = {
   success?: boolean;
   message?: string;
};

export type EventApprovalResponse = "approved" | "rejected";

export async function respondEventAction(
   prevState: RespondEventState | undefined,
   formData: {
      eventId: number;
      response: EventApprovalResponse;
   }
): Promise<RespondEventState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "lecturer") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a lecturer"
         };
      }

      const lecturerId = session.user.id;
      const { eventId, response } = formData;

      // Validate approval record exists and is still pending
      const [approvalRows]: any = await pool.query(
         sql`SELECT 1 FROM event_approvals 
             WHERE event_id = ${eventId} 
             AND lecturer_id = ${lecturerId} 
             AND approval_status = 'pending'
             LIMIT 1`
      );

      if (approvalRows.length === 0) {
         return {
            success: false,
            message: "Permintaan tidak ditemukan atau sudah diproses"
         };
      }

      // Update approval status (trigger will update event status if needed)
      await pool.query(
         sql`UPDATE event_approvals
             SET approval_status = ${response}
             WHERE event_id = ${eventId} AND lecturer_id = ${lecturerId}`
      );

      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/lecturer");

      const successMessage = response === "approved"
         ? "Jadwal berhasil disetujui"
         : "Jadwal berhasil ditolak";

      return {
         success: true,
         message: successMessage
      };
   } catch (error) {
      console.error("Failed to respond to event:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
