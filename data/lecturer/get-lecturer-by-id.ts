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
};

export async function getLecturerById(id: number): Promise<Lecturer | undefined> {
   const query = sql`
   SELECT id, nip, name, email, image 
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
      email: lecturer.email,
      image: lecturer.image,
   } satisfies Lecturer;
}