import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Thesis, ThesisStatus } from "@/types/thesis";
import { Lecturer, LecturerRole } from "@/types/user/lecturer";

type GetAllThesisQueryRow = {
  id: number;
  title?: string;
  progress_status: ThesisStatus;
  student: {
    id: number;
    nim: string;
    name: string;
    email?: string;
    image?: string;
  };
  lecturers: {
    id: number;
    nip: string;
    name: string;
    email?: string;
    image?: string;
    is_admin: boolean;
    role: LecturerRole;
  }[];
};

export async function getAllThesis(): Promise<Thesis[]> {
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
              'role', tl.role,
              'is_admin', l.is_admin,
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
  rows satisfies GetAllThesisQueryRow[];

  return mapToThesis(rows) satisfies Thesis[]
}

const mapToThesis = (rows: GetAllThesisQueryRow[]) => {
   return rows.map((row: GetAllThesisQueryRow) => {

      const { progress_status, lecturers, ...rest } = row;

      return {
         ...rest,
         progress: progress_status,
         lecturers: lecturers.map((lec) => {
            const { is_admin, ...lecturerRest } = lec;
            return {
               ...lecturerRest,
               isAdmin: is_admin
            } satisfies Lecturer;
         }),
      } satisfies Thesis;
   });
}