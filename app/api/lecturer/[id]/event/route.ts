import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { handleError, successResponse } from "@/lib/api-utils";
import sql from "sql-template-strings";

const progressMap: Record<string, string> = {
  pengajuan_judul: "Pengajuan Judul",
  seminar_proposal: "Seminar Proposal",
  penelitian: "Penelitian",
  seminar_hasil: "Seminar Hasil",
  ujian_akhir: "Sidang Akhir",
  selesai: "Selesai",
};

const typeMap: Record<string, string> = {
  consultation: "Konsultasi",
  seminar_proposal: "Seminar Proposal",
  seminar_hasil: "Seminar Hasil",
  ujian_akhir: "Ujian Akhir",
};

const lecturerRoleMap: Record<string, string> = {
  pembimbing: "Pembimbing",
  penguji: "Penguji",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lecturerId } = await params;

    /**
     * Query menggunakan UNION ALL untuk menggabungkan:
     * 1. Konsultasi: Status 'accepted' (disetujui)
     * 2. Events: Status 'approved' (disetujui)
     * memfilter berdasarkan thesis yang melibatkan lecturerId tersebut.
     */
    const query = sql`
      -- BAGIAN KONSULTASI YANG DISATUJUI
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
      WHERE c.lecturer_id = ${lecturerId} AND c.request_status = 'accepted'

      UNION ALL

      -- BAGIAN EVENTS (SEM_PROP, SEM_HASIL, UJIAN) YANG DISATUJUI
      SELECT 
        e.type AS raw_type,
        JSON_OBJECT(
          'id', e.id,
          'date', e.event_date,
          'location', e.location,
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
      WHERE e.request_status = 'approved' AND t.id IN (
        SELECT thesis_id FROM thesis_lecturers WHERE lecturer_id = ${lecturerId}
      )
      
      ORDER BY sort_date DESC
    `;

    const [rows]: any = await pool.query(query);

    // Transformasi hasil agar sesuai dengan interface
    const formattedData = rows.map((row: any) => {
      const data = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data;
      
      // Mapping objek Thesis, Student, dan Dosen
      const thesis = data.thesis;
      thesis.progress = progressMap[thesis.progress] || thesis.progress;
      
      if (thesis.lecturers) {
        thesis.lecturers = thesis.lecturers.map((lec: any) => ({
          ...lec,
          role: lecturerRoleMap[lec.role] || lec.role
        }));
      }

      return {
        type: typeMap[row.raw_type] || row.raw_type,
        event: data
      };
    });

    return successResponse(formattedData);
  } catch (error: any) {
    return handleError(error);
  }
}