import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Student } from "@/types/user/student";

type GetStudentByIdQueryRow = {
   id: number;
   nim: string;
   name: string;
   email?: string;
   image?: string;
}

export async function getStudentById(id: string | number): Promise<Student | undefined> {
  const query = sql`
      SELECT 
        id, 
        nim, 
        name, 
        email, 
        image 
      FROM student 
      WHERE id = ${id}
      LIMIT 1
    `;

    const [rows]: any = await pool.query(query);
    rows satisfies GetStudentByIdQueryRow[]
    if (rows.length === 0) return;
    const row = rows[0] as GetStudentByIdQueryRow
    return mapToStudent(row) satisfies Student;
}

const mapToStudent = (row: GetStudentByIdQueryRow) => {
  const { ...rest } = row; 
  return {
      ...rest,
   } satisfies Student;
} 