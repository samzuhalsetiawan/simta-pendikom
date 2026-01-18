"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type RegisterEventState = {
   success: boolean;
   message: string;
};

export async function registerEventAction(eventId: number): Promise<RegisterEventState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "student") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a student"
         };
      }

      const studentId = session.user.id;

      // Get event details
      const [eventRows]: any = await pool.query(
         sql`SELECT e.id, e.thesis_id, e.event_date, e.type, t.student_id as thesis_student_id
             FROM events e
             JOIN thesis t ON e.thesis_id = t.id
             WHERE e.id = ${eventId}
             LIMIT 1`
      );

      if (eventRows.length === 0) {
         return {
            success: false,
            message: "Event tidak ditemukan"
         };
      }

      const event = eventRows[0];

      // Check if student is the thesis owner
      if (event.thesis_student_id === studentId) {
         return {
            success: false,
            message: "Anda tidak dapat mendaftar pada event milik sendiri"
         };
      }

      // Check if event has already started
      const eventDate = new Date(event.event_date);
      if (eventDate < new Date()) {
         return {
            success: false,
            message: "Event sudah dimulai atau selesai"
         };
      }

      // Check if already registered
      const [existingRows]: any = await pool.query(
         sql`SELECT 1 FROM event_attendees 
             WHERE event_id = ${eventId} AND student_id = ${studentId}
             LIMIT 1`
      );

      if (existingRows.length > 0) {
         return {
            success: false,
            message: "Anda sudah terdaftar pada event ini"
         };
      }

      // Insert registration
      await pool.query(
         sql`INSERT INTO event_attendees (event_id, student_id)
             VALUES (${eventId}, ${studentId})`
      );

      revalidatePath("/dashboard/student");

      return {
         success: true,
         message: "Berhasil mendaftar sebagai peserta"
      };
   } catch (error) {
      console.error("Failed to register for event:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
