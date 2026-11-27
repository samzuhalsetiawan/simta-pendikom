import { db } from "@/lib/db";
import { getLecturerStudentDetail } from "@/lib/dal/lecturer";
import { getSignatureBuffer } from "@/lib/services/signature";

export async function getProposalPdfData(id: string) {
    const [thesisRows] = await db.execute(
        `SELECT BIN_TO_UUID(t.id) as id, t.title, t.nim, BIN_TO_UUID(t.id) as thesis_id FROM thesis t WHERE t.id = UUID_TO_BIN(?)`,
        [id]
    ) as any[];

    if (thesisRows.length === 0) {
        return null;
    }
    const thesisInfo = thesisRows[0];
    const thesisId = thesisInfo.thesis_id;

    const studentDetail = await getLecturerStudentDetail(thesisId);

    if (!studentDetail) {
        return null;
    }

    // Fetch approvals and signatures
    const [allApprovals] = await db.execute(
        `SELECT a.lecturer_nip, a.status, a.use_signature, u.signature FROM proposal_approval a JOIN user u ON a.lecturer_nip = u.username WHERE a.thesis_id = UUID_TO_BIN(?)`, 
        [id]
    ) as any[];

    const mapLecturer = async (l: any) => {
        const approval = allApprovals.find((a: any) => a.lecturer_nip === l.nip);
        let signatureBuffer = null;
        
        if (approval && approval.status === 'approved' && approval.use_signature && approval.signature) {
            signatureBuffer = await getSignatureBuffer(approval.signature);
        }

        return {
            name: l.name,
            nip: l.nip,
            role: l.role,
            position: l.position,
            approvalStatus: (approval ? approval.status : 'pending') as 'pending' | 'approved' | 'rejected',
            signatureBuffer,
        };
    };

    const supervisorsData = await Promise.all(studentDetail.lecturers.filter(l => l.role === 'supervisor').map(mapLecturer));

    // Find Kajur and Kaprodi from the staff table based on approvals
    const [staffRows] = await db.execute("SELECT s.nip, s.role, u.name FROM staff s JOIN user u ON s.nip = u.username") as any[];
    const staffMap = new Map(staffRows.map((s: any) => [s.nip, s]));

    let ketuaJurusan = null;
    let koordinatorProdi = null;

    for (const approval of allApprovals) {
        const staff = staffMap.get(approval.lecturer_nip) as any;
        if (staff) {
            const mappedStaff = await mapLecturer(staff);
            if (staff.role === 'ketua_jurusan') ketuaJurusan = mappedStaff;
            if (staff.role === 'koordinator_program_studi') koordinatorProdi = mappedStaff;
        }
    }

    return {
        studentName: studentDetail.student_name,
        studentNim: studentDetail.nim,
        programStudi: "Pendidikan Komputer",
        thesisTitle: thesisInfo.title || studentDetail.title || "Belum ada judul",
        supervisors: supervisorsData,
        ketuaJurusan,
        koordinatorProdi
    };
}
