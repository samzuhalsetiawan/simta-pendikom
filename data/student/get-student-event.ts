import "server-only";

import { pool } from "@/lib/db";
import { Event, EVENT_TYPE_LABELS, EventTypeRaw } from "@/types/event/event";
import { LECTURER_ROLE_LABELS, LecturerRoleRaw } from "@/types/user/lecturer";
import { Thesis, THESIS_STATUS_LABELS, ThesisStatusRaw } from "@/types/thesis";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";

// Tipe data raw sesuai output JSON_OBJECT MySQL (menggunakan null, bukan undefined)
type GetStudentEventQueryRow = {
   id: number;
   raw_type: EventTypeRaw | 'consultation';
   event_data: {
      id: number;
      date: string;
      location: string;
      topic: string | null; // Nullable dari database
      thesis: {
         id: number;
         title: string | null;
         progress: ThesisStatusRaw;
         student: {
            id: number;
            nim: string;
            name: string;
            email: string | null;
            image: string | null;
         };
         lecturers: {
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

/**
 * Mengambil data event untuk view mahasiswa.
 * Mencakup:
 * 1. Konsultasi pribadi (Accepted)
 * 2. Event Seminar/Ujian publik yang sudah disetujui (Approved)
 * * @param studentId ID Mahasiswa yang sedang login
 * @param startDate Filter tanggal mulai (opsional)
 * @param endDate Filter tanggal akhir (opsional)
 */
export async function getStudentEvent(
   studentId: number,
   startDate?: Date,
   endDate?: Date
): Promise<Event[]> {
   await new Promise((resolve) => setTimeout(resolve, 5000))
   // Query 1: Konsultasi Pribadi (Hanya milik studentId terkait)
   const query = sql`
      SELECT 
         'consultation' AS raw_type,
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
                  'id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image
               ),
               'lecturers', (
                  SELECT JSON_ARRAYAGG(
                     JSON_OBJECT(
                        'id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role
                     )
                  )
                  FROM thesis_lecturers tl 
                  JOIN lecturer l ON tl.lecturer_id = l.id 
                  WHERE tl.thesis_id = t.id
               )
            )
         ) AS event_data,
         c.consultation_date AS sort_date
      FROM consultations c
      JOIN thesis t ON c.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE s.id = ${studentId} AND c.request_status = 'accepted' `;

   if (startDate) query.append(sql` AND c.consultation_date >= ${startDate} `);
   if (endDate) query.append(sql` AND c.consultation_date <= ${endDate} `);

   query.append(sql` UNION ALL 

      SELECT 
         e.type AS raw_type,
         JSON_OBJECT(
            'id', e.id, 
            'date', e.event_date, 
            'location', e.location,
            'topic', NULL, -- Event tidak punya topic, set NULL agar struktur JSON konsisten
            'thesis', JSON_OBJECT(
               'id', t.id, 
               'title', t.title, 
               'progress', t.progress_status,
               'student', JSON_OBJECT(
                  'id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image
               ),
               'lecturers', (
                  SELECT JSON_ARRAYAGG(
                     JSON_OBJECT(
                        'id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role
                     )
                  )
                  FROM thesis_lecturers tl 
                  JOIN lecturer l ON tl.lecturer_id = l.id 
                  WHERE tl.thesis_id = t.id
               )
            )
         ) AS event_data,
         e.event_date AS sort_date
      FROM events e
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE e.request_status = 'approved' `);

   if (startDate) query.append(sql` AND e.event_date >= ${startDate} `);
   if (endDate) query.append(sql` AND e.event_date <= ${endDate} `);

   query.append(sql` ORDER BY sort_date DESC `);

   const [rows]: any = await pool.query(query);
   
   // Validasi tipe raw sebelum mapping
   rows satisfies GetStudentEventQueryRow[];

   return mapGetStudentEventRowsToEvents(rows);
}

function mapGetStudentEventRowsToEvents(rows: GetStudentEventQueryRow[]): Event[] {
   return rows.map((row: GetStudentEventQueryRow) => {
      // Parsing JSON dari database (MySQL driver mungkin mengembalikan string)
      const data: typeof row.event_data = typeof row.event_data === 'string' 
         ? JSON.parse(row.event_data) 
         : row.event_data;

      // Mapping Thesis: null -> undefined, Enum String -> Label
      const thesis = {
         ...data.thesis,
         title: data.thesis.title || undefined, // nullish coalescing
         progress: (THESIS_STATUS_LABELS)[data.thesis.progress] || data.thesis.progress,
         student: {
            ...data.thesis.student,
            email: data.thesis.student.email || undefined,
            image: data.thesis.student.image || undefined,
         },
         lecturers: data.thesis.lecturers.map((lec) => ({
            ...lec,
            role: (LECTURER_ROLE_LABELS)[lec.role],
            email: lec.email || undefined,
            image: lec.image || undefined,
         }))
      } satisfies Thesis;

      // Handling Timezone
      const timezone = process.env.DB_TZ || "Asia/Makassar";
      const date = toZonedTime(fromZonedTime(row.sort_date, timezone), timezone);

      const baseProps = {
         id: data.id,
         location: data.location,
         date,
         thesis,
      };

      // Return sesuai tipe Event yang spesifik
      if (row.raw_type === 'consultation') {
         return {
            type: (EVENT_TYPE_LABELS)[row.raw_type],
            ...baseProps,
            // Jika topic ada isinya gunakan, jika null abaikan (undefined)
            ...(data.topic ? { topic: data.topic } : {}),
         } satisfies Event;
      }

      // Untuk Seminar Proposal, Hasil, dan Ujian Akhir
      return {
         type: (EVENT_TYPE_LABELS)[row.raw_type],
         ...baseProps,
      } satisfies Event;
   });
}