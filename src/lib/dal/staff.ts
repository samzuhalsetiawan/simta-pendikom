import { db } from "@/lib/db";
import { StudentThesisData, PipelineStats, GraduationStat, InactiveStudent } from "./lecturer";

export type LecturerStudentInfo = {
    nim: string;
    student_name: string;
    student_image: string | null;
    generation_year: number;
    progress: string;
};

export type LecturerWithStudents = {
    nip: string;
    name: string;
    image: string | null;
    students: LecturerStudentInfo[];
    total_students: number;
    avg_progress: number;
};

// === Queries ===

export async function getStaffDashboardData() {
    // Get all students with thesis
    const [allStudents] = await db.execute(`
        SELECT s.nim, u.name as student_name, t.title, BIN_TO_UUID(t.id) as thesis_id, t.research_type, t.progress
        FROM thesis t
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
    `) as any[];

    const allThesisStudents = allStudents as StudentThesisData[];

    return {
        allThesisStudents: allThesisStudents,
        activeStudents: allThesisStudents.filter(s => s.progress !== 'lulus'),
        graduatedStudents: allThesisStudents.filter(s => s.progress === 'lulus'),
    };
}

export async function getStaffPipelineStats(): Promise<PipelineStats> {
    const [rows] = await db.execute(`
        SELECT progress, COUNT(*) as count
        FROM thesis
        GROUP BY progress
    `) as any[];

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

export async function getStaffGraduationStats(): Promise<GraduationStat[]> {
    const [rows] = await db.execute(`
        SELECT 
            CONCAT(YEAR(tph.changed_at), ' ', IF(MONTH(tph.changed_at) <= 6, 'Ganjil', 'Genap')) as period,
            COUNT(*) as count
        FROM thesis_progress_history tph
        JOIN thesis t ON tph.thesis_id = t.id
        WHERE tph.to_progress = 'lulus'
        GROUP BY period
        ORDER BY MIN(tph.changed_at) ASC
    `) as any[];

    return rows as GraduationStat[];
}

export async function getStaffInactiveStudents(): Promise<InactiveStudent[]> {
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
            FROM thesis t
            JOIN student s ON t.nim = s.nim
            JOIN user u ON s.nim = u.username
            WHERE t.progress != 'lulus'
        ) as subquery
        ORDER BY score ASC, days_inactive DESC
    `) as any[];

    const nims = rows.map((r: any) => r.nim);
    let supervisorsMap: Record<string, any[]> = {};

    if (nims.length > 0) {
        const placeholders = nims.map(() => '?').join(',');
        const [supervisorRows] = await db.execute(`
            SELECT 
                t.nim, 
                u.name, 
                u.image, 
                tl.lecturer_nip as nip, 
                tl.position
            FROM thesis t
            JOIN thesis_lecturer tl ON t.id = tl.thesis_id
            JOIN user u ON tl.lecturer_nip = u.username
            WHERE t.nim IN (${placeholders}) AND tl.role = 'supervisor'
            ORDER BY t.nim, tl.position ASC
        `, nims) as any[];

        supervisorRows.forEach((row: any) => {
            if (!supervisorsMap[row.nim]) {
                supervisorsMap[row.nim] = [];
            }
            supervisorsMap[row.nim].push({
                name: row.name,
                image: row.image,
                nip: row.nip,
                position: row.position
            });
        });
    }

    return rows.map((r: any) => ({
        ...r,
        score: Number(r.score),
        days_inactive: Number(r.days_inactive),
        last_activity_date: r.last_activity_date ? new Date(r.last_activity_date).toISOString() : null,
        supervisors: supervisorsMap[r.nim] || []
    }));
}

export async function getLecturerWorkloads(): Promise<LecturerWithStudents[]> {
    // Get all lecturers
    const [lecturers] = await db.execute(`
        SELECT l.nip, u.name, u.image
        FROM lecturer l
        JOIN user u ON l.nip = u.username
        ORDER BY u.name ASC
    `) as any[];

    // Get all active supervised students
    const [students] = await db.execute(`
        SELECT 
            tl.lecturer_nip,
            s.nim,
            su.name as student_name,
            su.image as student_image,
            s.generation_year,
            t.progress
        FROM thesis_lecturer tl
        JOIN thesis t ON tl.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user su ON s.nim = su.username
        WHERE tl.role = 'supervisor' AND t.progress != 'lulus'
        ORDER BY s.generation_year ASC, su.name ASC
    `) as any[];

    // Ordered list of thesis stages
    const THESIS_STAGES = [
        'pengajuan_proposal',
        'seminar_proposal',
        'penelitian',
        'seminar_hasil',
        'pendadaran',
        'lulus'
    ];

    // Group students by lecturer
    const studentMap = new Map<string, LecturerStudentInfo[]>();
    (students as any[]).forEach((s: any) => {
        const list = studentMap.get(s.lecturer_nip) || [];
        list.push({
            nim: s.nim,
            student_name: s.student_name,
            student_image: s.student_image,
            generation_year: s.generation_year,
            progress: s.progress,
        });
        studentMap.set(s.lecturer_nip, list);
    });

    return (lecturers as any[]).map((l: any) => {
        const lecStudents = studentMap.get(l.nip) || [];
        const totalProgress = lecStudents.reduce((sum, s) => {
            const stageIndex = THESIS_STAGES.indexOf(s.progress);
            const progressValue = stageIndex >= 0 
                ? ((stageIndex + 1) / THESIS_STAGES.length) * 100 
                : 0;
            return sum + progressValue;
        }, 0);
        const avgProgress = lecStudents.length > 0 ? Math.round(totalProgress / lecStudents.length) : 0;

        return {
            nip: l.nip,
            name: l.name,
            image: l.image,
            students: lecStudents,
            total_students: lecStudents.length,
            avg_progress: avgProgress,
        };
    }).sort((a, b) => b.total_students - a.total_students);
}

export async function getStaffRole(nip: string): Promise<string | null> {
    const [rows] = await db.execute(`
        SELECT role FROM staff WHERE nip = ?
    `, [nip]) as any[];
    
    if (rows && rows.length > 0) {
        return rows[0].role;
    }
    return null;
}

export type StaffListItem = {
    nip: string;
    name: string;
    role: string;
    email: string | null;
    image: string | null;
    phone_number: string | null;
};

export async function getAllStaffMembers(): Promise<StaffListItem[]> {
    const [rows] = await db.execute(`
        SELECT s.nip, s.role, u.name, u.email, u.image, u.phone_number
        FROM staff s
        JOIN user u ON s.nip = u.username
        ORDER BY 
            CASE 
                WHEN s.role = 'koordinator_program_studi' THEN 1
                WHEN s.role = 'ketua_jurusan' THEN 2
                ELSE 3
            END,
            u.name ASC
    `) as any[];
    return rows as StaffListItem[];
}

