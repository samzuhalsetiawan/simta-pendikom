import { Thesis, THESIS_STATUS_LABELS, ThesisStatusRaw } from "@/types/thesis";
import sql from "sql-template-strings";
import { pool } from "./connection";
import { LECTURER_ROLE_LABELS, LecturerRoleRaw } from "@/types/lecturer";

type GetAllThesisQueryRow = {
  id: number;
  title: string | null;
  progress_status: ThesisStatusRaw;
  student: {
    id: number;
    nim: string;
    name: string;
    email: string | null;
    image: string | null;
  };
  lecturers: {
    id: number;
    nip: string;
    name: string;
    email: string | null;
    image: string | null;
    role: LecturerRoleRaw;
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
  rows satisfies GetAllThesisQueryRow[];

  const formattedData: Thesis[] = rows.map((row: GetAllThesisQueryRow) => ({
    id: row.id,
    title: row.title || "Belum ada judul",
    progress: (THESIS_STATUS_LABELS)[row.progress_status] || row.progress_status,
    // JSON object bisa menjadi string atau object tergantung driver/versi dbms
    student: typeof row.student === 'string' ? JSON.parse(row.student) : row.student,
    lecturers: (typeof row.lecturers === 'string' ? JSON.parse(row.lecturers) : (row.lecturers || []))
      .map((lecturer: typeof row.lecturers[0]) => ({
        ...lecturer,
        role: (LECTURER_ROLE_LABELS)[lecturer.role] || lecturer.role,
      })),
  } satisfies Thesis));

  return formattedData;
}

type GetThesisByIdQueryRow = {
  id: number;
  title: string | null;
  progress_status: ThesisStatusRaw;
  student: {
    id: number;
    nim: string;
    name: string;
    email: string | null;
    image: string | null;
  };
  lecturers: {
    id: number;
    nip: string;
    name: string;
    email: string | null;
    image: string | null;
    role: LecturerRoleRaw;
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
              'role', tl.role
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

  const formattedData: Thesis = {
    id: row.id,
    title: row.title || "Belum ada judul",
    progress: (THESIS_STATUS_LABELS)[row.progress_status] || row.progress_status,
    // JSON object bisa menjadi string atau object tergantung driver/versi dbms
    student: typeof row.student === 'string' ? JSON.parse(row.student) : row.student,
    lecturers: (typeof row.lecturers === 'string' ? JSON.parse(row.lecturers) : (row.lecturers || []))
      .map((lecturer: typeof row.lecturers[0]) => ({
        ...lecturer,
        role: (LECTURER_ROLE_LABELS)[lecturer.role] || lecturer.role,
      })),
  } satisfies Thesis;

  return formattedData;
}
