"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventType } from "@/types/event/event";

export type RequestEventState = {
   success?: boolean;
   message?: string;
};

const validEventTypes = ["seminar_proposal", "seminar_hasil", "pendadaran"] as const;

export async function requestEventAction(
   prevState: RequestEventState | undefined,
   formData: {
      eventType: Exclude<EventType, "konsultasi">;
      datetime: string;
      location: string;
   }
): Promise<RequestEventState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "student") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a student"
         };
      }

      const studentId = session.user.id;
      const { eventType, datetime, location } = formData;

      // Validate event type
      if (!validEventTypes.includes(eventType)) {
         return {
            success: false,
            message: "Tipe event tidak valid"
         };
      }

      // Validate required fields
      if (!datetime || !location) {
         return {
            success: false,
            message: "Waktu dan lokasi harus diisi"
         };
      }

      // Get thesis_id for this student
      const [thesisRows]: any = await pool.query(
         sql`SELECT id FROM thesis WHERE student_id = ${studentId} LIMIT 1`
      );

      if (thesisRows.length === 0) {
         return {
            success: false,
            message: "Anda belum memiliki skripsi terdaftar"
         };
      }

      const thesisId = thesisRows[0].id;

      // Check if there's already a pending or approved event of the same type
      const [existingEvents]: any = await pool.query(
         sql`SELECT id FROM events 
             WHERE thesis_id = ${thesisId} 
             AND type = ${eventType}
             AND request_status IN ('requested', 'approved')
             LIMIT 1`
      );

      if (existingEvents.length > 0) {
         return {
            success: false,
            message: `Sudah ada jadwal ${eventType.replace("_", " ")} yang sedang diproses atau disetujui`
         };
      }

      // Insert event (triggers will auto-create approval records)
      const eventDate = new Date(datetime);
      await pool.query(
         sql`INSERT INTO events (thesis_id, type, event_date, location, request_status)
             VALUES (${thesisId}, ${eventType}, ${eventDate}, ${location}, 'requested')`
      );

      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/lecturer");

      return {
         success: true,
         message: `Jadwal ${eventType.replace("_", " ")} berhasil diajukan`
      };
   } catch (error) {
      console.error("Failed to request event:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
