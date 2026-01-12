import "server-only";

import { pool } from "@/lib/db";
import { Event, EVENT_TYPE_LABELS, EventTypeRaw } from "@/types/event";
import { LECTURER_ROLE_LABELS, LecturerRoleRaw } from "@/types/lecturer";
import { THESIS_STATUS_LABELS, ThesisStatusRaw } from "@/types/thesis";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";

type GetLecturerEventQueryRow = {
   id: number;
   raw_type: EventTypeRaw;
   event_data:
   {
      id: number;
      date: string;
      location: string;
      topic: string | null;
      thesis:
      {
         id: number;
         title: string | null;
         progress: ThesisStatusRaw;
         student:
         {
            id: number;
            nim: string;
            name: string;
            email: string | null;
            image: string | null;
         };
         lecturers:
         {
            id: number;
            nip: string;
            name: string;
            email: string | null;
            image: string | null;
            role: LecturerRoleRaw;
         }[];
      };
   } |
   {
      id: number;
      date: string;
      location: string;
      topic: string | null;
      thesis:
      {
         id: number;
         title: string | null;
         progress: ThesisStatusRaw;
         student:
         {
            id: number;
            nim: string;
            name: string;
            email: string | null;
            image: string | null;
         };
         lecturers:
         {
            id: number;
            nip: string;
            name: string;
            email: string | null;
            image: string | null;
            role: LecturerRoleRaw;
         }[];
      };
   };
   sort_date: string;
};

export async function getLecturerEvent(id: number): Promise<Event[]> {
   const query = sql`
      SELECT 'consultation' AS raw_type,
        JSON_OBJECT('id', c.id, 'date', c.consultation_date, 'location', c.location, 'topic', c.topic,
          'thesis', JSON_OBJECT('id', t.id, 'title', t.title, 'progress', t.progress_status,
            'student', JSON_OBJECT('id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image),
            'lecturers', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role))
              FROM thesis_lecturers tl JOIN lecturer l ON tl.lecturer_id = l.id WHERE tl.thesis_id = t.id))) AS event_data,
        c.consultation_date AS sort_date
      FROM consultations c
      JOIN thesis t ON c.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE c.lecturer_id = ${id} AND c.request_status = 'accepted'

      UNION ALL

      SELECT e.type AS raw_type,
        JSON_OBJECT('id', e.id, 'date', e.event_date, 'location', e.location,
          'thesis', JSON_OBJECT('id', t.id, 'title', t.title, 'progress', t.progress_status,
            'student', JSON_OBJECT('id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image),
            'lecturers', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role))
              FROM thesis_lecturers tl JOIN lecturer l ON tl.lecturer_id = l.id WHERE tl.thesis_id = t.id))) AS event_data,
        e.event_date AS sort_date
      FROM events e
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE e.request_status = 'approved' AND t.id IN (SELECT thesis_id FROM thesis_lecturers WHERE lecturer_id = ${id})
      ORDER BY sort_date DESC
    `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetLecturerEventQueryRow[];

   return rows.map((row: GetLecturerEventQueryRow) => {
      const data: typeof row.event_data = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data;
      const thesis = {
         ...data.thesis,
         progress: (THESIS_STATUS_LABELS)[data.thesis.progress] || data.thesis.progress,
         lecturers: data.thesis.lecturers.map((lec: typeof data.thesis.lecturers[0]) => ({
            ...lec,
            role: (LECTURER_ROLE_LABELS)[lec.role] || lec.role
         }))
      };
      const timezone = process.env.DB_TZ || "Asia/Makassar";
      const date = toZonedTime(fromZonedTime(row.sort_date, timezone), timezone);
      return {
         type: (EVENT_TYPE_LABELS)[row.raw_type] || row.raw_type,
         ...data,
         date,
         thesis,
      } satisfies Event;
   });
}