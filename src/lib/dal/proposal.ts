import { db } from "../db";

export async function getStudentProposal(nim: string) {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT 
                BIN_TO_UUID(id) as id,
                title,
                nim,
                research_type,
                research_method,
                proposal_url,
                proposal_approval_status as approval_status,
                createdAt as created_at,
                updatedAt as updated_at
             FROM thesis 
             WHERE nim = ? 
             ORDER BY createdAt DESC LIMIT 1`,
            [nim]
        ) as any[];

        if (rows.length === 0) return null;

        const proposal = rows[0];

        // Fetch approvals if any
        const [approvals] = await connection.execute(
            `SELECT 
                pa.id,
                pa.lecturer_nip,
                u.name as lecturer_name,
                pa.status,
                pa.rejection_reason,
                pa.responded_at,
                pa.assigned_role
             FROM proposal_approval pa
             JOIN user u ON pa.lecturer_nip = u.username
             WHERE pa.thesis_id = UUID_TO_BIN(?)`,
            [proposal.id]
        ) as any[];

        // Fetch supervisor positions for lecturers
        const [tlRows] = await connection.execute(
            `SELECT lecturer_nip, position FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?)`,
            [proposal.id]
        ) as any[];
        const thesisLecturers: Record<string, number> = {};
        tlRows.forEach((row: any) => {
            thesisLecturers[row.lecturer_nip] = row.position;
        });

        // Map roles to approvals
        const mappedApprovals = approvals.map((app: any) => {
             let role = app.assigned_role;
             let position = 0;
             if (role === 'supervisor' || role === 'examiner') {
                 position = thesisLecturers[app.lecturer_nip] || 0;
             }
             return { ...app, role, position };
        });

        return {
            ...proposal,
            approvals: mappedApprovals
        };
    } catch (error) {
        console.error("Error fetching student proposal:", error);
        return null;
    } finally {
        connection.release();
    }
}

export async function getProposalById(id: string) {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT 
                BIN_TO_UUID(id) as id,
                title,
                nim,
                research_type,
                research_method,
                proposal_url,
                proposal_approval_status as approval_status,
                createdAt as created_at,
                updatedAt as updated_at
             FROM thesis 
             WHERE id = UUID_TO_BIN(?)`,
            [id]
        ) as any[];

        if (rows.length === 0) return null;

        return rows[0];
    } catch (error) {
        console.error("Error fetching proposal by ID:", error);
        return null;
    } finally {
        connection.release();
    }
}

export async function getPendingProposalApprovals(nip: string, roleContext: 'lecturer' | 'staff' | 'all' = 'all') {
    const connection = await db.getConnection();
    try {
        let roleFilter = "";
        if (roleContext === 'lecturer') {
            roleFilter = `AND pa.assigned_role IN ('supervisor', 'examiner')`;
        } else if (roleContext === 'staff') {
            roleFilter = `AND pa.assigned_role IN ('ketua_jurusan', 'koordinator_program_studi')`;
        }

        const [rows] = await connection.execute(
            `SELECT 
                pa.id as approval_id,
                BIN_TO_UUID(pa.thesis_id) as proposal_id,
                pa.status as approval_status,
                pa.responded_at,
                t.title,
                t.research_type,
                t.proposal_approval_status as overall_status,
                u.name as student_name,
                u.image as student_image,
                t.nim as student_nim,
                t.createdAt as created_at,
                (
                    SELECT JSON_ARRAYAGG(JSON_OBJECT('name', lu.name, 'image', lu.image))
                    FROM thesis_lecturer tl
                    JOIN user lu ON tl.lecturer_nip = lu.username
                    WHERE tl.thesis_id = t.id AND tl.role = 'supervisor'
                ) as supervisors
             FROM proposal_approval pa
             JOIN thesis t ON pa.thesis_id = t.id
             JOIN student s ON t.nim = s.nim
             JOIN user u ON s.nim = u.username
             WHERE pa.lecturer_nip = ? AND pa.status = 'pending' AND t.proposal_approval_status = 'pending' 
             ${roleFilter}
             ORDER BY t.createdAt DESC`,
            [nip]
        ) as any[];

        return rows;
    } catch (error) {
        console.error("Error fetching pending proposal approvals:", error);
        return [];
    } finally {
        connection.release();
    }
}

export async function getProposalWithApprovals(thesisId: string) {
    const connection = await db.getConnection();
    try {
        // Fetch thesis and student details
        const [thesisRows] = await connection.execute(
            `SELECT 
                BIN_TO_UUID(t.id) as id,
                t.title,
                t.nim,
                t.research_type,
                t.research_method,
                t.proposal_url,
                t.proposal_approval_status as approval_status,
                t.createdAt as created_at,
                u.name as student_name,
                u.image as student_image,
                s.generation_year,
                'Pendidikan Komputer' as program_studi,
                'Pendidikan Komputer' as jurusan,
                'Keguruan dan Ilmu Pendidikan' as fakultas,
                BIN_TO_UUID(t.id) as thesis_id
             FROM thesis t
             JOIN student s ON t.nim = s.nim
             JOIN user u ON s.nim = u.username
             WHERE t.id = UUID_TO_BIN(?)`,
            [thesisId]
        ) as any[];

        if (thesisRows.length === 0) return null;
        const proposal = thesisRows[0];

        // Fetch approvals with user details (for signatures)
        const [approvals] = await connection.execute(
            `SELECT 
                pa.id,
                pa.lecturer_nip,
                pa.status,
                pa.rejection_reason,
                pa.responded_at,
                pa.use_signature,
                pa.assigned_role,
                u.name as lecturer_name,
                u.image as lecturer_image,
                u.signature as signature_url
             FROM proposal_approval pa
             JOIN user u ON pa.lecturer_nip = u.username
             WHERE pa.thesis_id = UUID_TO_BIN(?)`,
            [thesisId]
        ) as any[];

        // Fetch supervisor positions for lecturers
        const [tlRows] = await connection.execute(
            `SELECT lecturer_nip as nip, position
             FROM thesis_lecturer
             WHERE thesis_id = UUID_TO_BIN(?)`,
            [thesisId]
        ) as any[];

        const mappedApprovals = approvals.map((app: any) => {
             let role = app.assigned_role;
             let position = 0;
             if (role === 'supervisor' || role === 'examiner') {
                 const lect = tlRows.find((l: any) => l.nip === app.lecturer_nip);
                 if (lect) {
                     position = lect.position;
                 }
             }
             return { ...app, role, position };
        });

        return {
            ...proposal,
            approvals: mappedApprovals,
            lecturers: tlRows
        };

    } catch (error) {
        console.error("Error fetching proposal with approvals:", error);
        return null;
    } finally {
        connection.release();
    }
}

export type ProposalListItem = {
    id: string;
    title: string | null;
    nim: string;
    research_type: string | null;
    research_method: string | null;
    proposal_url: string | null;
    approval_status: string;
    created_at: string;
    student_name: string;
    student_image: string | null;
    generation_year: string;
    approvals_count: number;
    approved_count: number;
    lecturers: {
        nip: string;
        name: string;
        role: string;
    }[];
};

export async function getAllProposalsWithDetails(): Promise<ProposalListItem[]> {
    const connection = await db.getConnection();
    try {
        const [theses] = await connection.execute(`
            SELECT 
                BIN_TO_UUID(t.id) as id,
                t.title,
                t.nim,
                t.research_type,
                t.research_method,
                t.proposal_url,
                t.proposal_approval_status as approval_status,
                t.createdAt as created_at,
                u.name as student_name,
                u.image as student_image,
                s.generation_year,
                BIN_TO_UUID(t.id) as thesis_id
            FROM thesis t
            JOIN student s ON t.nim = s.nim
            JOIN user u ON s.nim = u.username
            WHERE t.progress IN ('pengajuan_proposal', 'seminar_proposal')
            ORDER BY t.createdAt DESC
        `) as any[];

        if (theses.length === 0) return [];

        const thesisIds = Array.from(new Set(theses.map((p: any) => p.id))) as string[];
        const placeholders = thesisIds.map(() => 'UUID_TO_BIN(?)').join(', ');

        const [approvals] = await connection.execute(`
            SELECT 
                BIN_TO_UUID(thesis_id) as thesis_id,
                status
            FROM proposal_approval
            WHERE thesis_id IN (${placeholders})
        `, thesisIds) as any[];

        const approvalStats: Record<string, { total: number; approved: number }> = {};
        approvals.forEach((a: any) => {
            if (!approvalStats[a.thesis_id]) {
                approvalStats[a.thesis_id] = { total: 0, approved: 0 };
            }
            approvalStats[a.thesis_id].total += 1;
            if (a.status === 'approved') {
                approvalStats[a.thesis_id].approved += 1;
            }
        });

        const [lecturers] = await connection.execute(`
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
                role: l.role
            });
        });

        return theses.map((p: any) => ({
            id: p.id,
            title: p.title,
            nim: p.nim,
            research_type: p.research_type,
            research_method: p.research_method,
            proposal_url: p.proposal_url,
            approval_status: p.approval_status || 'unrequested',
            created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
            student_name: p.student_name,
            student_image: p.student_image,
            generation_year: String(p.generation_year || ''),
            approvals_count: approvalStats[p.id]?.total || 0,
            approved_count: approvalStats[p.id]?.approved || 0,
            lecturers: lecturersByThesisId[p.id] || []
        }));
    } catch (error) {
        console.error("Error fetching all proposals:", error);
        return [];
    } finally {
        connection.release();
    }
}

export type DocumentInfoCardData = {
    id: string;
    nim: string;
    title: string | null;
    research_type: string | null;
    research_method: string | null;
    approval_status?: string | null;
    updated_at: string | Date | null;
};

export async function getProposalInfoCardData(id: string): Promise<DocumentInfoCardData | null> {
    const [rows] = await db.execute(`
        SELECT 
            BIN_TO_UUID(id) as id,
            nim,
            title,
            research_type,
            research_method,
            proposal_approval_status as approval_status,
            COALESCE(updatedAt, createdAt) as updated_at
        FROM thesis
        WHERE id = UUID_TO_BIN(?)
    `, [id]) as any[];

    if (rows.length === 0) return null;
    return rows[0] as DocumentInfoCardData;
}
