import { db } from "@/lib/db";

// === Queries ===

export async function getPostEventTasks(lecturerNip: string) {
    const [consultations] = await db.execute(`
        SELECT 
            BIN_TO_UUID(c.id) as id, 
            'consultation' as type,
            c.consultation_date as date,
            u.name as student_name,
            u.username as student_nim
        FROM consultation c
        JOIN user u ON c.student_nim = u.username
        WHERE c.lecturer_nip = ? 
          AND c.status = 'approved' 
          AND c.consultation_date < NOW()
    `, [lecturerNip]) as any[];

    return consultations.map((task: any) => ({
        ...task,
        date: task.date.toISOString()
    }));
}

export async function getLecturerSeminarApprovals(lecturerNip: string, roleContext: 'lecturer' | 'staff' | 'all' = 'all') {
    let roleFilter = "";
    if (roleContext === 'lecturer') {
        roleFilter = `AND a.assigned_role IN ('supervisor', 'examiner')`;
    } else if (roleContext === 'staff') {
        roleFilter = `AND a.assigned_role IN ('ketua_jurusan', 'koordinator_program_studi')`;
    }
    const [proposalApprovals] = await db.execute(`
        SELECT 
            a.id as approval_id, 
            'seminar_proposal' as type,
            BIN_TO_UUID(sp.id) as seminar_id,
            sp.created_at,
            u.name as student_name,
            u.username as student_nim,
            t.title as thesis_title
        FROM seminar_proposal_approval a
        JOIN seminar_proposal sp ON a.seminar_proposal_id = sp.id
        JOIN thesis t ON sp.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE a.lecturer_nip = ? 
          AND a.status = 'pending'
          AND sp.status = 'pending_approval'
          ${roleFilter}
    `, [lecturerNip]) as any[];

    const [hasilApprovals] = await db.execute(`
        SELECT 
            a.id as approval_id, 
            'seminar_hasil' as type,
            BIN_TO_UUID(sh.id) as seminar_id,
            sh.created_at,
            u.name as student_name,
            u.username as student_nim,
            t.title as thesis_title
        FROM seminar_hasil_approval a
        JOIN seminar_hasil sh ON a.seminar_hasil_id = sh.id
        JOIN thesis t ON sh.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE a.lecturer_nip = ? 
          AND a.status = 'pending'
          AND sh.status = 'pending_approval'
          ${roleFilter}
    `, [lecturerNip]) as any[];

    const [pendadaranApprovals] = await db.execute(`
        SELECT 
            a.id as approval_id, 
            'pendadaran' as type,
            BIN_TO_UUID(p.id) as seminar_id,
            p.created_at,
            u.name as student_name,
            u.username as student_nim,
            t.title as thesis_title
        FROM pendadaran_approval a
        JOIN pendadaran p ON a.pendadaran_id = p.id
        JOIN thesis t ON p.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE a.lecturer_nip = ? 
          AND a.status = 'pending'
          AND p.status = 'pending_approval'
          ${roleFilter}
    `, [lecturerNip]) as any[];

    return [...proposalApprovals, ...hasilApprovals, ...pendadaranApprovals].map((task: any) => ({
        ...task,
        created_at: task.created_at.toISOString()
    })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
