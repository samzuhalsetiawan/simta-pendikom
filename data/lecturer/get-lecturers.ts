import "server-only";

import { pool } from "@/lib/db";
import { Lecturer } from "@/types/user/lecturer";
import sql from "sql-template-strings";

type GetLecturersQueryRow = {
   id: number;
   nip: string;
   name: string;
   email?: string;
   image?: string;
   is_admin: boolean;
};

export async function getLecturers(): Promise<Lecturer[]> {
   const query = sql`
   SELECT id, nip, name, email, image, is_admin
   FROM lecturer 
   ORDER BY name ASC
 `;
   const [rows]: any = await pool.query(query);
   return rows.map(mapToLecturer);
}

const mapToLecturer = (row: GetLecturersQueryRow): Lecturer => {
   const { is_admin, ...rest } = row;
   return {
      ...rest,
      isAdmin: !!is_admin
   } satisfies Lecturer;
}
