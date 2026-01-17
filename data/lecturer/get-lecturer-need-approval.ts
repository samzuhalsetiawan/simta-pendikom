import "server-only";

import { pool } from "@/lib/db";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";
import { Event, EventType } from "@/types/event/event"
import { ThesisStatus } from "@/types/thesis";
import { Lecturer, LecturerRole } from "@/types/user/lecturer";

type GetLecturerNeedApprovalQueryRow = {
   type: EventType;
   event:
   {
      id: number;
      date: string;
      location: string;
      topic?: string;
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
   sort_date: string;
};

export async function getLecturerNeedApproval(id: number): Promise<Event[]> {
   /**
     * Menggunakan UNION ALL untuk menggabungkan dua sumber approval:
     * 1. Konsultasi: Langsung dari tabel consultations dengan status 'pending'.
     * 2. Events: Dari tabel event_approvals di mana status dosen tersebut masih 'pending'.
     */
   const query = sql`
      -- BAGIAN KONSULTASI
      SELECT 
        'konsultasi' AS type,
        JSON_OBJECT(
          'id', c.id,
          'date', c.consultation_date,
          'location', c.location,
          'topic', c.topic,
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
                  'id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role, 'is_admin', l.is_admin
                )
              )
              FROM thesis_lecturers tl
              JOIN lecturer l ON tl.lecturer_id = l.id
              WHERE tl.thesis_id = t.id
            )
          )
        ) AS event,
        c.consultation_date AS sort_date
      FROM consultations c
      JOIN thesis t ON c.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE c.lecturer_id = ${id} AND c.request_status = 'pending'

      UNION ALL

      -- BAGIAN EVENTS (SEM_PROP, SEM_HASIL, UJIAN)
      SELECT 
        e.type AS event_type,
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
                  'id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role, 'is_admin', l.is_admin
                )
              )
              FROM thesis_lecturers tl
              JOIN lecturer l ON tl.lecturer_id = l.id
              WHERE tl.thesis_id = t.id
            )
          )
        ) AS event,
        e.event_date AS sort_date
      FROM events e
      JOIN event_approvals ea ON e.id = ea.event_id
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE ea.lecturer_id = ${id} AND ea.approval_status = 'pending'
      
      ORDER BY sort_date ASC
    `;

   const [rows]: any = await pool.query(query);
   rows satisfies GetLecturerNeedApprovalQueryRow[];

   return mapToEvents(rows) satisfies Event[];
}

const mapToEvents = (rows: GetLecturerNeedApprovalQueryRow[]) => {
  const timezone = process.env.DB_TZ || "Asia/Makassar";
  return rows.map((row: GetLecturerNeedApprovalQueryRow) => {
    const { sort_date: _, event, ...rest } = row;
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
}