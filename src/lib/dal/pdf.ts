import { db } from "@/lib/db";
import type { LecturerSignatureData } from "@/components/pdf/surat-persetujuan-seminar-proposal";
import fs from "fs/promises";
import path from "path";

// === Types ===

export type EventType = 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';

export type ApprovalPDFData = {
    studentName: string;
    studentNim: string;
    programStudi: string;
    thesisTitle: string;
    proposedDate: string;
    supervisors: LecturerSignatureData[];
    examiners: LecturerSignatureData[];
};

// === Helpers ===

async function getSignatureBuffer(dbPath: string): Promise<Buffer | null> {
    try {
        const relativePath = dbPath.replace(/^\//, '');
        const filePath = path.join(process.cwd(), relativePath);
        await fs.access(filePath);
        const buffer = await fs.readFile(filePath);
        return buffer;
    } catch {
        return null;
    }
}

// Table mapping per event type
const EVENT_CONFIG: Record<EventType, { table: string }> = {
    seminar_proposal: { table: 'seminar_proposal' },
    seminar_hasil: { table: 'seminar_hasil' },
    pendadaran: { table: 'pendadaran' },
};

// === Queries ===

export async function getApprovalPDFData(
    thesisId: string,
    eventType: EventType
): Promise<{ data?: ApprovalPDFData; error?: string }> {
    const config = EVENT_CONFIG[eventType];

    try {
        // 1. Get thesis + student info
        const [theses] = await db.execute(`
            SELECT t.id, t.title, t.nim, u.name as student_name
            FROM thesis t
            JOIN user u ON t.nim = u.username
            WHERE t.id = UUID_TO_BIN(?)
        `, [thesisId]) as any[];

        if (theses.length === 0) {
            return { error: "Data skripsi tidak ditemukan." };
        }
        const thesis = theses[0];

        // 2. Get latest event
        const [events] = await db.execute(`
            SELECT id, scheduled_date, status
            FROM ${config.table}
            WHERE thesis_id = UUID_TO_BIN(?)
            ORDER BY created_at DESC
            LIMIT 1
        `, [thesisId]) as any[];

        if (events.length === 0) {
            return { error: `Belum ada pengajuan ${eventType.replace('_', ' ')}.` };
        }
        const event = events[0];

        // 3. Get lecturers (approval status is now always 'approved' for scheduled events)
        const [lecturers] = await db.execute(`
            SELECT 
                tl.lecturer_nip as nip,
                u.name,
                u.signature,
                tl.role,
                tl.position
            FROM thesis_lecturer tl
            JOIN user u ON tl.lecturer_nip = u.username
            WHERE tl.thesis_id = UUID_TO_BIN(?)
            ORDER BY tl.role, tl.position ASC
        `, [thesisId]) as any[];

        // 4. Build data
        const supervisors: LecturerSignatureData[] = [];
        const examiners: LecturerSignatureData[] = [];

        for (const lec of lecturers) {
            let signatureBuffer: Buffer | null = null;
            // For scheduled events, signatures are shown for all lecturers
            if (event.status === 'approved' && lec.signature) {
                signatureBuffer = await getSignatureBuffer(lec.signature);
            }

            const lecturerData: LecturerSignatureData = {
                name: lec.name,
                nip: lec.nip,
                role: lec.role,
                position: lec.position,
                approvalStatus: event.status === 'approved' ? 'approved' : 'pending',
                signatureBuffer,
            };

            if (lec.role === 'supervisor') {
                supervisors.push(lecturerData);
            } else {
                examiners.push(lecturerData);
            }
        }

        return {
            data: {
                studentName: thesis.student_name,
                studentNim: thesis.nim,
                programStudi: "Pendidikan Komputer",
                thesisTitle: thesis.title || "(Belum ada judul)",
                proposedDate: event.scheduled_date instanceof Date
                    ? event.scheduled_date.toISOString()
                    : String(event.scheduled_date || ''),
                supervisors,
                examiners,
            }
        };
    } catch (error) {
        console.error(`Error fetching ${eventType} PDF data:`, error);
        return { error: "Gagal mengambil data untuk PDF." };
    }
}

// === Invitation PDF Data ===

export type InvitationPDFData = {
    lecturerName: string;
    lecturerNip: string;
    lecturerRole: 'supervisor' | 'examiner';
    studentName: string;
    studentNim: string;
    programStudi: string;
    thesisTitle: string;
    scheduledDate: string;
    venue: string | null;
    seminarType: string;
    allLecturers: { name: string; nip: string; role: string; position: number }[];
};

export async function getInvitationPDFData(
    seminarId: string,
    eventType: EventType,
    lecturerNip: string
): Promise<{ data?: InvitationPDFData; error?: string }> {
    const config = EVENT_CONFIG[eventType];

    try {
        // 1. Get seminar event
        const [events] = await db.execute(`
            SELECT e.id, BIN_TO_UUID(e.thesis_id) as thesis_id, e.scheduled_date, e.venue, e.status
            FROM ${config.table} e
            WHERE e.id = UUID_TO_BIN(?)
        `, [seminarId]) as any[];

        if (events.length === 0) {
            return { error: "Data seminar tidak ditemukan." };
        }
        const event = events[0];

        if (event.status !== 'approved') {
            return { error: "Seminar belum dijadwalkan." };
        }

        // 2. Get thesis + student info
        const [theses] = await db.execute(`
            SELECT t.id, t.title, t.nim, u.name as student_name
            FROM thesis t
            JOIN user u ON t.nim = u.username
            WHERE t.id = UUID_TO_BIN(?)
        `, [event.thesis_id]) as any[];

        if (theses.length === 0) {
            return { error: "Data skripsi tidak ditemukan." };
        }
        const thesis = theses[0];

        // 3. Get lecturer info
        const [lecturerInfo] = await db.execute(`
            SELECT u.name, tl.role, tl.position
            FROM thesis_lecturer tl
            JOIN user u ON tl.lecturer_nip = u.username
            WHERE tl.thesis_id = UUID_TO_BIN(?) AND tl.lecturer_nip = ?
        `, [event.thesis_id, lecturerNip]) as any[];

        if (lecturerInfo.length === 0) {
            return { error: "Data dosen tidak ditemukan." };
        }

        // 4. Get all lecturers for this thesis
        const [allLecturers] = await db.execute(`
            SELECT u.name, tl.lecturer_nip as nip, tl.role, tl.position
            FROM thesis_lecturer tl
            JOIN user u ON tl.lecturer_nip = u.username
            WHERE tl.thesis_id = UUID_TO_BIN(?)
            ORDER BY tl.role, tl.position ASC
        `, [event.thesis_id]) as any[];

        const seminarTypeLabel: Record<EventType, string> = {
            seminar_proposal: 'Seminar Proposal',
            seminar_hasil: 'Seminar Hasil',
            pendadaran: 'Ujian Pendadaran',
        };

        return {
            data: {
                lecturerName: lecturerInfo[0].name,
                lecturerNip: lecturerNip,
                lecturerRole: lecturerInfo[0].role,
                studentName: thesis.student_name,
                studentNim: thesis.nim,
                programStudi: "Pendidikan Komputer",
                thesisTitle: thesis.title || "(Belum ada judul)",
                scheduledDate: event.scheduled_date instanceof Date
                    ? event.scheduled_date.toISOString()
                    : String(event.scheduled_date),
                venue: event.venue,
                seminarType: seminarTypeLabel[eventType],
                allLecturers: allLecturers as any[],
            }
        };
    } catch (error) {
        console.error(`Error fetching invitation PDF data:`, error);
        return { error: "Gagal mengambil data untuk undangan PDF." };
    }
}
