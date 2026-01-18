"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type RespondEventPassState = {
   success?: boolean;
   message?: string;
};

export type EventPassResponse = "pass" | "fail";

export async function respondEventPassAction(
   prevState: RespondEventPassState | undefined,
   formData: {
      eventId: number;
      response: EventPassResponse;
   }
): Promise<RespondEventPassState> {
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

      // Validate lecturer is main supervisor for this event's thesis
      const [mainSupervisorRows]: any = await pool.query(
         sql`SELECT 1 FROM events e
             JOIN thesis_lecturers tl ON e.thesis_id = tl.thesis_id
             WHERE e.id = ${eventId}
             AND tl.lecturer_id = ${lecturerId}
             AND tl.role = 'pembimbing'
             AND tl.is_main = 1
             LIMIT 1`
      );

      if (mainSupervisorRows.length === 0) {
         return {
            success: false,
            message: "Anda bukan pembimbing utama untuk skripsi ini"
         };
      }

      // Validate event is approved and pass_status is pending
      const [eventRows]: any = await pool.query(
         sql`SELECT request_status, pass_status, event_date FROM events WHERE id = ${eventId}`
      );

      if (eventRows.length === 0) {
         return {
            success: false,
            message: "Event tidak ditemukan"
         };
      }

      const eventData = eventRows[0];
      if (eventData.request_status !== 'approved') {
         return {
            success: false,
            message: "Event belum disetujui"
         };
      }

      if (eventData.pass_status !== 'pending') {
         return {
            success: false,
            message: "Keputusan sudah diberikan sebelumnya"
         };
      }

      // Update pass_status (trigger will update thesis progress if pass)
      await pool.query(
         sql`UPDATE events SET pass_status = ${response} WHERE id = ${eventId}`
      );

      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/lecturer");

      const successMessage = response === "pass"
         ? "Mahasiswa dinyatakan LULUS"
         : "Mahasiswa dinyatakan TIDAK LULUS";

      return {
         success: true,
         message: successMessage
      };
   } catch (error) {
      console.error("Failed to respond to event pass:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
