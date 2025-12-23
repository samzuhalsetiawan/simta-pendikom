import { handleDbError, successResponse } from "@/lib/api-utils";
import pool from "@/lib/db";
import SQL from "sql-template-strings";

export async function GET() {
   try {
      const [students] = await pool.execute(
         SQL`SELECT id, nim, name, image FROM student`
      )
      return successResponse(students);
   } catch (error) {
      return handleDbError(error);
   }
}