
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { handleError, successResponse } from "@/lib/api-utils";
import sql from "sql-template-strings";

interface NeedApproval {
   type: "Konsultasi" | "Seminar Proposal" | "Seminar Hasil" | "Ujian Akhir";
   event: Consultation | SeminarProposal | SeminarHasil | UjianAkhir;
}

interface Consultation {
   id: number;
   thesis: Thesis;
   date: string;
   location: string;
   topic: string | null;
}

interface SeminarProposal {
   id: number;
   thesis: Thesis;
   date: string;
   location: string;
}

interface SeminarHasil {
   id: number;
   thesis: Thesis;
   date: string;
   location: string;
}

interface UjianAkhir {
   id: number;
   thesis: Thesis;
   date: string;
   location: string;
}

interface Thesis {
   id: number;
   title: string;
   progress: "Pengajuan Judul" | "Seminar Proposal" | "Penelitian" | "Seminar Hasil" | "Sidang Akhir" | "Selesai";
   student: Student;
   lecturers: Lecturer[];
}

interface Student {
   id: number;
   nim: string;
   name: string;
   email: string;
   image: string | null;
}

interface Lecturer {
   id: number;
   nip: string;
   name: string;
   email: string;
   image: string | null;
   role: "Pembimbing" | "Penguji";
}

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
     * Menggunakan UNION ALL untuk menggabungkan dua sumber approval:
     * 1. Konsultasi: Langsung dari tabel consultations dengan status 'pending'.
     * 2. Events: Dari tabel event_approvals di mana status dosen tersebut masih 'pending'.
     */
    const query = sql`
      -- BAGIAN KONSULTASI
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
      WHERE c.lecturer_id = ${lecturerId} AND c.request_status = 'pending'

      UNION ALL

      -- BAGIAN EVENTS (SEM_PROP, SEM_HASIL, UJIAN)
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
      JOIN event_approvals ea ON e.id = ea.event_id
      JOIN thesis t ON e.thesis_id = t.id
      JOIN student s ON t.student_id = s.id
      WHERE ea.lecturer_id = ${lecturerId} AND ea.approval_status = 'pending'
      
      ORDER BY sort_date ASC
    `;

    const [rows]: any = await pool.query(query);

    // Formating hasil agar sesuai dengan interface NeedApproval
    const formattedData: NeedApproval[] = rows.map((row: any) => {
      const data = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data;
      
      // Mapping Nested Objects (Thesis, Student, Lecturers)
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
      } satisfies NeedApproval;
    });

    return successResponse<NeedApproval[]>(formattedData);
  } catch (error: any) {
    return handleError(error);
  }
}