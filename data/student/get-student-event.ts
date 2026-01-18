import "server-only";

import { pool } from "@/lib/db";
import { Event, EventType } from "@/types/event/event";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";
import { ThesisStatus } from "@/types/thesis";
import { LecturerRole } from "@/types/user/lecturer";

type GetStudentEventQueryRow = {
   id: number;
   type: EventType;
   event: {
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
      lecturer?: {
         id: number;
         nip: string;
         name: string;
         email?: string;
         image?: string;
         is_admin: number;
         role: LecturerRole;
      };
      status?: "pending" | "accepted" | "rejected";
      lecturer_note?: string;
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
   await new Promise((resolve) => setTimeout(resolve, 5000));
   // Query 1: Konsultasi Pribadi (Hanya milik studentId terkait)
   const query = sql`
      SELECT 
         'konsultasi' AS type,
         JSON_OBJECT(
            'id', c.id, 
            'date', c.consultation_date, 
            'location', c.location, 
            'topic', c.topic,
            'status', c.request_status,
            'lecturer_note', c.lecturer_note,
            'lecturer', JSON_OBJECT(
               'id', l.id, 
               'nip', l.nip, 
               'name', l.name, 
               'email', l.email, 
               'image', l.image, 
               'is_admin', l.is_admin,
               'role', tl.role
            ),
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
      JOIN lecturer l ON c.lecturer_id = l.id
      LEFT JOIN thesis_lecturers tl ON c.thesis_id = tl.thesis_id AND c.lecturer_id = tl.lecturer_id
      WHERE s.id = ${studentId} AND c.request_status = 'accepted' `;

   if (startDate) query.append(sql` AND c.consultation_date >= ${startDate} `);
   if (endDate) query.append(sql` AND c.consultation_date <= ${endDate} `);

   query.append(sql` UNION ALL 

      SELECT 
         e.type AS type,
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
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE e.request_status = 'approved' `);

   if (startDate) query.append(sql` AND e.event_date >= ${startDate} `);
   if (endDate) query.append(sql` AND e.event_date <= ${endDate} `);

   query.append(sql` ORDER BY sort_date DESC `);

   const [rows]: any = await pool.query(query);

   // Validasi tipe raw sebelum mapping
   rows satisfies GetStudentEventQueryRow[];

   return mapToEvents(rows) satisfies Event[];
}

const mapToEvents = (rows: GetStudentEventQueryRow[]): Event[] => {
   const timezone = process.env.DB_TZ || "Asia/Makassar";
   return rows.map((row: GetStudentEventQueryRow) => {
      const { sort_date: _, event, type } = row;
      const date = toZonedTime(fromZonedTime(event.date, timezone), timezone)
      switch (type) {
         case "konsultasi":
            return {
               ...event,
               date: date,
               type: "konsultasi",
               thesis: {
                  ...event.thesis,
                  student: {
                     ...event.thesis.student,
                     generationYear: event.thesis.student.generation_year,
                  },
                  lecturers: event.thesis.lecturers.map((lec) => ({
                     ...lec,
                     isAdmin: !!lec.is_admin,
                  })),
               },
               lecturer: event.lecturer ? {
                  ...event.lecturer,
                  isAdmin: !!event.lecturer.is_admin,
               } : (() => { throw new Error("Lecturer cannot be null") })(),
               status: event.status || (() => { throw new Error("Status cannot be null") })(),
               lecturerNote: event.lecturer_note,
            };
         case "seminar_proposal":
            return {
               ...event,
               date: date,
               type: "seminar_proposal",
               thesis: {
                  ...event.thesis,
                  student: {
                     ...event.thesis.student,
                     generationYear: event.thesis.student.generation_year,
                  },
                  lecturers: event.thesis.lecturers.map((lec) => ({
                     ...lec,
                     isAdmin: !!lec.is_admin,
                  })),
               }
            };
         case "seminar_hasil":
            return {
               ...event,
               date: date,
               type: "seminar_hasil",
               thesis: {
                  ...event.thesis,
                  student: {
                     ...event.thesis.student,
                     generationYear: event.thesis.student.generation_year,
                  },
                  lecturers: event.thesis.lecturers.map((lec) => ({
                     ...lec,
                     isAdmin: !!lec.is_admin,
                  })),
               }
            };
         case "pendadaran":
            return {
               ...event,
               date: date,
               type: "pendadaran",
               thesis: {
                  ...event.thesis,
                  student: {
                     ...event.thesis.student,
                     generationYear: event.thesis.student.generation_year,
                  },
                  lecturers: event.thesis.lecturers.map((lec) => ({
                     ...lec,
                     isAdmin: !!lec.is_admin,
                  })),
               }
            };
      }
   });
}