import { db } from "@/lib/db";

// === Types ===

export type Consultation = {
    id: string;
    lecturer_nip: string;
    student_nim: string;
    consultation_date: Date | null;
    status: 'requested' | 'scheduled' | 'reschedule_requested' | 'approved' | 'rejected' | 'completed' | 'missed';
    venue?: string | null;
    student_notes?: string | null;
    reject_reason?: string | null;
    student_name?: string;
    lecturer_name?: string;
    student_image?: string;
    lecturer_image?: string;
    thesis_title?: string;
    is_thesis?: boolean | number;
    lecturer_role?: 'supervisor' | 'examiner' | string;
    created_at?: Date | string;
    updated_at?: Date | string;
    current_qr_token?: string | null;
};

// === Queries ===

export async function getStudentConsultations(nim: string): Promise<Consultation[]> {
    const [rows] = await db.execute(`
        SELECT c.*, BIN_TO_UUID(c.id) as id, 
               us.name as student_name, us.image as student_image,
               ul.name as lecturer_name, ul.image as lecturer_image,
               (SELECT title FROM thesis WHERE nim = c.student_nim LIMIT 1) as thesis_title,
               (SELECT COUNT(*) > 0 FROM thesis WHERE nim = c.student_nim) as is_thesis,
               COALESCE(
                   (SELECT tl.role FROM thesis_lecturer tl JOIN thesis t ON tl.thesis_id = t.id WHERE t.nim = c.student_nim AND tl.lecturer_nip = c.lecturer_nip LIMIT 1),
                   (SELECT pa.assigned_role FROM proposal_approval pa JOIN thesis t ON pa.thesis_id = t.id WHERE t.nim = c.student_nim AND pa.lecturer_nip = c.lecturer_nip LIMIT 1),
                   'supervisor'
               ) as lecturer_role
        FROM consultation c
        JOIN user us ON c.student_nim = us.username
        JOIN user ul ON c.lecturer_nip = ul.username
        WHERE c.student_nim = ?
        ORDER BY COALESCE(c.consultation_date, c.created_at) DESC
    `, [nim]) as any[];
    return rows as Consultation[];
}

export async function getLecturerConsultations(nip: string): Promise<Consultation[]> {
    const [rows] = await db.execute(`
        SELECT c.*, BIN_TO_UUID(c.id) as id, 
               us.name as student_name, us.image as student_image,
               ul.name as lecturer_name, ul.image as lecturer_image,
               (SELECT title FROM thesis WHERE nim = c.student_nim LIMIT 1) as thesis_title,
               (SELECT COUNT(*) > 0 FROM thesis WHERE nim = c.student_nim) as is_thesis,
               COALESCE(
                   (SELECT tl.role FROM thesis_lecturer tl JOIN thesis t ON tl.thesis_id = t.id WHERE t.nim = c.student_nim AND tl.lecturer_nip = c.lecturer_nip LIMIT 1),
                   (SELECT pa.assigned_role FROM proposal_approval pa JOIN thesis t ON pa.thesis_id = t.id WHERE t.nim = c.student_nim AND pa.lecturer_nip = c.lecturer_nip LIMIT 1),
                   'supervisor'
               ) as lecturer_role
        FROM consultation c
        JOIN user us ON c.student_nim = us.username
        JOIN user ul ON c.lecturer_nip = ul.username
        WHERE c.lecturer_nip = ?
        ORDER BY COALESCE(c.consultation_date, c.created_at) DESC
    `, [nip]) as any[];
    return rows as Consultation[];
}

export async function getConsultationById(id: string): Promise<Consultation | null> {
    const [rows] = await db.execute(`
        SELECT c.*, BIN_TO_UUID(c.id) as id, 
               us.name as student_name, us.image as student_image,
               ul.name as lecturer_name, ul.image as lecturer_image,
               (SELECT title FROM thesis WHERE nim = c.student_nim LIMIT 1) as thesis_title,
               (SELECT COUNT(*) > 0 FROM thesis WHERE nim = c.student_nim) as is_thesis,
               COALESCE(
                   (SELECT tl.role FROM thesis_lecturer tl JOIN thesis t ON tl.thesis_id = t.id WHERE t.nim = c.student_nim AND tl.lecturer_nip = c.lecturer_nip LIMIT 1),
                   (SELECT pa.assigned_role FROM proposal_approval pa JOIN thesis t ON pa.thesis_id = t.id WHERE t.nim = c.student_nim AND pa.lecturer_nip = c.lecturer_nip LIMIT 1),
                   'supervisor'
               ) as lecturer_role
        FROM consultation c
        JOIN user us ON c.student_nim = us.username
        JOIN user ul ON c.lecturer_nip = ul.username
        WHERE c.id = UUID_TO_BIN(?)
    `, [id]) as any[];
    return rows[0] || null;
}

export interface GetConsultationsOptions {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    studentNim?: string;
    lecturerNip?: string;
}

export interface PaginatedConsultationsResult {
    data: Consultation[];
    meta: {
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export async function getPaginatedConsultations(
    options: GetConsultationsOptions = {}
): Promise<PaginatedConsultationsResult> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 12));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (options.studentNim) {
        conditions.push("c.student_nim = ?");
        params.push(options.studentNim);
    }

    if (options.lecturerNip) {
        conditions.push("c.lecturer_nip = ?");
        params.push(options.lecturerNip);
    }

    // Status Filter
    if (options.status && options.status !== "semua") {
        if (options.status === "dijadwalkan") {
            conditions.push("(c.status IN ('approved', 'scheduled') AND c.consultation_date > NOW())");
        } else if (options.status === "belum_selesai") {
            conditions.push("(c.status IN ('approved', 'scheduled') AND (c.consultation_date <= NOW() OR c.consultation_date IS NULL))");
        } else if (options.status === "selesai") {
            conditions.push("c.status = 'completed'");
        }
    }

    // Date Filter
    if (options.dateFilter === "hari_ini") {
        conditions.push("DATE(c.consultation_date) = CURDATE()");
    } else if (options.dateFilter === "rentang") {
        if (options.startDate) {
            conditions.push("c.consultation_date >= ?");
            params.push(`${options.startDate} 00:00:00`);
        }
        if (options.endDate) {
            conditions.push("c.consultation_date <= ?");
            params.push(`${options.endDate} 23:59:59`);
        }
    }

    // Search query focused specifically on proposal and thesis title
    if (options.search && options.search.trim() !== "") {
        const q = `%${options.search.trim()}%`;
        conditions.push(`EXISTS (SELECT 1 FROM thesis t WHERE t.nim = c.student_nim AND t.title LIKE ?)`);
        params.push(q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count Query
    const [countRows] = await db.execute(`
        SELECT COUNT(*) as total
        FROM consultation c
        JOIN user us ON c.student_nim = us.username
        JOIN user ul ON c.lecturer_nip = ul.username
        ${whereClause}
    `, params) as any[];

    const totalCount = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Sorting
    let orderByClause = "ORDER BY COALESCE(c.consultation_date, c.created_at) DESC";
    switch (options.sortBy) {
        case "terlama":
            orderByClause = "ORDER BY COALESCE(c.consultation_date, c.created_at) ASC";
            break;
        case "jadwal_terdekat":
            orderByClause = "ORDER BY CASE WHEN c.consultation_date IS NULL THEN 1 ELSE 0 END, c.consultation_date ASC";
            break;
        case "jadwal_terjauh":
            orderByClause = "ORDER BY c.consultation_date DESC";
            break;
        case "nama_asc":
            orderByClause = "ORDER BY us.name ASC";
            break;
        case "nama_desc":
            orderByClause = "ORDER BY us.name DESC";
            break;
        case "judul_asc":
            orderByClause = "ORDER BY thesis_title ASC";
            break;
        case "terbaru":
        default:
            orderByClause = "ORDER BY COALESCE(c.consultation_date, c.created_at) DESC";
            break;
    }

    // Data Query
    const [dataRows] = await db.execute(`
        SELECT c.*, BIN_TO_UUID(c.id) as id, 
               us.name as student_name, us.image as student_image,
               ul.name as lecturer_name, ul.image as lecturer_image,
               (SELECT title FROM thesis WHERE nim = c.student_nim LIMIT 1) as thesis_title,
               (SELECT COUNT(*) > 0 FROM thesis WHERE nim = c.student_nim) as is_thesis,
               COALESCE(
                   (SELECT tl.role FROM thesis_lecturer tl JOIN thesis t ON tl.thesis_id = t.id WHERE t.nim = c.student_nim AND tl.lecturer_nip = c.lecturer_nip LIMIT 1),
                   (SELECT pa.assigned_role FROM proposal_approval pa JOIN thesis t ON pa.thesis_id = t.id WHERE t.nim = c.student_nim AND pa.lecturer_nip = c.lecturer_nip LIMIT 1),
                   'supervisor'
               ) as lecturer_role
        FROM consultation c
        JOIN user us ON c.student_nim = us.username
        JOIN user ul ON c.lecturer_nip = ul.username
        ${whereClause}
        ${orderByClause}
        LIMIT ${limit} OFFSET ${offset}
    `, params) as any[];

    return {
        data: dataRows as Consultation[],
        meta: {
            totalCount,
            page,
            limit,
            totalPages,
        },
    };
}

export async function getAllConsultations(): Promise<Consultation[]> {
    const res = await getPaginatedConsultations({ limit: 1000 });
    return res.data;
}
