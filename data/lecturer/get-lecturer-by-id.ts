import "server-only";

import { pool } from "@/lib/db";
import { Lecturer } from "@/types/user/lecturer";
import sql from "sql-template-strings";

type GetLecturerByIdQueryRow = {
   id: number;
   nip: string;
   name: string;
   email?: string;
   image?: string;
   is_admin: boolean;
};

export async function getLecturerById(id: number) {
   const query = sql`
   SELECT id, nip, name, email, image, is_admin
   FROM lecturer 
   WHERE id = ${id}
   LIMIT 1
 `;
   const [rows]: any = await pool.query(query);
   rows satisfies GetLecturerByIdQueryRow[];
   if (rows.length === 0) return;
   const row: GetLecturerByIdQueryRow = rows[0];
   return mapToLecturer(row) satisfies Lecturer;
}

const mapToLecturer = (row: GetLecturerByIdQueryRow) => {
   const { is_admin, ...rest } = row;
   return {
      ...rest,
      isAdmin: is_admin
   } satisfies Lecturer;
}