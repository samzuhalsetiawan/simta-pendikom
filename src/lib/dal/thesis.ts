import { db } from "@/lib/db";

// === Types ===

export type StudentWithThesis = {
    nim: string;
    name: string;
    image: string | null;
    thesis_id: string | null;
    title: string | null;
    progress: string | null;
    lecturers: {
        nip: string;
        name: string;
        image: string | null;
        role: 'supervisor' | 'examiner';
        position: number;
    }[];
};

// === Queries ===

export async function getStudentsData(generationYear?: string): Promise<StudentWithThesis[]> {
    let query = `
        SELECT s.nim, u.name, u.image, BIN_TO_UUID(t.id) as thesis_id, t.title, t.progress
        FROM student s
        JOIN user u ON s.nim = u.username
        LEFT JOIN thesis t ON s.nim = t.nim
    `;
    const params: any[] = [];

    if (generationYear) {
        query += ` WHERE s.generation_year = ?`;
        params.push(generationYear);
    }

    const [students] = await db.execute(query, params) as any[];

    const result: StudentWithThesis[] = [];

    for (const student of students) {
        let lecturers: any[] = [];
        if (student.thesis_id) {
            const [rows] = await db.execute(`
                SELECT tl.lecturer_nip as nip, u.name, u.image, tl.role, tl.position
                FROM thesis_lecturer tl
                JOIN user u ON tl.lecturer_nip = u.username
                WHERE tl.thesis_id = UUID_TO_BIN(?)
                ORDER BY tl.role, tl.position ASC
            `, [student.thesis_id]) as any[];
            lecturers = rows;
        }
        result.push({ ...student, lecturers });
    }

    return result;
}

export async function getGenerations(): Promise<string[]> {
    const [rows] = await db.execute(`
        SELECT DISTINCT generation_year 
        FROM student 
        ORDER BY generation_year DESC
    `) as any[];
    return rows.map((r: any) => String(r.generation_year));
}

export async function getLecturersData() {
    const [rows] = await db.execute(`
        SELECT l.nip, u.name
        FROM lecturer l
        JOIN user u ON l.nip = u.username
    `) as any[];
    return rows;
}

export type ThesisDetail = {
    id: string;
    nim: string;
    student_name: string;
    student_image: string | null;
    generation_year: string;
    title: string | null;
    research_type: string | null;
    research_method: string | null;
    progress: string;
    thesis_url: string | null;
    proposal_url: string | null;
    proposal_approval_status: 'unrequested' | 'pending' | 'approved' | 'rejected' | null;
    lecturers: {
        nip: string;
        name: string;
        image: string | null;
        role: 'supervisor' | 'examiner';
        position: number;
    }[];
};

export async function getThesisDetail(id: string): Promise<ThesisDetail | null> {
    const [theses] = await db.execute(`
        SELECT 
            BIN_TO_UUID(t.id) as id, t.nim, t.title, t.research_type, t.research_method, t.progress, 
            t.thesis_url, t.proposal_url, t.proposal_approval_status,
            u.name as student_name, u.image as student_image, s.generation_year
        FROM thesis t
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE t.id = UUID_TO_BIN(?)
    `, [id]) as any[];

    if (theses.length === 0) return null;
    const thesis = theses[0];

    const [lecturers] = await db.execute(`
        SELECT tl.lecturer_nip as nip, u.name, u.image, tl.role, tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
        ORDER BY tl.role, tl.position ASC
    `, [id]) as any[];

    return {
        ...thesis,
        lecturers
    };
}

export type ThesisListItem = {
    id: string;
    nim: string;
    student_name: string;
    student_image: string | null;
    generation_year: string;
    title: string | null;
    research_type: string | null;
    research_method: string | null;
    progress: string;
    thesis_url: string | null;
    proposal_url: string | null;
    proposal_approval_status: 'unrequested' | 'pending' | 'approved' | 'rejected' | null;
    created_at: string;
    lecturers: {
        nip: string;
        name: string;
        role: 'supervisor' | 'examiner';
        position: number;
    }[];
};

export async function getAllThesesWithDetails(): Promise<ThesisListItem[]> {
    const [theses] = await db.execute(`
        SELECT 
            BIN_TO_UUID(t.id) as id,
            t.nim,
            t.title,
            t.research_type,
            t.research_method,
            t.progress,
            t.thesis_url,
            t.proposal_url,
            t.proposal_approval_status,
            t.createdAt as created_at,
            u.name as student_name,
            u.image as student_image,
            s.generation_year
        FROM thesis t
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        ORDER BY t.createdAt DESC
    `) as any[];

    if (theses.length === 0) return [];

    const thesisIds = Array.from(new Set(theses.map((t: any) => t.id))) as string[];
    const placeholders = thesisIds.map(() => 'UUID_TO_BIN(?)').join(', ');

    const [lecturers] = await db.execute(`
        SELECT 
            BIN_TO_UUID(tl.thesis_id) as thesis_id,
            tl.lecturer_nip as nip,
            u.name,
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
            role: l.role,
            position: l.position
        });
    });

    return theses.map((t: any) => ({
        ...t,
        created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
        lecturers: lecturersByThesisId[t.id] || []
    }));
}

export type LecturerInfoCardData = {
    nip: string;
    name: string;
    image: string | null;
    role: 'supervisor' | 'examiner';
    position: number;
};

import type { LecturerDisplayData } from "@/components/shared/lecturers-info-card-list";

export async function getLecturersInfoCardData(thesisId: string): Promise<LecturerDisplayData[]> {
    const [rows] = await db.execute(`
        SELECT tl.lecturer_nip as nip, u.name, u.image, tl.role, tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
        ORDER BY tl.role, tl.position ASC
    `, [thesisId]) as any[];

    return rows.map((r: any) => ({
        nip: r.nip,
        name: r.name,
        image: r.image,
        roleLabel: `${r.role === 'supervisor' ? 'Pembimbing' : 'Penguji'} ${r.position}`,
        originalData: {
            role: r.role,
            position: r.position
        }
    }));
}

export interface DocumentInfoCardData {
    id: string;
    title: string | null;
    nim: string;
    research_type: string | null;
    research_method: string | null;
    updated_at?: string | Date;
}

export async function getThesisInfoCardData(id: string): Promise<DocumentInfoCardData | null> {
    const [rows] = await db.execute(`
        SELECT 
            BIN_TO_UUID(id) as id,
            nim,
            title,
            research_type,
            research_method,
            COALESCE(updatedAt, createdAt) as updated_at
        FROM thesis
        WHERE id = UUID_TO_BIN(?)
    `, [id]) as any[];

    if (rows.length === 0) return null;
    return rows[0] as DocumentInfoCardData;
}



