import { db } from "@/lib/db";

// === Types ===

export type PendingSeminarRequest = {
    id: string;
    type: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';
    student_name: string;
    student_nim: string;
    student_image?: string | null;
    thesis_title: string;
    created_at: string;
    status?: string;
    supervisors?: any;
};

export type SeminarInvitation = {
    id: string;
    type: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';
    student_name: string;
    student_nim: string;
    thesis_title: string;
    scheduled_date: string;
    venue: string | null;
    lecturer_role: 'supervisor' | 'examiner';
};

// === Queries ===

export async function getPendingSeminarRequests(): Promise<PendingSeminarRequest[]> {
    const requests: PendingSeminarRequest[] = [];

    // Seminar Proposal
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            'seminar_proposal' as type,
            u.name as student_name,
            u.username as student_nim,
            u.image as student_image,
            t.title as thesis_title,
            sp.created_at,
            sp.status,
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT('name', lu.name, 'image', lu.image))
                FROM thesis_lecturer tl
                JOIN user lu ON tl.lecturer_nip = lu.username
                WHERE tl.thesis_id = t.id AND tl.role = 'supervisor'
            ) as supervisors
        FROM seminar_proposal sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE sp.status = 'pending_schedule'
        ORDER BY sp.created_at ASC
    `) as any[];

    proposals.forEach((r: any) => requests.push({
        ...r,
        created_at: r.created_at.toISOString(),
    }));

    // Seminar Hasil
    const [hasilRequests] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sh.id) as id,
            'seminar_hasil' as type,
            u.name as student_name,
            u.username as student_nim,
            u.image as student_image,
            t.title as thesis_title,
            sh.created_at,
            sh.status,
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT('name', lu.name, 'image', lu.image))
                FROM thesis_lecturer tl
                JOIN user lu ON tl.lecturer_nip = lu.username
                WHERE tl.thesis_id = t.id AND tl.role = 'supervisor'
            ) as supervisors
        FROM seminar_hasil sh
        JOIN thesis t ON sh.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE sh.status = 'pending_schedule'
        ORDER BY sh.created_at ASC
    `) as any[];

    hasilRequests.forEach((r: any) => requests.push({
        ...r,
        created_at: r.created_at.toISOString(),
    }));

    // Pendadaran
    const [pendadaranRequests] = await db.execute(`
        SELECT 
            BIN_TO_UUID(p.id) as id,
            'pendadaran' as type,
            u.name as student_name,
            u.username as student_nim,
            u.image as student_image,
            t.title as thesis_title,
            p.created_at,
            p.status,
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT('name', lu.name, 'image', lu.image))
                FROM thesis_lecturer tl
                JOIN user lu ON tl.lecturer_nip = lu.username
                WHERE tl.thesis_id = t.id AND tl.role = 'supervisor'
            ) as supervisors
        FROM pendadaran p
        JOIN thesis t ON p.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE p.status IN ('pending_schedule', 'pending_staff_approval')
        ORDER BY p.created_at ASC
    `) as any[];

    pendadaranRequests.forEach((r: any) => requests.push({
        ...r,
        created_at: r.created_at.toISOString(),
    }));

    // Sort by created_at (oldest first)
    return requests.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function getLecturerSeminarInvitations(lecturerNip: string): Promise<SeminarInvitation[]> {
    const invitations: SeminarInvitation[] = [];

    // Seminar Proposal invitations
    const [proposals] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sp.id) as id,
            'seminar_proposal' as type,
            u.name as student_name,
            u.username as student_nim,
            t.title as thesis_title,
            sp.scheduled_date,
            sp.venue,
            tl.role as lecturer_role
        FROM seminar_proposal sp
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        JOIN seminar_proposal_approval spa ON sp.id = spa.seminar_proposal_id AND spa.lecturer_nip = tl.lecturer_nip
        WHERE tl.lecturer_nip = ? 
          AND sp.status = 'approved'
          AND spa.invitation_read = FALSE
        ORDER BY sp.scheduled_date ASC
    `, [lecturerNip]) as any[];

    proposals.forEach((r: any) => invitations.push({
        ...r,
        scheduled_date: r.scheduled_date.toISOString(),
    }));

    // Seminar Hasil invitations
    const [hasilInvitations] = await db.execute(`
        SELECT 
            BIN_TO_UUID(sh.id) as id,
            'seminar_hasil' as type,
            u.name as student_name,
            u.username as student_nim,
            t.title as thesis_title,
            sh.scheduled_date,
            sh.venue,
            tl.role as lecturer_role
        FROM seminar_hasil sh
        JOIN thesis t ON sh.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        JOIN seminar_hasil_approval sha ON sh.id = sha.seminar_hasil_id AND sha.lecturer_nip = tl.lecturer_nip
        WHERE tl.lecturer_nip = ? 
          AND sh.status = 'approved'
          AND sha.invitation_read = FALSE
        ORDER BY sh.scheduled_date ASC
    `, [lecturerNip]) as any[];

    hasilInvitations.forEach((r: any) => invitations.push({
        ...r,
        scheduled_date: r.scheduled_date.toISOString(),
    }));

    // Pendadaran invitations
    const [pendadaranInvitations] = await db.execute(`
        SELECT 
            BIN_TO_UUID(p.id) as id,
            'pendadaran' as type,
            u.name as student_name,
            u.username as student_nim,
            t.title as thesis_title,
            p.scheduled_date,
            p.venue,
            tl.role as lecturer_role
        FROM pendadaran p
        JOIN thesis t ON p.thesis_id = t.id
        JOIN thesis_lecturer tl ON t.id = tl.thesis_id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        JOIN pendadaran_approval pa ON p.id = pa.pendadaran_id AND pa.lecturer_nip = tl.lecturer_nip
        WHERE tl.lecturer_nip = ? 
          AND p.status = 'approved'
          AND pa.invitation_read = FALSE
        ORDER BY p.scheduled_date ASC
    `, [lecturerNip]) as any[];

    pendadaranInvitations.forEach((r: any) => invitations.push({
        ...r,
        scheduled_date: r.scheduled_date.toISOString(),
    }));

    // Sort by scheduled_date (soonest first)
    return invitations.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
}
