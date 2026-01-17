import "server-only";

import { pool } from "@/lib/db";
import { Event, EventType } from "@/types/event/event";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";
import { Thesis, ThesisStatus } from "@/types/thesis";
import { Lecturer, LecturerRole } from "@/types/user/lecturer";

type GetLecturerEventQueryRow = {
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
        role: LecturerRole;
        is_admin: number;
      }[];
    };
  };
  sort_date: string;
};

/**
 * Mengambil data event dosen dengan filter rentang waktu
 * @param id ID Dosen
 * @param startDate Objek Date awal rentang
 * @param endDate Objek Date akhir rentang
 */
export async function getLecturerEvent(
  id: number,
  startDate?: Date,
  endDate?: Date
): Promise<Event[]> {
  // Inisialisasi query dasar
  const query = sql`
      SELECT 'konsultasi' AS type,
        JSON_OBJECT('id', c.id, 'date', c.consultation_date, 'location', c.location, 'topic', c.topic,
          'thesis', JSON_OBJECT('id', t.id, 'title', t.title, 'progress', t.progress_status,
            'student', JSON_OBJECT('id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image, 'generation_year', s.generation_year),
            'lecturers', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role, 'is_admin', l.is_admin))
              FROM thesis_lecturers tl JOIN lecturer l ON tl.lecturer_id = l.id WHERE tl.thesis_id = t.id))) AS event,
        c.consultation_date AS sort_date
      FROM consultations c
      JOIN thesis t ON c.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE c.lecturer_id = ${id} AND c.request_status = 'accepted' `;

  // Tambahkan filter tanggal untuk konsultasi jika parameter tersedia
  if (startDate) query.append(sql` AND c.consultation_date >= ${startDate} `);
  if (endDate) query.append(sql` AND c.consultation_date <= ${endDate} `);

  query.append(sql` UNION ALL 

      SELECT e.type AS type,
        JSON_OBJECT('id', e.id, 'date', e.event_date, 'location', e.location,
          'thesis', JSON_OBJECT('id', t.id, 'title', t.title, 'progress', t.progress_status,
            'student', JSON_OBJECT('id', s.id, 'nim', s.nim, 'name', s.name, 'email', s.email, 'image', s.image, 'generation_year', s.generation_year),
            'lecturers', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', l.id, 'nip', l.nip, 'name', l.name, 'email', l.email, 'image', l.image, 'role', tl.role, 'is_admin', l.is_admin))
              FROM thesis_lecturers tl JOIN lecturer l ON tl.lecturer_id = l.id WHERE tl.thesis_id = t.id))) AS event,
        e.event_date AS sort_date
      FROM events e
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE e.request_status = 'approved' AND t.id IN (SELECT thesis_id FROM thesis_lecturers WHERE lecturer_id = ${id}) `);

  // Tambahkan filter tanggal untuk events jika parameter tersedia
  if (startDate) query.append(sql` AND e.event_date >= ${startDate} `);
  if (endDate) query.append(sql` AND e.event_date <= ${endDate} `);

  query.append(sql` ORDER BY sort_date DESC `);

  const [rows]: any = await pool.query(query);
  rows satisfies GetLecturerEventQueryRow[];

  return mapToEvents(rows) satisfies Event[];
}

const mapToEvents = (rows: GetLecturerEventQueryRow[]) => {
  const timezone = process.env.DB_TZ || "Asia/Makassar";
  return rows.map((row: GetLecturerEventQueryRow) => {
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
