"use server";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type UpdateThesisTitleState = {
   success?: boolean;
   message?: string;
};

export async function updateThesisTitleAction(
   prevState: UpdateThesisTitleState | undefined,
   formData: { title: string }
): Promise<UpdateThesisTitleState> {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "student") {
         return {
            success: false,
            message: "Unauthorized: Must be logged in as a student"
         };
      }

      const studentId = session.user.id;
      const { title } = formData;

      if (!title || title.trim().length === 0) {
         return {
            success: false,
            message: "Judul tidak boleh kosong"
         };
      }

      // Update thesis title for the student
      const query = sql`
         UPDATE thesis 
         SET title = ${title.trim()} 
         WHERE student_id = ${studentId}
      `;

      const [result]: any = await pool.query(query);

      if (result.affectedRows === 0) {
         return {
            success: false,
            message: "Thesis tidak ditemukan"
         };
      }

      revalidatePath("/dashboard/student");
      return { success: true, message: "Judul berhasil diperbarui" };
   } catch (error) {
      console.error("Failed to update thesis title:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      };
   }
}
