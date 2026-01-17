"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type RequestConsultationState = {
   success?: boolean;
   message?: string;
};

export async function requestConsultationAction(
   prevState: RequestConsultationState | undefined,
   formData: {
      lecturerId: number;
      datetime: string;
      location: string;
      topic: string;
   }
): Promise<RequestConsultationState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "student") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a student"
         };
      }

      const studentId = session.user.id;
      const { lecturerId, datetime, location, topic } = formData;

      // Validate required fields
      if (!lecturerId || !datetime || !location || !topic) {
         return {
            success: false,
            message: "Semua field harus diisi"
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

      // Validate that lecturer is assigned to this thesis
      const [lecturerRows]: any = await pool.query(
         sql`SELECT 1 FROM thesis_lecturers 
             WHERE thesis_id = ${thesisId} AND lecturer_id = ${lecturerId} 
             LIMIT 1`
      );

      if (lecturerRows.length === 0) {
         return {
            success: false,
            message: "Dosen tidak terdaftar sebagai pembimbing/penguji Anda"
         };
      }

      // Insert consultation request
      const consultationDate = new Date(datetime);
      const query = sql`
         INSERT INTO consultations (thesis_id, lecturer_id, consultation_date, location, topic, request_status)
         VALUES (${thesisId}, ${lecturerId}, ${consultationDate}, ${location}, ${topic}, 'pending')
      `;

      await pool.query(query);

      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/lecturer");

      return {
         success: true,
         message: "Permintaan konsultasi berhasil dikirim"
      };
   } catch (error) {
      console.error("Failed to request consultation:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
