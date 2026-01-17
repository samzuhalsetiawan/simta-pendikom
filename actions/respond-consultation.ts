"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type RespondConsultationState = {
   success?: boolean;
   message?: string;
};

export type ConsultationResponse = "accepted" | "rejected";

export async function respondConsultationAction(
   prevState: RespondConsultationState | undefined,
   formData: {
      consultationId: number;
      response: ConsultationResponse;
      note?: string;
   }
): Promise<RespondConsultationState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "lecturer") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a lecturer"
         };
      }

      const lecturerId = session.user.id;
      const { consultationId, response, note } = formData;

      // Validate consultation exists and belongs to this lecturer
      const [consultationRows]: any = await pool.query(
         sql`SELECT id FROM consultations 
             WHERE id = ${consultationId} AND lecturer_id = ${lecturerId} AND request_status = 'pending'
             LIMIT 1`
      );

      if (consultationRows.length === 0) {
         return {
            success: false,
            message: "Konsultasi tidak ditemukan atau sudah diproses"
         };
      }

      // Update consultation status
      const query = sql`
         UPDATE consultations
         SET request_status = ${response}
      `;

      if (note && response === "rejected") {
         query.append(sql`, lecturer_note = ${note}`);
      }

      query.append(sql` WHERE id = ${consultationId}`);

      await pool.query(query);

      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/lecturer");

      const successMessage = response === "accepted"
         ? "Konsultasi berhasil diterima"
         : "Konsultasi berhasil ditolak";

      return {
         success: true,
         message: successMessage
      };
   } catch (error) {
      console.error("Failed to respond to consultation:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
