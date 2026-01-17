import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Student } from "@/types/user/student";
import { LecturerRole } from "@/types/user/lecturer";

type AssignedStudentRow = {
   id: number;
   nim: string;
   name: string;
   email?: string;
   image?: string;
   role: LecturerRole;
};

export async function getAssignmentsByLecturer(lecturerId: number) {
   const query = sql`
    SELECT 
      s.id, 
      s.nim, 
      s.name, 
      s.email, 
      s.image, 
      tl.role
    FROM thesis_lecturers tl
    JOIN thesis t ON tl.thesis_id = t.id
    JOIN student s ON t.student_id = s.id
    WHERE tl.lecturer_id = ${lecturerId}
  `;

   const [rows]: any = await pool.query(query);
   return rows.map((row: AssignedStudentRow) => {
      return {
         ...row
      };
   }) as (Student & { role: LecturerRole })[];
}
