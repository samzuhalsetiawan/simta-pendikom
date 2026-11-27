import { db } from "@/lib/db";

// === Types ===

export type StudentDashboardData = {
    thesis: {
        id: string;
        title: string | null;
        research_type: string | null;
        research_method: string | null;
        research_location: string | null;
        progress: 'pengajuan_proposal' | 'seminar_proposal' | 'penelitian' | 'seminar_hasil' | 'pendadaran' | 'lulus';
        thesis_url: string | null;
        surat_permohonan_pendadaran_url: string | null;
        updated_at: string | Date | null;
        created_at: string | Date | null;
    } | null;
    lecturers: {
        nip: string;
        name: string;
        image: string | null;
        role: 'supervisor' | 'examiner';
    }[];
};

// === Queries ===

export async function getStudentDashboardData(nim: string): Promise<StudentDashboardData> {
    const [theses] = await db.execute(`
        SELECT BIN_TO_UUID(id) as id, title, research_type, research_method, research_location, progress, thesis_url, updatedAt as updated_at, createdAt as created_at FROM thesis WHERE nim = ?
    `, [nim]) as any[];

    if (theses.length === 0) {
        return { thesis: null, lecturers: [] };
    }

    const thesis = theses[0];

    const [pendadarans] = await db.execute(`
        SELECT surat_permohonan_pendadaran_url 
        FROM pendadaran 
        WHERE thesis_id = UUID_TO_BIN(?) 
        ORDER BY created_at DESC 
        LIMIT 1
    `, [thesis.id]) as any[];

    const suratUrl = pendadarans.length > 0 ? pendadarans[0].surat_permohonan_pendadaran_url : null;

    const [lecturers] = await db.execute(`
        SELECT 
            tl.lecturer_nip as nip, 
            u.name, 
            u.image,
            tl.role
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
    `, [thesis.id]) as any[];

    return {
        thesis: {
            ...thesis,
            surat_permohonan_pendadaran_url: suratUrl
        } as StudentDashboardData['thesis'],
        lecturers: lecturers as StudentDashboardData['lecturers']
    };
}

export type StudentListItem = {
    nim: string;
    name: string;
    image: string | null;
    email: string | null;
    generation_year: string;
    thesis_id: string | null;
    thesis_title: string | null;
    thesis_progress: string | null;
    lecturers: {
        nip: string;
        name: string;
        role: 'supervisor' | 'examiner';
    }[];
};

export async function getAllStudentsWithDetails(): Promise<StudentListItem[]> {
    const [students] = await db.execute(`
        SELECT 
            s.nim,
            s.generation_year,
            u.name,
            u.image,
            u.email,
            BIN_TO_UUID(t.id) as thesis_id,
            t.title as thesis_title,
            t.progress as thesis_progress
        FROM student s
        JOIN user u ON s.nim = u.username
        LEFT JOIN thesis t ON s.nim = t.nim
        ORDER BY s.generation_year DESC, s.nim ASC
    `) as any[];

    if (students.length === 0) return [];

    const thesisIds = Array.from(new Set(students.map((s: any) => s.thesis_id).filter(Boolean))) as string[];
    const lecturersByThesisId: Record<string, any[]> = {};

    if (thesisIds.length > 0) {
        const placeholders = thesisIds.map(() => 'UUID_TO_BIN(?)').join(', ');
        const [lecturers] = await db.execute(`
            SELECT 
                BIN_TO_UUID(tl.thesis_id) as thesis_id,
                tl.lecturer_nip as nip,
                u.name,
                tl.role
            FROM thesis_lecturer tl
            JOIN user u ON tl.lecturer_nip = u.username
            WHERE tl.thesis_id IN (${placeholders})
            ORDER BY tl.role, tl.position ASC
        `, thesisIds) as any[];

        lecturers.forEach((l: any) => {
            if (!lecturersByThesisId[l.thesis_id]) lecturersByThesisId[l.thesis_id] = [];
            lecturersByThesisId[l.thesis_id].push({
                nip: l.nip,
                name: l.name,
                role: l.role
            });
        });
    }

    return students.map((s: any) => ({
        nim: s.nim,
        name: s.name || s.nim,
        image: s.image || null,
        email: s.email || null,
        generation_year: String(s.generation_year || ''),
        thesis_id: s.thesis_id || null,
        thesis_title: s.thesis_title || null,
        thesis_progress: s.thesis_progress || null,
        lecturers: (s.thesis_id && lecturersByThesisId[s.thesis_id]) ? lecturersByThesisId[s.thesis_id] : []
    }));
}

export type StudentInfoCardData = {
    student_name: string | null;
    student_image: string | null;
    nim: string;
    generation_year: string | null;
    progress: string;
};

export async function getStudentInfoCardData(nim: string): Promise<StudentInfoCardData | null> {
    const [rows] = await db.execute(`
        SELECT 
            u.name as student_name, 
            u.image as student_image, 
            s.nim, 
            s.generation_year,
            t.progress
        FROM student s
        JOIN user u ON s.nim = u.username
        JOIN thesis t ON s.nim = t.nim
        WHERE s.nim = ?
    `, [nim]) as any[];

    if (rows.length === 0) return null;

    return {
        student_name: rows[0].student_name,
        student_image: rows[0].student_image,
        nim: rows[0].nim,
        generation_year: String(rows[0].generation_year || ''),
        progress: rows[0].progress,
    };
}

