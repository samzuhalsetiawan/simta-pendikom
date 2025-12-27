import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { handleError, successResponse } from "@/lib/api-utils";
import sql from "sql-template-strings";

const progressMap: Record<string, string> = {
  pengajuan_judul: "Pengajuan Judul",
  seminar_proposal: "Seminar Proposal",
  penelitian: "Penelitian",
  seminar_hasil: "Seminar Hasil",
  ujian_akhir: "Sidang Akhir",
  selesai: "Selesai",
};

const lecturerRoleMap: Record<string, string> = {
  pembimbing: "Pembimbing",
  penguji: "Penguji",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lecturerId } = await params;

    const query = sql`
      SELECT 
        t.id,
        t.title,
        t.progress_status,
        JSON_OBJECT(
          'id', s.id,
          'nim', s.nim,
          'name', s.name,
          'email', s.email,
          'image', s.image
        ) AS student,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', l.id,
              'nip', l.nip,
              'name', l.name,
              'email', l.email,
              'image', l.image,
              'role', tl.role
            )
          )
          FROM thesis_lecturers tl
          JOIN lecturer l ON tl.lecturer_id = l.id
          WHERE tl.thesis_id = t.id
        ) AS lecturers
      FROM thesis t
      JOIN student s ON t.student_id = s.id
      WHERE t.id IN (
        SELECT thesis_id 
        FROM thesis_lecturers 
        WHERE lecturer_id = ${lecturerId}
      )
      ORDER BY t.id DESC
    `;

    const [rows]: any = await pool.query(query);

    const formattedData = rows.map((row: any) => {
      const studentData = typeof row.student === 'string' ? JSON.parse(row.student) : row.student;
      const lecturersList = typeof row.lecturers === 'string' ? JSON.parse(row.lecturers) : (row.lecturers || []);

      return {
        id: row.id,
        title: row.title || "Belum ada judul",
        progress: progressMap[row.progress_status] || row.progress_status,
        student: studentData,
        lecturers: lecturersList.map((lec: any) => ({
          ...lec,
          role: lecturerRoleMap[lec.role] || lec.role
        })),
      };
    });

    return successResponse(formattedData);
  } catch (error: any) {
    return handleError(error);
  }
}