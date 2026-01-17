import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Lecturer, LecturerRole } from "@/types/user/lecturer";

type AssignedLecturerRow = {
   id: number;
   nip: string;
   name: string;
   email?: string;
   image?: string;
   is_admin: boolean;
   role: LecturerRole;
};

export async function getAssignmentsByStudent(studentId: number) {
   const query = sql`
    SELECT 
      l.id, 
      l.nip, 
      l.name, 
      l.email, 
      l.image, 
      l.is_admin,
      tl.role
    FROM thesis t
    JOIN thesis_lecturers tl ON t.id = tl.thesis_id
    JOIN lecturer l ON tl.lecturer_id = l.id
    WHERE t.student_id = ${studentId}
  `;

   const [rows]: any = await pool.query(query);
   return rows.map((row: AssignedLecturerRow) => {
      const { is_admin, ...rest } = row;
      return {
         ...rest,
         isAdmin: !!is_admin
      };
   }) as (Lecturer & { role: LecturerRole })[];
}
