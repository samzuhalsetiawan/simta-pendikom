import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";

export type AssignmentRole = "pembimbing" | "penguji";

export async function assignLecturerRole(
   lecturerId: number,
   studentId: number,
   role: AssignmentRole,
   isMain: boolean
) {
   const query = sql`
    CALL assign_lecturer_to_student(${lecturerId}, ${studentId}, ${role}, ${isMain})
  `;

   await pool.query(query);
}
