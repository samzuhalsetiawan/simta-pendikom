import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Student } from "@/types/user/student";

type GetStudentsByGenerationQueryRow = {
   id: number;
   nim: string;
   name: string;
   email?: string;
   image?: string;
   generation_year: number;
}

export async function getStudentsByGeneration(year: number): Promise<Student[]> {
  const query = sql`
      SELECT 
        id, 
        nim, 
        name, 
        email, 
        image,
        generation_year 
      FROM student 
      WHERE generation_year = ${year}
      ORDER BY nim ASC
    `;

    const [rows]: any = await pool.query(query);
    rows satisfies GetStudentsByGenerationQueryRow[]
    return mapToStudents(rows)
}

const mapToStudents = (rows: GetStudentsByGenerationQueryRow[]) => {
   return rows.map((row: GetStudentsByGenerationQueryRow) => {
      const { generation_year, ...rest } = row; 
      return {
         ...rest,
         generationYear: generation_year
      } satisfies Student;
   });
} 
