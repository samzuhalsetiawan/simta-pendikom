import "server-only";

import { pool } from "@/lib/db";
import { Lecturer } from "@/types/user/lecturer";
import sql from "sql-template-strings";

type GetLecturerByIdQueryRow = {
   id: number;
   nip: string;
   name: string;
   email: string | null;
   image: string | null;
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
   const lecturer: GetLecturerByIdQueryRow = rows[0];
   return {
      id: lecturer.id,
      nip: lecturer.nip,
      name: lecturer.name,
      email: lecturer.email === null ? undefined : lecturer.email,
      image: lecturer.image === null ? undefined : lecturer.image,
      isAdmin: lecturer.is_admin,
   } satisfies Lecturer;
}