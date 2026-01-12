import "server-only";

import { pool } from "@/lib/db";
import { Event } from "@/types/event/event";
import { LECTURER_ROLE_LABELS, LecturerRoleRaw } from "@/types/user/lecturer";
import { Thesis, THESIS_STATUS_LABELS, ThesisStatusRaw } from "@/types/thesis";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import sql from "sql-template-strings";
import { EventType } from "next-auth";

type GetLecturerEventQueryRow = {
  id: number;
  raw_type: EventType;
  event_data:
    | {
        id: number;
        date: string;
        location: string;
        topic: string | null;
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
      }
    | {
        id: number;
        date: string;
        location: string;
        topic: string | null;
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
      WHERE c.lecturer_id = ${id} AND c.request_status = 'accepted' `;

  // Tambahkan filter tanggal untuk konsultasi jika parameter tersedia
  if (startDate) query.append(sql` AND c.consultation_date >= ${startDate} `);
  if (endDate) query.append(sql` AND c.consultation_date <= ${endDate} `);

  query.append(sql` UNION ALL 

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
      WHERE e.request_status = 'approved' AND t.id IN (SELECT thesis_id FROM thesis_lecturers WHERE lecturer_id = ${id}) `);

  // Tambahkan filter tanggal untuk events jika parameter tersedia
  if (startDate) query.append(sql` AND e.event_date >= ${startDate} `);
  if (endDate) query.append(sql` AND e.event_date <= ${endDate} `);

  query.append(sql` ORDER BY sort_date DESC `);

  const [rows]: any = await pool.query(query);
  rows satisfies GetLecturerEventQueryRow[];

  return mapGetLecturerEventRowsToEvents(rows);
}

function mapGetLecturerEventRowsToEvents(
  rows: GetLecturerEventQueryRow[]
): Event[] {
  return rows.map((row: GetLecturerEventQueryRow) => {
    const data: typeof row.event_data =
      typeof row.event_data === "string"
        ? JSON.parse(row.event_data)
        : row.event_data;
    const thesis = {
      ...data.thesis,
      title: data.thesis.title || undefined,
      progress:
        THESIS_STATUS_LABELS[data.thesis.progress] || data.thesis.progress,
      student: {
        ...data.thesis.student,
        email: data.thesis.student.email || undefined,
        image: data.thesis.student.image || undefined,
      },
      lecturers: data.thesis.lecturers.map(
        (lec: (typeof data.thesis.lecturers)[0]) => ({
          ...lec,
          role: LECTURER_ROLE_LABELS[lec.role],
          email: lec.email || undefined,
          image: lec.image || undefined,
        })
      ),
    } satisfies Thesis;

    const timezone = process.env.DB_TZ || "Asia/Makassar";
    const date = toZonedTime(fromZonedTime(row.sort_date, timezone), timezone);

    const baseProps = {
      id: data.id,
      location: data.location,
      date,
      thesis,
    };

    if (row.raw_type === "consultation") {
      return {
        type: EVENT_TYPE_LABELS[row.raw_type],
        ...baseProps,
        ...(data.topic !== null && { topic: data.topic }),
      } satisfies Event;
    }

    return {
      type: EVENT_TYPE_LABELS[row.raw_type],
      ...baseProps,
    } satisfies Event;
  });
}
