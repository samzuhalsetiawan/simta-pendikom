import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Konsultasi } from "@/types/event/konsultasi";
import { ThesisStatus } from "@/types/thesis";
import { LecturerRole } from "@/types/user/lecturer";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

type GetStudentConsultationsQueryRow = {
   id: number;
   consultation_date: string;
   location: string;
   topic?: string;
   request_status: "pending" | "accepted" | "rejected";
   lecturer_note?: string;
   thesis: {
      id: number;
      title?: string;
      progress_status: ThesisStatus;
      student: {
         id: number;
         nim: string;
         name: string;
         email?: string;
         image?: string;
         generation_year: number;
      };
      lecturers: {
         id: number;
         nip: string;
         name: string;
         email?: string;
         image?: string;
         is_admin: number;
         role: LecturerRole;
      }[];
   };
   lecturer: {
      id: number;
      nip: string;
      name: string;
      email?: string;
      image?: string;
      is_admin: number;
      role: LecturerRole;
   };
};

/**
 * Fetch consultation history for a student
 * @param studentId ID of the student
 */
export async function getStudentConsultations(studentId: number): Promise<Konsultasi[]> {
   const query = sql`
      SELECT 
         c.id,
         c.consultation_date,
         c.location,
         c.topic,
         c.request_status,
         c.lecturer_note,
         JSON_OBJECT(
            'id', t.id, 
            'title', t.title, 
            'progress_status', t.progress_status,
            'student', JSON_OBJECT(
               'id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image, 'generation_year', s.generation_year
            ),
            'lecturers', (
               SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                     'id', l2.id, 'nip', l2.nip, 'name', l2.name, 'email', l2.email, 'image', l2.image, 'role', tl.role, 'is_admin', l2.is_admin
                  )
               )
               FROM thesis_lecturers tl 
               JOIN lecturer l2 ON tl.lecturer_id = l2.id 
               WHERE tl.thesis_id = t.id
            )
         ) AS thesis,
         JSON_OBJECT(
            'id', l.id,
            'nip', l.nip,
            'name', l.name,
            'email', l.email,
            'image', l.image,
            'is_admin', l.is_admin,
            'role', COALESCE(tl_main.role, 'pembimbing') -- Fallback role if not directly assigned or logic requires it
         ) AS lecturer
      FROM consultations c
      JOIN thesis t ON c.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      JOIN lecturer l ON c.lecturer_id = l.id
      LEFT JOIN thesis_lecturers tl_main ON tl_main.thesis_id = t.id AND tl_main.lecturer_id = l.id
      WHERE s.id = ${studentId}
      ORDER BY c.consultation_date DESC
   `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetStudentConsultationsQueryRow[];

   return mapToKonsultasi(rows) satisfies Konsultasi[];
}

const mapToKonsultasi = (rows: GetStudentConsultationsQueryRow[]): Konsultasi[] => {
   const timezone = process.env.DB_TZ || "Asia/Makassar";
   return rows.map((row) => {
      const { consultation_date, thesis, lecturer, ...rest } = row;
      return {
         ...rest,
         status: row.request_status,
         lecturerNote: row.lecturer_note ?? undefined,
         date: toZonedTime(fromZonedTime(consultation_date, timezone), timezone),
         thesis: {
            id: thesis.id,
            title: thesis.title,
            progress: thesis.progress_status,
            student: {
               id: thesis.student.id,
               nim: thesis.student.nim,
               name: thesis.student.name,
               email: thesis.student.email,
               image: thesis.student.image,
               generationYear: thesis.student.generation_year,
            },
            lecturers: thesis.lecturers?.map((lec) => ({
               id: lec.id,
               nip: lec.nip,
               name: lec.name,
               email: lec.email,
               image: lec.image,
               isAdmin: !!lec.is_admin,
               role: lec.role,
            })) ?? [],
         },
         lecturer: {
            id: lecturer.id,
            nip: lecturer.nip,
            name: lecturer.name,
            email: lecturer.email,
            image: lecturer.image,
            isAdmin: !!lecturer.is_admin,
            role: lecturer.role,
         },
      } satisfies Konsultasi;
   });
};
