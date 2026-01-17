"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThesisStatus, thesisStatus } from "@/types/thesis";

export type UpdateThesisProgressState = {
   success?: boolean;
   message?: string;
};

export async function updateThesisProgressAction(
   prevState: UpdateThesisProgressState | undefined,
   formData: {
      thesisId: number;
      newProgress: ThesisStatus;
   }
): Promise<UpdateThesisProgressState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "lecturer") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a lecturer"
         };
      }

      const lecturerId = session.user.id;
      const { thesisId, newProgress } = formData;

      // Validate newProgress is a valid ThesisStatus
      if (!thesisStatus.includes(newProgress)) {
         return {
            success: false,
            message: "Status progress tidak valid"
         };
      }

      // Verify lecturer is main supervisor for this thesis
      const [supervisorRows]: any = await pool.query(
         sql`SELECT 1 FROM thesis_lecturers 
             WHERE thesis_id = ${thesisId} 
             AND lecturer_id = ${lecturerId} 
             AND role = 'pembimbing'
             AND is_main = 1
             LIMIT 1`
      );

      if (supervisorRows.length === 0) {
         return {
            success: false,
            message: "Anda bukan pembimbing utama untuk skripsi ini"
         };
      }

      // Update thesis progress
      await pool.query(
         sql`UPDATE thesis SET progress_status = ${newProgress} WHERE id = ${thesisId}`
      );

      revalidatePath("/dashboard/lecturer");
      revalidatePath("/dashboard/student");

      return {
         success: true,
         message: "Progress skripsi berhasil diperbarui"
      };
   } catch (error) {
      console.error("Failed to update thesis progress:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
