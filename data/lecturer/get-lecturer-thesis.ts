import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Thesis, ThesisStatus } from "@/types/thesis";
import { Lecturer, LecturerRole } from "@/types/user/lecturer";

type GetLecturerThesisQueryRow = {
   id: number;
   title: string;
   progress_status: ThesisStatus;
   student: {
      id: number;
      nim: string;
      name: string;
      email: string;
      image: string;
      generation_year: number;
   };
   lecturers: {
      id: number;
      nip: string;
      name: string;
      email: string;
      image: string;
      is_admin: number;
      is_main: number;
      role: LecturerRole;
   }[];
};

export async function getLecturerThesis(id: number): Promise<Thesis[]> {
   const query = sql`
      SELECT 
        t.id, t.title, t.progress_status,
        JSON_OBJECT('id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image, 'generation_year', s.generation_year) AS student,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role, 'is_admin', l.is_admin, 'is_main', tl.is_main)
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

   return mapToThesis(rows) satisfies Thesis[];
}

const mapToThesis = (rows: GetLecturerThesisQueryRow[]) => {
   return rows.map((row: GetLecturerThesisQueryRow) => {

      const { progress_status, student, lecturers, ...rest } = row;

      return {
         ...rest,
         progress: progress_status,
         student: {
            ...student,
            generationYear: student.generation_year
         },
         lecturers: lecturers.map((lec) => {
            const { is_admin, is_main, ...lecturerRest } = lec;
            return {
               ...lecturerRest,
               isAdmin: !!is_admin,
               isMain: !!is_main
            };
         }),
      } satisfies Thesis;
   });
}