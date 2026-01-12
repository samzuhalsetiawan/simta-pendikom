import "server-only";

import { pool } from "@/lib/db";
import { Student } from "@/types/student";
import sql from "sql-template-strings";

type GetStudentByIdQueryRow = {
   id: number;
   nim: string;
   name: string;
   email: string | null;
   image: string | null;
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
    const student = rows[0] as GetStudentByIdQueryRow
    return {
      id: student.id,
      nim: student.nim,
      name: student.name,
      email: student.email,
      image: student.image
    } satisfies Student;
}