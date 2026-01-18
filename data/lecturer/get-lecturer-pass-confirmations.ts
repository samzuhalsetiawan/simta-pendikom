import "server-only";

import { pool } from "@/lib/db";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";
import { Event, EventType } from "@/types/event/event";
import { ThesisStatus } from "@/types/thesis";
import { Lecturer, LecturerRole } from "@/types/user/lecturer";

type GetLecturerPassConfirmationsQueryRow = {
   type: Exclude<EventType, "konsultasi">;
   event: {
      id: number;
      date: string;
      location: string;
      thesis: {
         id: number;
         title?: string;
         progress: ThesisStatus;
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
   };
};

/**
 * Fetch events that need pass/fail confirmation from the main supervisor.
 * Conditions:
 * - request_status = 'approved'
 * - pass_status = 'pending'
 * - event_date <= NOW() (server time check)
 * - Lecturer is main supervisor (is_main = 1, role = 'pembimbing')
 */
export async function getLecturerPassConfirmations(lecturerId: number): Promise<Event[]> {
   const query = sql`
      SELECT 
         e.type,
         JSON_OBJECT(
            'id', e.id,
            'date', e.event_date,
            'location', e.location,
            'thesis', JSON_OBJECT(
               'id', t.id,
               'title', t.title,
               'progress', t.progress_status,
               'student', JSON_OBJECT(
                  'id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image, 'generation_year', s.generation_year
               ),
               'lecturers', (
                  SELECT JSON_ARRAYAGG(
                     JSON_OBJECT(
                        'id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl2.role, 'is_admin', l.is_admin
                     )
                  )
                  FROM thesis_lecturers tl2
                  JOIN lecturer l ON tl2.lecturer_id = l.id
                  WHERE tl2.thesis_id = t.id
               )
            )
         ) AS event
      FROM events e
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      JOIN thesis_lecturers tl ON t.id = tl.thesis_id
      WHERE tl.lecturer_id = ${lecturerId}
        AND tl.role = 'pembimbing'
        AND tl.is_main = 1
        AND e.request_status = 'approved'
        AND e.pass_status = 'pending'
        AND e.event_date <= NOW()
      ORDER BY e.event_date ASC
   `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetLecturerPassConfirmationsQueryRow[];

   return mapToEvents(rows) satisfies Event[];
}

const mapToEvents = (rows: GetLecturerPassConfirmationsQueryRow[]): Event[] => {
   const timezone = process.env.DB_TZ || "Asia/Makassar";
   return rows.map((row) => {
      const { event, ...rest } = row;
      return {
         ...rest,
         ...event,
         thesis: {
            ...event.thesis,
            student: {
               ...event.thesis.student,
               generationYear: event.thesis.student.generation_year
            },
            lecturers: event.thesis.lecturers.map((lecturer) => {
               const { is_admin, ...lecturerRest } = lecturer;
               return {
                  ...lecturerRest,
                  isAdmin: !!is_admin
               } satisfies Lecturer;
            }),
         },
         date: toZonedTime(fromZonedTime(event.date, timezone), timezone)
      } satisfies Event;
   });
};
