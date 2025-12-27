import pool from "@/lib/db";
import { handleError, successResponse } from "@/lib/api-utils";
import sql from "sql-template-strings";

interface Thesis {
   id: number;
   title: string;
   progress: "Pengajuan Judul" | "Seminar Proposal" | "Penelitian" | "Seminar Hasil" | "Sidang Akhir" | "Selesai";
   student: Student;
   lecturers: Lecturer[];
}

interface Student {
   id: number;
   nim: string;
   name: string;
   email: string;
   image: string | null;
}

interface Lecturer {
   id: number;
   nip: string;
   name: string;
   email: string;
   image: string | null;
   role: "Pembimbing" | "Penguji";
}

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

export async function GET() {
  try {
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
      ORDER BY t.id DESC
    `;

    const [rows]: any = await pool.query(query);

    // Transformasi data agar sesuai dengan interface Thesis
    const formattedData: Thesis[] = rows.map((row: any) => ({
      id: row.id,
      title: row.title || "Belum ada judul",
      progress: progressMap[row.progress_status] || row.progress_status,
      // MySQL mengembalikan JSON object sebagai string atau object tergantung driver/versi
      student: typeof row.student === 'string' ? JSON.parse(row.student) : row.student,
      lecturers: (typeof row.lecturers === 'string' ? JSON.parse(row.lecturers) : (row.lecturers || []))
        .map((lecturer: any) => ({
          ...lecturer,
          role: lecturerRoleMap[lecturer.role] || lecturer.role,
        } satisfies Lecturer)),
    } satisfies Thesis));

    return successResponse<Thesis[]>(formattedData);
  } catch (error: any) {
    return handleError(error);
  }
}