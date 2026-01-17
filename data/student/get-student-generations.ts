import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";

type GetStudentGenerationsQueryRow = {
  generation_year: number
}

export async function getStudentGenerations(): Promise<number[]> {
   const query = sql`
   SELECT DISTINCT generation_year
   FROM student 
   WHERE generation_year IS NOT NULL
   ORDER BY generation_year DESC
 `;
   const [rows]: any = await pool.query(query);
   rows satisfies GetStudentGenerationsQueryRow[]
   return mapToStudentGeneration(rows);
}

const mapToStudentGeneration = (rows: GetStudentGenerationsQueryRow[]) => {
  return rows.map((row: GetStudentGenerationsQueryRow) => {
    return row.generation_year
  })
}