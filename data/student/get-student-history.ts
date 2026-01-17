import "server-only";

import { pool } from "@/lib/db";
import sql from "sql-template-strings";
import { Event, EventType } from "@/types/event/event";
import { ThesisStatus } from "@/types/thesis";
import { LecturerRole } from "@/types/user/lecturer";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

type GetStudentHistoryQueryRow = {
   id: number;
   type: Exclude<EventType, "konsultasi">;
   event_date: string;
   location: string;
   pass_status: "pending" | "pass" | "fail";
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
   attendee_count: number;
};

/**
 * Fetch seminar and pendadaran history for a student (completed events)
 * @param studentId ID of the student
 */
export async function getStudentHistory(studentId: number): Promise<Event[]> {
   const query = sql`
      SELECT 
         e.id,
         e.type,
         e.event_date,
         e.location,
         e.pass_status,
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
                     'id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role, 'is_admin', l.is_admin
                  )
               )
               FROM thesis_lecturers tl 
               JOIN lecturer l ON tl.lecturer_id = l.id 
               WHERE tl.thesis_id = t.id
            )
         ) AS thesis,
         (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id) AS attendee_count
      FROM events e
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE s.id = ${studentId} AND e.pass_status IN ('pass', 'fail')
      ORDER BY e.event_date DESC
   `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetStudentHistoryQueryRow[];

   return mapToEvents(rows) satisfies Event[];
}

const mapToEvents = (rows: GetStudentHistoryQueryRow[]): Event[] => {
   const timezone = process.env.DB_TZ || "Asia/Makassar";
   return rows.map((row) => {
      const { event_date, thesis, attendee_count, pass_status, ...rest } = row;
      const baseEvent = {
         ...rest,
         date: toZonedTime(fromZonedTime(event_date, timezone), timezone),
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
      };
      return baseEvent as Event;
   });
};
