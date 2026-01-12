import "server-only";

import { pool } from "@/lib/db";
import { LECTURER_ROLE_LABELS, LecturerRoleRaw } from "@/types/user/lecturer";
import { Thesis, THESIS_STATUS_LABELS, ThesisStatusRaw } from "@/types/thesis";
import sql from "sql-template-strings";

type GetLecturerThesisQueryRow = {
   id: number;
   title: string;
   progress_status: ThesisStatusRaw;
   student: {
      id: number;
      nim: string;
      name: string;
      email: string;
      image: string;
   };
   lecturers: {
      id: number;
      nip: string;
      name: string;
      email: string;
      image: string;
      role: LecturerRoleRaw;
   }[];
};

export async function getLecturerThesis(id: number): Promise<Thesis[]> {
   const query = sql`
      SELECT 
        t.id, t.title, t.progress_status,
        JSON_OBJECT('id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image) AS student,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role)
          )
          FROM thesis_lecturers tl
          JOIN lecturer l ON tl.lecturer_id = l.id
          WHERE tl.thesis_id = t.id
        ) AS lecturers
      FROM thesis t
      JOIN student s ON t.student_id = s.id
      WHERE t.id IN (SELECT thesis_id FROM thesis_lecturers WHERE lecturer_id = ${id})
      ORDER BY t.id DESC
    `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetLecturerThesisQueryRow[];

   return rows.map((row: GetLecturerThesisQueryRow) => {
      // JSON object bisa menjadi string atau object tergantung driver/versi dbms
      const studentData: typeof row.student = typeof row.student === 'string' ? JSON.parse(row.student) : row.student;
      const lecturersList: typeof row.lecturers = typeof row.lecturers === 'string' ? JSON.parse(row.lecturers) : (row.lecturers || []);

      return {
         id: row.id,
         title: row.title || "Belum ada judul",
         progress: (THESIS_STATUS_LABELS)[row.progress_status] || row.progress_status,
         student: studentData,
         lecturers: lecturersList.map((lec: typeof row.lecturers[0]) => ({
            ...lec,
            role: (LECTURER_ROLE_LABELS)[lec.role] || lec.role
         })),
      } satisfies Thesis;
   });
}