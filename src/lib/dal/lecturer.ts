import { db } from "@/lib/db";

// === Types ===

export type StudentThesisData = {
    nim: string;
    student_name: string;
    student_image: string | null;
    student_generation_year?: string | number | null;
    title: string | null;
    thesis_id: string;
    research_type: string | null;
    progress: 'pengajuan_proposal' | 'seminar_proposal' | 'penelitian' | 'seminar_hasil' | 'pendadaran' | 'lulus';
};

export type PipelineStats = {
    pengajuan_proposal: number;
    seminar_proposal: number;
    penelitian: number;
    seminar_hasil: number;
    pendadaran: number;
    lulus: number;
};

export type InactiveStudent = {
    nim: string;
    student_name: string;
    student_image: string | null;
    title: string | null;
    progress: string;
    score: number;
    days_inactive: number;
    last_activity: string | null;
    last_activity_date: string | null;
    supervisors?: {
        name: string;
        image: string | null;
        nip: string;
        position: number;
    }[];
};

export type GraduationStat = {
    period: string;
    count: number;
};

export type AgendaItem = {
    id: string;
    type: 'consultation' | 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';
    date: string;
    student_name: string;
    student_nim: string;
    student_image: string | null;
    venue: string | null;
    thesis_title: string | null;
};

export type UpcomingAgendaGroup = {
    dateStr: string; // YYYY-MM-DD format
    items: AgendaItem[];
};

export type StudentDetail = {
    nim: string;
    student_name: string;
    student_image: string | null;
    title: string | null;
    progress: string;
    research_type: string | null;
    research_method: string | null;
    research_location: string | null;
    generation_year: number;
    lecturers: {
        nip: string;
        name: string;
        role: 'supervisor' | 'examiner';
        position: number;
    }[];
    recent_consultations: {
        date: string;
        status: string;
        lecturer_name: string;
    }[];
    progress_history: {
        from_progress: string | null;
        to_progress: string;
        changed_at: string;
    }[];
};

// === Queries ===

export async function getLecturerDashboardData(nip: string) {
    const [supervised] = await db.execute(`
        SELECT s.nim, u.name as student_name, u.image as student_image, s.generation_year as student_generation_year, t.title, BIN_TO_UUID(t.id) as thesis_id, t.research_type, t.progress
        FROM thesis_lecturer tl
        JOIN thesis t ON tl.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND tl.role = 'supervisor'
    `, [nip]) as any[];

    const [examined] = await db.execute(`
        SELECT s.nim, u.name as student_name, u.image as student_image, s.generation_year as student_generation_year, t.title, BIN_TO_UUID(t.id) as thesis_id, t.research_type, t.progress
        FROM thesis_lecturer tl
        JOIN thesis t ON tl.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND tl.role = 'examiner'
    `, [nip]) as any[];

    const allSupervised = supervised as StudentThesisData[];
    const allExamined = examined as StudentThesisData[];

    return {
        supervised: allSupervised,
        examined: allExamined,
        activeSupervised: allSupervised.filter(s => s.progress !== 'lulus'),
        graduatedSupervised: allSupervised.filter(s => s.progress === 'lulus'),
        activeExamined: allExamined.filter(s => s.progress !== 'lulus'),
        graduatedExamined: allExamined.filter(s => s.progress === 'lulus'),
    };
}

export async function getLecturerPipelineStats(nip: string, role: 'supervisor' | 'examiner' = 'supervisor'): Promise<PipelineStats> {
    const [rows] = await db.execute(`
        SELECT t.progress, COUNT(*) as count
        FROM thesis_lecturer tl
        JOIN thesis t ON tl.thesis_id = t.id
        WHERE tl.lecturer_nip = ? AND tl.role = ?
        GROUP BY t.progress
    `, [nip, role]) as any[];

    const stats: PipelineStats = {
        pengajuan_proposal: 0,
        seminar_proposal: 0,
        penelitian: 0,
        seminar_hasil: 0,
        pendadaran: 0,
        lulus: 0,
    };

    rows.forEach((r: any) => {
        if (r.progress in stats) {
            stats[r.progress as keyof PipelineStats] = r.count;
        }
    });

    return stats;
}

export async function getLecturerGraduationStats(nip: string): Promise<GraduationStat[]> {
    const [rows] = await db.execute(`
        SELECT 
            CONCAT(YEAR(tph.changed_at), ' ', IF(MONTH(tph.changed_at) <= 6, 'Ganjil', 'Genap')) as period,
            COUNT(*) as count
        FROM thesis_progress_history tph
        JOIN thesis t ON tph.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        WHERE tl.lecturer_nip = ? AND tl.role = 'supervisor' AND tph.to_progress = 'lulus'
        GROUP BY period
        ORDER BY MIN(tph.changed_at) ASC
    `, [nip]) as any[];

    return rows as GraduationStat[];
}

export async function getLecturerInactiveStudents(nip: string): Promise<InactiveStudent[]> {
    const [rows] = await db.execute(`
        SELECT 
            *,
            GREATEST(0, FLOOR(100 - (POW(days_inactive, 2) / 9))) as score
        FROM (
            SELECT 
                s.nim,
                u.name as student_name,
                u.image as student_image,
                t.title,
                t.progress,
                (SELECT description FROM student_activity_logs WHERE student_nim = s.nim ORDER BY created_at DESC LIMIT 1) as last_activity,
                COALESCE((SELECT MAX(created_at) FROM student_activity_logs WHERE student_nim = s.nim), t.createdAt) as last_activity_date,
                DATEDIFF(NOW(), COALESCE((SELECT MAX(created_at) FROM student_activity_logs WHERE student_nim = s.nim), t.createdAt)) as days_inactive
            FROM thesis_lecturer tl
            JOIN thesis t ON tl.thesis_id = t.id
            JOIN student s ON t.nim = s.nim
            JOIN user u ON s.nim = u.username
            WHERE tl.lecturer_nip = ? AND tl.role = 'supervisor' AND t.progress != 'lulus'
        ) as subquery
        ORDER BY score ASC, days_inactive DESC
    `, [nip]) as any[];

    return rows.map((r: any) => ({
        ...r,
        score: Number(r.score),
        days_inactive: Number(r.days_inactive),
        last_activity_date: r.last_activity_date ? new Date(r.last_activity_date).toISOString() : null,
    }));
}

export async function getUpcomingAgendas(nip: string): Promise<UpcomingAgendaGroup[]> {
    const items: AgendaItem[] = [];

    // Consultations upcoming
    const [consultations] = await db.execute(`
        SELECT BIN_TO_UUID(c.id) as id, c.consultation_date as date, u.name as student_name, u.username as student_nim, u.image as student_image
        FROM consultation c
        JOIN user u ON c.student_nim = u.username
        WHERE c.lecturer_nip = ? AND c.status = 'approved' AND DATE(c.consultation_date) >= CURDATE()
        ORDER BY c.consultation_date ASC
    `, [nip]) as any[];

    consultations.forEach((c: any) => items.push({
        id: c.id,
        type: 'consultation',
        date: c.date.toISOString(),
        student_name: c.student_name,
        student_nim: c.student_nim,
        student_image: c.student_image,
        venue: null,
        thesis_title: null,
    }));

    // Seminar proposals upcoming
    const [seminars] = await db.execute(`
        SELECT BIN_TO_UUID(sp.id) as id, sp.scheduled_date as date, u.name as student_name, u.username as student_nim, u.image as student_image, sp.venue, t.title as thesis_title
        FROM seminar_proposal sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND sp.status = 'approved' AND DATE(sp.scheduled_date) >= CURDATE()
        ORDER BY sp.scheduled_date ASC
    `, [nip]) as any[];

    seminars.forEach((s: any) => items.push({
        id: s.id,
        type: 'seminar_proposal',
        date: s.date.toISOString(),
        student_name: s.student_name,
        student_nim: s.student_nim,
        student_image: s.student_image,
        venue: s.venue,
        thesis_title: s.thesis_title,
    }));

    // Seminar hasil upcoming
    const [hasil] = await db.execute(`
        SELECT BIN_TO_UUID(sh.id) as id, sh.scheduled_date as date, u.name as student_name, u.username as student_nim, u.image as student_image, sh.venue, t.title as thesis_title
        FROM seminar_hasil sh
        JOIN thesis t ON sh.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND sh.status = 'approved' AND DATE(sh.scheduled_date) >= CURDATE()
        ORDER BY sh.scheduled_date ASC
    `, [nip]) as any[];

    hasil.forEach((h: any) => items.push({
        id: h.id,
        type: 'seminar_hasil',
        date: h.date.toISOString(),
        student_name: h.student_name,
        student_nim: h.student_nim,
        student_image: h.student_image,
        venue: h.venue,
        thesis_title: h.thesis_title,
    }));

    // Pendadaran upcoming
    const [pendadarans] = await db.execute(`
        SELECT BIN_TO_UUID(p.id) as id, p.scheduled_date as date, u.name as student_name, u.username as student_nim, u.image as student_image, p.venue, t.title as thesis_title
        FROM pendadaran p
        JOIN thesis t ON p.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND p.status = 'approved' AND DATE(p.scheduled_date) >= CURDATE()
        ORDER BY p.scheduled_date ASC
    `, [nip]) as any[];

    pendadarans.forEach((p: any) => items.push({
        id: p.id,
        type: 'pendadaran',
        date: p.date.toISOString(),
        student_name: p.student_name,
        student_nim: p.student_nim,
        student_image: p.student_image,
        venue: p.venue,
        thesis_title: p.thesis_title,
    }));

    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const groupsMap = new Map<string, AgendaItem[]>();
    for (const item of items) {
        const dateObj = new Date(item.date);
        const dateStr = dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
        if (!groupsMap.has(dateStr)) {
            groupsMap.set(dateStr, []);
        }
        groupsMap.get(dateStr)!.push(item);
    }

    const sortedGroups = Array.from(groupsMap.entries())
        .map(([dateStr, agendaItems]) => ({ dateStr, items: agendaItems }))
        .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
        .slice(0, 3);

    return sortedGroups;
}

export async function getLecturerStudentDetail(thesisId: string): Promise<StudentDetail | null> {
    const [theses] = await db.execute(`
        SELECT t.title, t.progress, t.research_type, t.research_method, t.research_location,
               s.nim, s.generation_year, u.name as student_name, u.image as student_image
        FROM thesis t
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE t.id = UUID_TO_BIN(?)
    `, [thesisId]) as any[];

    if (theses.length === 0) return null;
    const thesis = theses[0];

    const [lecturers] = await db.execute(`
        SELECT tl.lecturer_nip as nip, u.name, tl.role, tl.position
        FROM thesis_lecturer tl
        JOIN user u ON tl.lecturer_nip = u.username
        WHERE tl.thesis_id = UUID_TO_BIN(?)
        ORDER BY tl.role, tl.position ASC
    `, [thesisId]) as any[];

    const [consultations] = await db.execute(`
        SELECT c.consultation_date as date, c.status, u.name as lecturer_name
        FROM consultation c
        JOIN user u ON c.lecturer_nip = u.username
        WHERE c.student_nim = ?
        ORDER BY c.consultation_date DESC
        LIMIT 5
    `, [thesis.nim]) as any[];

    const [history] = await db.execute(`
        SELECT from_progress, to_progress, changed_at
        FROM thesis_progress_history
        WHERE thesis_id = UUID_TO_BIN(?)
        ORDER BY changed_at ASC
    `, [thesisId]) as any[];

    return {
        nim: thesis.nim,
        student_name: thesis.student_name,
        student_image: thesis.student_image,
        title: thesis.title,
        progress: thesis.progress,
        research_type: thesis.research_type,
        research_method: thesis.research_method,
        research_location: thesis.research_location,
        generation_year: thesis.generation_year,
        lecturers: lecturers,
        recent_consultations: consultations.map((c: any) => ({
            date: c.date.toISOString(),
            status: c.status,
            lecturer_name: c.lecturer_name,
        })),
        progress_history: history.map((h: any) => ({
            from_progress: h.from_progress,
            to_progress: h.to_progress,
            changed_at: h.changed_at.toISOString(),
        })),
    };
}

export type LecturerListItem = {
    nip: string;
    name: string;
    image: string | null;
    email: string | null;
    staff_role: string | null;
    total_supervised: number;
    total_examined: number;
};

export async function getAllLecturersWithDetails(): Promise<LecturerListItem[]> {
    const [lecturers] = await db.execute(`
        SELECT 
            l.nip,
            u.name,
            u.image,
            u.email,
            st.role as staff_role
        FROM lecturer l
        JOIN user u ON l.nip = u.username
        LEFT JOIN staff st ON l.nip = st.nip
        ORDER BY u.name ASC
    `) as any[];

    if (lecturers.length === 0) return [];

    const nips = Array.from(new Set(lecturers.map((l: any) => l.nip))) as string[];
    const placeholders = nips.map(() => '?').join(', ');

    const [stats] = await db.execute(`
        SELECT 
            lecturer_nip as nip,
            role,
            COUNT(*) as count
        FROM thesis_lecturer
        WHERE lecturer_nip IN (${placeholders})
        GROUP BY lecturer_nip, role
    `, nips) as any[];

    const statsMap: Record<string, { supervised: number; examined: number }> = {};
    stats.forEach((s: any) => {
        if (!statsMap[s.nip]) statsMap[s.nip] = { supervised: 0, examined: 0 };
        if (s.role === 'supervisor') statsMap[s.nip].supervised = Number(s.count);
        if (s.role === 'examiner') statsMap[s.nip].examined = Number(s.count);
    });

    return lecturers.map((l: any) => ({
        nip: l.nip,
        name: l.name || l.nip,
        image: l.image || null,
        email: l.email || null,
        staff_role: l.staff_role || null,
        total_supervised: statsMap[l.nip]?.supervised || 0,
        total_examined: statsMap[l.nip]?.examined || 0
    }));
}

