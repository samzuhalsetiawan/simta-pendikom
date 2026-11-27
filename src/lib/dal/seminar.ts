import { db } from "@/lib/db";
import { CalendarEventType } from "../constants/calendar";
import { getStudentConsultations, getLecturerConsultations } from "./consultation";

// === Types ===

export type SeminarProposalStatus = {
    id: string;
    scheduled_date: string | null;
    status: 'pending_schedule' | 'pending_approval' | 'approved' | 'pass' | 'fail' | 'rejected';
    venue: string | null;
    rejection_reason: string | null;
    approvals?: {
        lecturer_nip: string;
        lecturer_name: string;
        role: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
    }[];
} | null;

export type SeminarHasilStatus = {
    id: string;
    scheduled_date: string | null;
    status: 'pending_schedule' | 'pending_approval' | 'approved' | 'pass' | 'fail' | 'rejected';
    venue: string | null;
    rejection_reason: string | null;
    approvals?: {
        lecturer_nip: string;
        lecturer_name: string;
        role: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
    }[];
} | null;

export type PendadaranStatus = {
    id: string;
    scheduled_date: string | null;
    status: 'pending_schedule' | 'pending_approval' | 'pending_document' | 'pending_staff_approval' | 'approved' | 'pass' | 'fail' | 'rejected';
    venue: string | null;
    rejection_reason: string | null;
    approvals?: {
        lecturer_nip: string;
        lecturer_name: string;
        role: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
    }[];
    document_url?: string | null;
    surat_permohonan_pendadaran_url?: string | null;
} | null;

// === Queries ===

export async function getSeminarProposalStatus(thesisId: string): Promise<SeminarProposalStatus> {
    const [proposals] = await db.execute(`
        SELECT BIN_TO_UUID(id) as id, scheduled_date, status, venue, rejection_reason 
        FROM seminar_proposal 
        WHERE thesis_id = UUID_TO_BIN(?) 
        ORDER BY created_at DESC 
        LIMIT 1
    `, [thesisId]) as any[];

    if (proposals.length === 0) return null;

    const proposal = proposals[0];

    let approvals = [];
    const [rows] = await db.execute(`
        SELECT 
            a.lecturer_nip, 
            u.name as lecturer_name, 
            a.status, 
            a.rejection_reason,
            COALESCE(tl.role, s.role, 'staff') as role
        FROM seminar_proposal_approval a
        JOIN user u ON a.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = a.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        LEFT JOIN staff s ON s.nip = a.lecturer_nip
        WHERE a.seminar_proposal_id = UUID_TO_BIN(?)
    `, [thesisId, proposal.id]) as any[];
    approvals = rows;

    return {
        ...proposal,
        scheduled_date: proposal.scheduled_date ? proposal.scheduled_date.toISOString() : null,
        approvals
    };
}

export async function getSeminarHasilStatus(thesisId: string): Promise<SeminarHasilStatus> {
    const [results] = await db.execute(`
        SELECT BIN_TO_UUID(id) as id, scheduled_date, status, venue, rejection_reason 
        FROM seminar_hasil 
        WHERE thesis_id = UUID_TO_BIN(?) 
        ORDER BY created_at DESC 
        LIMIT 1
    `, [thesisId]) as any[];

    if (results.length === 0) return null;

    const result = results[0];

    let approvals = [];
    const [rows2] = await db.execute(`
        SELECT 
            a.lecturer_nip, 
            u.name as lecturer_name, 
            a.status, 
            a.rejection_reason,
            COALESCE(tl.role, s.role, 'staff') as role
        FROM seminar_hasil_approval a
        JOIN user u ON a.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = a.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        LEFT JOIN staff s ON s.nip = a.lecturer_nip
        WHERE a.seminar_hasil_id = UUID_TO_BIN(?)
    `, [thesisId, result.id]) as any[];
    approvals = rows2;

    return {
        ...result,
        scheduled_date: result.scheduled_date ? result.scheduled_date.toISOString() : null,
        approvals
    };
}

export async function getPendadaranStatus(nim: string): Promise<PendadaranStatus> {
    const [rows] = await db.execute(`
        SELECT 
            BIN_TO_UUID(p.id) as id, 
            p.scheduled_date, 
            p.status, 
            p.venue, 
            p.rejection_reason,
            p.surat_permohonan_pendadaran_url,
            BIN_TO_UUID(p.thesis_id) as thesis_id
        FROM pendadaran p
        JOIN thesis t ON p.thesis_id = t.id
        WHERE t.nim = ?
        ORDER BY p.created_at DESC
        LIMIT 1
    `, [nim]) as any[];

    if (rows.length === 0) return null;

    const pendadaran = rows[0];

    let approvals = [];
    const [appRows] = await db.execute(`
        SELECT 
            a.lecturer_nip, 
            u.name as lecturer_name, 
            a.status, 
            a.rejection_reason,
            COALESCE(tl.role, s.role, 'staff') as role
        FROM pendadaran_approval a
        JOIN user u ON a.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = a.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        LEFT JOIN staff s ON s.nip = a.lecturer_nip
        WHERE a.pendadaran_id = UUID_TO_BIN(?)
    `, [pendadaran.thesis_id, pendadaran.id]) as any[];
    approvals = appRows;

    return {
        ...pendadaran,
        document_url: pendadaran.surat_permohonan_pendadaran_url || null,
        surat_permohonan_pendadaran_url: pendadaran.surat_permohonan_pendadaran_url || null,
        scheduled_date: pendadaran.scheduled_date ? pendadaran.scheduled_date.toISOString() : null,
        approvals
    };
}

export async function getSeminarAttendances(nim: string) {
    const [rows] = await db.execute(`
        SELECT seminar_type, COUNT(*) as count 
        FROM seminar_attendance 
        WHERE student_nim = ? AND status = 'menghadiri' 
        GROUP BY seminar_type
    `, [nim]) as any[];

    const result = { proposal: 0, hasil: 0, total: 0 };
    rows.forEach((r: any) => {
        if (r.seminar_type === 'proposal') result.proposal = r.count;
        if (r.seminar_type === 'hasil') result.hasil = r.count;
    });
    
    result.total = result.proposal + result.hasil;

    return result;
}

export async function getSeminarSpectators(seminarId: string, type: 'proposal' | 'hasil') {
    const [rows] = await db.execute(`
        SELECT sa.id, sa.student_nim, sa.status, sa.created_at, u.name 
        FROM seminar_attendance sa
        JOIN user u ON sa.student_nim = u.username
        WHERE sa.seminar_id = UUID_TO_BIN(?) AND sa.seminar_type = ?
        ORDER BY sa.created_at DESC
    `, [seminarId, type]) as any[];

    return rows.map((r: any) => ({
        id: r.id,
        nim: r.student_nim,
        name: r.name,
        status: r.status,
        created_at: r.created_at.toISOString()
    }));
}

export async function getCurrentQrToken(seminarId: string, type: 'proposal' | 'hasil') {
    const table = type === 'proposal' ? 'seminar_proposal' : 'seminar_hasil';
    const [rows] = await db.execute(`SELECT current_qr_token FROM ${table} WHERE id = UUID_TO_BIN(?)`, [seminarId]) as any[];
    
    if (rows.length === 0) return null;
    
    if (!rows[0].current_qr_token) {
        // Generate a new token if null
        const crypto = await import('crypto');
        const newToken = crypto.randomBytes(32).toString('hex');
        await db.execute(`UPDATE ${table} SET current_qr_token = ? WHERE id = UUID_TO_BIN(?)`, [newToken, seminarId]);
        return newToken;
    }
    
    return rows[0].current_qr_token;
}

export type SeminarProposalWithDetails = {
    id: string;
    thesis_id: string;
    student_nim: string;
    student_name: string;
    student_image: string | null;
    thesis_title: string | null;
    scheduled_date: string | null;
    venue: string | null;
    status: string;
    score: number | null;
    rejection_reason: string | null;
    created_at: string;
    document_url?: string | null;
    seminar_type?: CalendarEventType;
    lecturers: {
        nip: string;
        name: string;
        image: string | null;
        role: string;
        position: number;
        score?: number | null;
    }[];
};

export type SeminarProposalDetail = SeminarProposalWithDetails & {
    student_generation_year: string | number | null;
    proposal_id: string | null;
    proposal_url: string | null;
    approvals: {
        lecturer_nip: string;
        lecturer_name: string;
        role: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
    }[];
    spectators_count: number;
    spectators: {
        id: string;
        nim: string;
        name: string;
        attendance_time: string;
    }[];
    research_type: string | null;
    research_method: string | null;
    research_location: string | null;
};

export type SeminarHasilDetail = SeminarProposalWithDetails & {
    student_generation_year: string | number | null;
    thesis_url: string | null;
    approvals: {
        lecturer_nip: string;
        lecturer_name: string;
        role: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
    }[];
    spectators_count: number;
    spectators: {
        id: string;
        nim: string;
        name: string;
        attendance_time: string;
    }[];
    research_type: string | null;
    research_method: string | null;
    research_location: string | null;
};

export type PendadaranDetail = SeminarProposalWithDetails & {
    student_generation_year: string | number | null;
    thesis_url: string | null;
    approvals: {
        lecturer_nip: string;
        lecturer_name: string;
        role: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
    }[];
    research_type: string | null;
    research_method: string | null;
    research_location: string | null;
    document_url?: string | null;
};

export async function getSeminarProposalsWithDetails(): Promise<SeminarProposalWithDetails[]> {
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            BIN_TO_UUID(sp.thesis_id) as thesis_id,
            sp.scheduled_date,
            sp.status,
            sp.score,
            sp.venue,
            sp.rejection_reason,
            sp.created_at,
            s.nim as student_nim,
            u.name as student_name,
            u.image as student_image,
            t.title as thesis_title
        FROM seminar_proposal sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        ORDER BY sp.scheduled_date DESC, sp.created_at DESC
    `) as any[];

    if (proposals.length === 0) return [];

    const thesisIds = Array.from(new Set(proposals.map((p: any) => p.thesis_id))) as string[];
    const placeholders = thesisIds.map(() => 'UUID_TO_BIN(?)').join(', ');

    const [lecturers] = await db.execute(`
        SELECT 
            BIN_TO_UUID(tl.thesis_id) as thesis_id, 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role, 
            tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id IN (${placeholders})
        ORDER BY tl.role, tl.position ASC
    `, thesisIds) as any[];

    const lecturersByThesisId: Record<string, any[]> = {};
    lecturers.forEach((l: any) => {
        if (!lecturersByThesisId[l.thesis_id]) lecturersByThesisId[l.thesis_id] = [];
        lecturersByThesisId[l.thesis_id].push({
            nip: l.nip,
            name: l.name,
            image: l.image ?? null,
            role: l.role,
            position: l.position
        });
    });

    return proposals.map((p: any) => ({
        ...p,
        scheduled_date: p.scheduled_date ? p.scheduled_date.toISOString() : null,
        created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
        lecturers: lecturersByThesisId[p.thesis_id] || [],
        seminar_type: 'proposal' as const
    }));
}

export async function getSeminarProposalDetailById(id: string): Promise<SeminarProposalDetail | null> {
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            BIN_TO_UUID(sp.thesis_id) as thesis_id,
            BIN_TO_UUID(sp.thesis_id) as proposal_id,
            sp.scheduled_date,
            sp.status,
            sp.score,
            sp.venue,
            sp.rejection_reason,
            sp.created_at,
            s.nim as student_nim,
            u.name as student_name,
            u.image as student_image,
            s.generation_year as student_generation_year,
            t.proposal_url as proposal_url,
            t.title as thesis_title,
            t.research_type as research_type,
            t.research_method as research_method,
            t.research_location as research_location
        FROM seminar_proposal sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE sp.id = UUID_TO_BIN(?)
        LIMIT 1
    `, [id]) as any[];

    if (proposals.length === 0) return null;
    const proposal = proposals[0];

    const [lecturers] = await db.execute(`
        SELECT 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role, 
            tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
        ORDER BY tl.role, tl.position ASC
    `, [proposal.thesis_id]) as any[];

    const [lecturerScores] = await db.execute(`
        SELECT lecturer_nip, score 
        FROM seminar_proposal_lecturer_score 
        WHERE seminar_id = UUID_TO_BIN(?)
    `, [id]) as any[];

    const scoreMap = new Map<string, number>();
    lecturerScores.forEach((ls: any) => {
        scoreMap.set(ls.lecturer_nip, ls.score);
    });

    const [approvals] = await db.execute(`
        SELECT 
            a.lecturer_nip, 
            u.name as lecturer_name, 
            a.status, 
            a.rejection_reason,
            COALESCE(tl.role, s.role, 'staff') as role
        FROM seminar_proposal_approval a
        JOIN user u ON a.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = a.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        LEFT JOIN staff s ON s.nip = a.lecturer_nip
        WHERE a.seminar_proposal_id = UUID_TO_BIN(?)
    `, [proposal.thesis_id, id]) as any[];

    const [attendance] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM seminar_attendance 
        WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = 'proposal'
    `, [id]) as any[];

    const spectators = await getSeminarSpectators(id, 'proposal');

    return {
        ...proposal,
        seminar_type: 'proposal' as const,
        score: proposal.score ?? null,
        scheduled_date: proposal.scheduled_date ? proposal.scheduled_date.toISOString() : null,
        created_at: proposal.created_at ? proposal.created_at.toISOString() : new Date().toISOString(),
        lecturers: lecturers.map((l: any) => ({
            nip: l.nip,
            name: l.name,
            image: l.image ?? null,
            role: l.role,
            position: l.position,
            score: scoreMap.has(l.nip) ? scoreMap.get(l.nip) ?? null : null
        })),
        approvals: approvals.map((a: any) => ({
            lecturer_nip: a.lecturer_nip,
            lecturer_name: a.lecturer_name,
            role: a.role,
            status: a.status,
            rejection_reason: a.rejection_reason
        })),
        spectators_count: attendance[0]?.count || 0,
        spectators
    };
}

export async function getSeminarHasilsWithDetails(): Promise<SeminarProposalWithDetails[]> {
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            BIN_TO_UUID(sp.thesis_id) as thesis_id,
            sp.scheduled_date,
            sp.status,
            sp.score,
            sp.venue,
            sp.rejection_reason,
            sp.created_at,
            s.nim as student_nim,
            u.name as student_name,
            u.image as student_image,
            t.title as thesis_title
        FROM seminar_hasil sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        ORDER BY sp.scheduled_date DESC, sp.created_at DESC
    `) as any[];

    if (proposals.length === 0) return [];

    const thesisIds = Array.from(new Set(proposals.map((p: any) => p.thesis_id))) as string[];
    const placeholders = thesisIds.map(() => 'UUID_TO_BIN(?)').join(', ');

    const [lecturers] = await db.execute(`
        SELECT 
            BIN_TO_UUID(tl.thesis_id) as thesis_id, 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role, 
            tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id IN (${placeholders})
        ORDER BY tl.role, tl.position ASC
    `, thesisIds) as any[];

    const lecturersByThesisId: Record<string, any[]> = {};
    lecturers.forEach((l: any) => {
        if (!lecturersByThesisId[l.thesis_id]) lecturersByThesisId[l.thesis_id] = [];
        lecturersByThesisId[l.thesis_id].push({
            nip: l.nip,
            name: l.name,
            image: l.image ?? null,
            role: l.role,
            position: l.position
        });
    });

    return proposals.map((p: any) => ({
        ...p,
        scheduled_date: p.scheduled_date ? p.scheduled_date.toISOString() : null,
        created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
        lecturers: lecturersByThesisId[p.thesis_id] || [],
        seminar_type: 'hasil' as const
    }));
}

export async function getSeminarHasilDetailById(id: string): Promise<SeminarHasilDetail | null> {
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            BIN_TO_UUID(sp.thesis_id) as thesis_id,
            sp.scheduled_date,
            sp.status,
            sp.score,
            sp.venue,
            sp.rejection_reason,
            sp.created_at,
            s.nim as student_nim,
            u.name as student_name,
            u.image as student_image,
            s.generation_year as student_generation_year,
            t.thesis_url as thesis_url,
            t.title as thesis_title,
            t.research_type as research_type,
            t.research_method as research_method,
            t.research_location as research_location
        FROM seminar_hasil sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE sp.id = UUID_TO_BIN(?)
        LIMIT 1
    `, [id]) as any[];

    if (proposals.length === 0) return null;
    const proposal = proposals[0];

    const [lecturers] = await db.execute(`
        SELECT 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role, 
            tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
        ORDER BY tl.role, tl.position ASC
    `, [proposal.thesis_id]) as any[];

    const [lecturerScores] = await db.execute(`
        SELECT lecturer_nip, score 
        FROM seminar_hasil_lecturer_score 
        WHERE seminar_id = UUID_TO_BIN(?)
    `, [id]) as any[];

    const scoreMap = new Map<string, number>();
    lecturerScores.forEach((ls: any) => {
        scoreMap.set(ls.lecturer_nip, ls.score);
    });

    const [approvals] = await db.execute(`
        SELECT 
            a.lecturer_nip, 
            u.name as lecturer_name, 
            a.status, 
            a.rejection_reason,
            COALESCE(tl.role, s.role, 'staff') as role
        FROM seminar_hasil_approval a
        JOIN user u ON a.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = a.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        LEFT JOIN staff s ON s.nip = a.lecturer_nip
        WHERE a.seminar_hasil_id = UUID_TO_BIN(?)
    `, [proposal.thesis_id, id]) as any[];

    const [attendance] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM seminar_attendance 
        WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = 'hasil'
    `, [id]) as any[];

    const spectators = await getSeminarSpectators(id, 'hasil');

    return {
        ...proposal,
        seminar_type: 'hasil' as const,
        score: proposal.score ?? null,
        scheduled_date: proposal.scheduled_date ? proposal.scheduled_date.toISOString() : null,
        created_at: proposal.created_at ? proposal.created_at.toISOString() : new Date().toISOString(),
        lecturers: lecturers.map((l: any) => ({
            nip: l.nip,
            name: l.name,
            image: l.image ?? null,
            role: l.role,
            position: l.position,
            score: scoreMap.has(l.nip) ? scoreMap.get(l.nip) ?? null : null
        })),
        approvals: approvals.map((a: any) => ({
            lecturer_nip: a.lecturer_nip,
            lecturer_name: a.lecturer_name,
            role: a.role,
            status: a.status,
            rejection_reason: a.rejection_reason
        })),
        spectators_count: attendance[0]?.count || 0,
        spectators
    };
}

export async function getPendadaransWithDetails(): Promise<SeminarProposalWithDetails[]> {
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            BIN_TO_UUID(sp.thesis_id) as thesis_id,
            sp.scheduled_date,
            sp.status,
            sp.score,
            sp.venue,
            sp.rejection_reason,
            sp.created_at,
            s.nim as student_nim,
            u.name as student_name,
            u.image as student_image,
            t.title as thesis_title,
            sp.surat_permohonan_pendadaran_url as document_url
        FROM pendadaran sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE sp.status IN ('approved', 'pass', 'fail')
        ORDER BY sp.scheduled_date DESC, sp.created_at DESC
    `) as any[];

    if (proposals.length === 0) return [];

    const thesisIds = Array.from(new Set(proposals.map((p: any) => p.thesis_id))) as string[];
    const placeholders = thesisIds.map(() => 'UUID_TO_BIN(?)').join(', ');

    const [lecturers] = await db.execute(`
        SELECT 
            BIN_TO_UUID(tl.thesis_id) as thesis_id, 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role, 
            tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id IN (${placeholders})
        ORDER BY tl.role, tl.position ASC
    `, thesisIds) as any[];

    const lecturersByThesisId: Record<string, any[]> = {};
    lecturers.forEach((l: any) => {
        if (!lecturersByThesisId[l.thesis_id]) lecturersByThesisId[l.thesis_id] = [];
        lecturersByThesisId[l.thesis_id].push({
            nip: l.nip,
            name: l.name,
            image: l.image ?? null,
            role: l.role,
            position: l.position
        });
    });

    return proposals.map((p: any) => ({
        ...p,
        document_url: p.document_url || p.surat_permohonan_pendadaran_url || null,
        scheduled_date: p.scheduled_date ? p.scheduled_date.toISOString() : null,
        created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
        lecturers: lecturersByThesisId[p.thesis_id] || [],
        seminar_type: 'pendadaran' as const
    }));
}

export async function getPendadaranDetailById(id: string): Promise<PendadaranDetail | null> {
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            BIN_TO_UUID(sp.thesis_id) as thesis_id,
            sp.scheduled_date,
            sp.status,
            sp.score,
            sp.venue,
            sp.rejection_reason,
            sp.created_at,
            s.nim as student_nim,
            u.name as student_name,
            u.image as student_image,
            s.generation_year as student_generation_year,
            t.thesis_url as thesis_url,
            t.title as thesis_title,
            t.research_type as research_type,
            t.research_method as research_method,
            t.research_location as research_location,
            sp.surat_permohonan_pendadaran_url as document_url,
            sp.surat_permohonan_pendadaran_url as surat_permohonan_pendadaran_url
        FROM pendadaran sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE sp.id = UUID_TO_BIN(?)
        LIMIT 1
    `, [id]) as any[];

    if (proposals.length === 0) return null;
    const proposal = proposals[0];

    const [lecturers] = await db.execute(`
        SELECT 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role, 
            tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
        ORDER BY tl.role, tl.position ASC
    `, [proposal.thesis_id]) as any[];

    const [lecturerScores] = await db.execute(`
        SELECT lecturer_nip, score 
        FROM pendadaran_lecturer_score 
        WHERE seminar_id = UUID_TO_BIN(?)
    `, [id]) as any[];

    const scoreMap = new Map<string, number>();
    lecturerScores.forEach((ls: any) => {
        scoreMap.set(ls.lecturer_nip, ls.score);
    });

    const [approvals] = await db.execute(`
        SELECT 
            a.lecturer_nip, 
            u.name as lecturer_name, 
            a.status, 
            a.rejection_reason,
            COALESCE(tl.role, s.role, 'staff') as role
        FROM pendadaran_approval a
        JOIN user u ON a.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = a.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        LEFT JOIN staff s ON s.nip = a.lecturer_nip
        WHERE a.pendadaran_id = UUID_TO_BIN(?)
    `, [proposal.thesis_id, id]) as any[];

    return {
        ...proposal,
        document_url: proposal.document_url || null,
        surat_permohonan_pendadaran_url: proposal.document_url || null,
        seminar_type: 'pendadaran' as const,
        score: proposal.score ?? null,
        scheduled_date: proposal.scheduled_date ? proposal.scheduled_date.toISOString() : null,
        created_at: proposal.created_at ? proposal.created_at.toISOString() : new Date().toISOString(),
        lecturers: lecturers.map((l: any) => ({
            nip: l.nip,
            name: l.name,
            image: l.image ?? null,
            role: l.role,
            position: l.position,
            score: scoreMap.has(l.nip) ? scoreMap.get(l.nip) ?? null : null
        })),
        approvals: approvals.map((a: any) => ({
            lecturer_nip: a.lecturer_nip,
            lecturer_name: a.lecturer_name,
            role: a.role,
            status: a.status,
            rejection_reason: a.rejection_reason
        }))
    };
}

export type CalendarEventItem = SeminarProposalWithDetails & {
    scheduled_date: string;
    seminar_type: CalendarEventType;
};

export async function getAllScheduledCalendarEvents(user?: { username: string; role: string; [key: string]: any }): Promise<CalendarEventItem[]> {
    const [proposals, hasils, pendadarans] = await Promise.all([
        getSeminarProposalsWithDetails(),
        getSeminarHasilsWithDetails(),
        getPendadaransWithDetails()
    ]);

    let allEvents: CalendarEventItem[] = [...proposals, ...hasils, ...pendadarans].filter((event): event is CalendarEventItem => {
        return Boolean(event.scheduled_date) && event.status !== 'rejected';
    });

    // Fetch konsultasi based on role
    if (user) {
        let consultations: any[] = [];
        if (user.role === 'dosen') {
            consultations = await getLecturerConsultations(user.username);
        } else if (user.role === 'mahasiswa') {
            consultations = await getStudentConsultations(user.username);
        }

        const consultationEvents: CalendarEventItem[] = consultations
            .filter(c => c.status === 'approved' || c.status === 'pending') // Only show approved/pending
            .map(c => ({
                id: String(c.id),
                thesis_id: '', // Konsultasi doesn't strictly need thesis_id for rendering
                student_nim: c.student_nim,
                student_name: c.student_name || '',
                student_image: null,
                thesis_title: c.thesis_title || 'Belum ada judul',
                scheduled_date: new Date(c.consultation_date).toISOString(),
                venue: user.role === 'mahasiswa' ? (c.lecturer_name || 'Dosen') : (c.student_name || 'Mahasiswa'),
                status: c.status,
                score: null,
                rejection_reason: null,
                created_at: new Date(c.consultation_date).toISOString(),
                seminar_type: 'konsultasi',
                lecturers: [] // Can be empty for konsultasi
            }));

        allEvents = [...allEvents, ...consultationEvents];
    }

    return allEvents.sort((a, b) => {
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
    });
}

export type SpectatingSeminar = {
    seminar_id: string;
    seminar_type: 'proposal' | 'hasil';
    status: 'terdaftar' | 'menghadiri';
    scheduled_date: string;
    venue: string | null;
    title: string;
    student_name: string;
    student_nim: string;
};

export async function getUpcomingSpectatingSeminars(nim: string): Promise<SpectatingSeminar[]> {
    const [rows] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sa.seminar_id) as seminar_id, 
            sa.seminar_type, 
            sa.status, 
            sp.scheduled_date as prop_date, 
            sh.scheduled_date as hasil_date, 
            sp.venue as prop_venue, 
            sh.venue as hasil_venue, 
            t_prop.title as prop_title, 
            t_hasil.title as hasil_title, 
            u_prop.name as prop_student, 
            u_hasil.name as hasil_student,
            st_prop.nim as prop_nim,
            st_hasil.nim as hasil_nim
        FROM seminar_attendance sa 
        LEFT JOIN seminar_proposal sp ON sa.seminar_id = sp.id AND sa.seminar_type = 'proposal' 
        LEFT JOIN thesis t_prop ON sp.thesis_id = t_prop.id 
        LEFT JOIN student st_prop ON t_prop.nim = st_prop.nim 
        LEFT JOIN user u_prop ON st_prop.nim = u_prop.username 
        LEFT JOIN seminar_hasil sh ON sa.seminar_id = sh.id AND sa.seminar_type = 'hasil' 
        LEFT JOIN thesis t_hasil ON sh.thesis_id = t_hasil.id 
        LEFT JOIN student st_hasil ON t_hasil.nim = st_hasil.nim 
        LEFT JOIN user u_hasil ON st_hasil.nim = u_hasil.username 
        WHERE sa.student_nim = ? AND sa.status IN ('terdaftar', 'menghadiri')
    `, [nim]) as any[];

    return rows.map((r: any) => {
        const isProposal = r.seminar_type === 'proposal';
        return {
            seminar_id: r.seminar_id,
            seminar_type: r.seminar_type,
            status: r.status,
            scheduled_date: isProposal ? (r.prop_date ? r.prop_date.toISOString() : null) : (r.hasil_date ? r.hasil_date.toISOString() : null),
            venue: isProposal ? r.prop_venue : r.hasil_venue,
            title: isProposal ? r.prop_title : r.hasil_title,
            student_name: isProposal ? r.prop_student : r.hasil_student,
            student_nim: isProposal ? r.prop_nim : r.hasil_nim
        };
    }).filter((r: any) => r.scheduled_date !== null);
}

// === Approval Signers Queries ===

export interface SeminarSignerData {
    id: number | string;
    lecturer_nip: string;
    lecturer_name: string;
    lecturer_image?: string | null;
    role: string;
    position?: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
    responded_at?: string | null;
}

export async function getSeminarProposalSigners(seminarProposalId: string, thesisId: string): Promise<SeminarSignerData[]> {
    const [rows] = await db.execute(`
        SELECT 
            spa.id,
            spa.lecturer_nip,
            u.name as lecturer_name,
            u.image as lecturer_image,
            spa.status,
            spa.rejection_reason,
            spa.responded_at,
            spa.assigned_role,
            tl.position
        FROM seminar_proposal_approval spa
        JOIN user u ON spa.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = spa.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        WHERE spa.seminar_proposal_id = UUID_TO_BIN(?)
        ORDER BY 
            CASE 
                WHEN spa.assigned_role = 'supervisor' THEN 1 
                WHEN spa.assigned_role = 'examiner' THEN 2 
                WHEN spa.assigned_role = 'koordinator_program_studi' THEN 3
                WHEN spa.assigned_role = 'ketua_jurusan' THEN 4
                ELSE 5 
            END,
            tl.position ASC
    `, [thesisId, seminarProposalId]) as any[];

    return rows.map((r: any) => ({
        id: r.id,
        lecturer_nip: r.lecturer_nip,
        lecturer_name: r.lecturer_name,
        lecturer_image: r.lecturer_image || null,
        role: r.assigned_role,
        position: r.position ?? undefined,
        status: r.status,
        rejection_reason: r.rejection_reason || null,
        responded_at: r.responded_at ? r.responded_at.toISOString() : null,
    }));
}

export async function getSeminarHasilSigners(seminarHasilId: string, thesisId: string): Promise<SeminarSignerData[]> {
    const [rows] = await db.execute(`
        SELECT 
            sha.id,
            sha.lecturer_nip,
            u.name as lecturer_name,
            u.image as lecturer_image,
            sha.status,
            sha.rejection_reason,
            sha.responded_at,
            sha.assigned_role,
            tl.position
        FROM seminar_hasil_approval sha
        JOIN user u ON sha.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = sha.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        WHERE sha.seminar_hasil_id = UUID_TO_BIN(?)
        ORDER BY 
            CASE 
                WHEN sha.assigned_role = 'supervisor' THEN 1 
                WHEN sha.assigned_role = 'examiner' THEN 2 
                WHEN sha.assigned_role = 'koordinator_program_studi' THEN 3
                WHEN sha.assigned_role = 'ketua_jurusan' THEN 4
                ELSE 5 
            END,
            tl.position ASC
    `, [thesisId, seminarHasilId]) as any[];

    return rows.map((r: any) => ({
        id: r.id,
        lecturer_nip: r.lecturer_nip,
        lecturer_name: r.lecturer_name,
        lecturer_image: r.lecturer_image || null,
        role: r.assigned_role,
        position: r.position ?? undefined,
        status: r.status,
        rejection_reason: r.rejection_reason || null,
        responded_at: r.responded_at ? r.responded_at.toISOString() : null,
    }));
}

export async function getPendadaranSigners(pendadaranId: string, thesisId: string): Promise<SeminarSignerData[]> {
    const [rows] = await db.execute(`
        SELECT 
            pa.id,
            pa.lecturer_nip,
            u.name as lecturer_name,
            u.image as lecturer_image,
            pa.status,
            pa.rejection_reason,
            pa.responded_at,
            pa.assigned_role,
            tl.position
        FROM pendadaran_approval pa
        JOIN user u ON pa.lecturer_nip = u.username
        LEFT JOIN thesis_lecturer tl ON tl.lecturer_nip = pa.lecturer_nip AND tl.thesis_id = UUID_TO_BIN(?)
        WHERE pa.pendadaran_id = UUID_TO_BIN(?)
        ORDER BY 
            CASE 
                WHEN pa.assigned_role = 'supervisor' THEN 1 
                WHEN pa.assigned_role = 'examiner' THEN 2 
                WHEN pa.assigned_role = 'koordinator_program_studi' THEN 3
                WHEN pa.assigned_role = 'ketua_jurusan' THEN 4
                ELSE 5 
            END,
            tl.position ASC
    `, [thesisId, pendadaranId]) as any[];

    return rows.map((r: any) => ({
        id: r.id,
        lecturer_nip: r.lecturer_nip,
        lecturer_name: r.lecturer_name,
        lecturer_image: r.lecturer_image || null,
        role: r.assigned_role,
        position: r.position ?? undefined,
        status: r.status,
        rejection_reason: r.rejection_reason || null,
        responded_at: r.responded_at ? r.responded_at.toISOString() : null,
    }));
}

