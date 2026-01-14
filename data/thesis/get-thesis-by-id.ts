import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Thesis, ThesisStatus } from "@/types/thesis";
import { LecturerRole } from "@/types/user/lecturer";

type GetThesisByIdQueryRow = {
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

export async function getThesisById(id: number): Promise<Thesis | undefined> {
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
              'is_admin', l.is_admin
            )
          )
          FROM thesis_lecturers tl
          JOIN lecturer l ON tl.lecturer_id = l.id
          WHERE tl.thesis_id = t.id
        ) AS lecturers
      FROM thesis t
      JOIN student s ON t.student_id = s.id
      WHERE t.id = ${id}
      LIMIT 1
    `;

  const [rows]: any = await pool.query(query);
  rows satisfies GetThesisByIdQueryRow[];

  if (rows.length === 0) return;

  const row: GetThesisByIdQueryRow = rows[0];

  return mapToThesis(row) satisfies Thesis;
}

const mapToThesis = (row: GetThesisByIdQueryRow) => {
  const { progress_status, lecturers, ...rest } = row;
  return {
    ...rest,
    progress: progress_status,
    lecturers: lecturers.map(lec => {
      const { is_admin, ...lecturerRest } = lec;
      return {
        ...lecturerRest,
        isAdmin: is_admin
      }
    }),
  } satisfies Thesis
}