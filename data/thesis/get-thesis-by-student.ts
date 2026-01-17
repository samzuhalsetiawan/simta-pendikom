import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Thesis, ThesisStatus } from "@/types/thesis";
import { LecturerRole } from "@/types/user/lecturer";

type GetThesisByStudentQueryRow = {
   id: number;
   title?: string;
   progress_status: ThesisStatus;
   student: {
      id: number;
      nim: string;
      name: string;
      email?: string;
      image?: string;
      generation_year: number;
   };
   lecturers: {
      id: number;
      nip: string;
      name: string;
      email?: string;
      image?: string;
      is_admin: boolean;
      role: LecturerRole;
   }[] | null;
};

export async function getThesisByStudent(studentId: number): Promise<Thesis | undefined> {
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
          'image', s.image,
          'generation_year', s.generation_year
        ) AS student,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', l.id,
              'nip', l.nip,
              'name', l.name,
              'email', l.email,
              'image', l.image,
              'role', tl.role,
              'is_admin', l.is_admin
            )
          )
          FROM thesis_lecturers tl
          JOIN lecturer l ON tl.lecturer_id = l.id
          WHERE tl.thesis_id = t.id
        ) AS lecturers
      FROM thesis t
      JOIN student s ON t.student_id = s.id
      WHERE t.student_id = ${studentId}
      LIMIT 1
    `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetThesisByStudentQueryRow[];

   if (rows.length === 0) return;

   const row: GetThesisByStudentQueryRow = rows[0];

   return mapToThesis(row) satisfies Thesis;
}

const mapToThesis = (row: GetThesisByStudentQueryRow) => {
   const { progress_status, lecturers, student, ...rest } = row;
   return {
      ...rest,
      progress: progress_status,
      student: {
         id: student.id,
         nim: student.nim,
         name: student.name,
         email: student.email,
         image: student.image,
         generationYear: student.generation_year
      },
      lecturers: lecturers?.map(lec => {
         const { is_admin, ...lecturerRest } = lec;
         return {
            ...lecturerRest,
            isAdmin: !!is_admin
         }
      }) ?? [],
   } satisfies Thesis
}
