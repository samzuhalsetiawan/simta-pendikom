import { db } from "@/lib/db";
import { getLecturerStudentDetail } from "@/lib/dal/lecturer";
import { getSignatureBuffer } from "@/lib/services/signature";

export async function getSeminarPdfData(id: string, seminarType: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran') {
    const [seminarRows] = await db.execute(
        `SELECT BIN_TO_UUID(thesis_id) as thesis_id, scheduled_date, venue FROM ${seminarType} WHERE id = UUID_TO_BIN(?)`,
        [id]
    ) as any[];

    if (seminarRows.length === 0) {
        return null;
    }
    const seminarInfo = seminarRows[0];
    const thesisId = seminarInfo.thesis_id;

    let proposalTitle = null;
    if (seminarType === 'seminar_proposal') {
        const [thesisRows] = await db.execute(
            `SELECT title FROM thesis WHERE id = UUID_TO_BIN(?)`,
            [thesisId]
        ) as any[];
        if (thesisRows.length > 0) {
            proposalTitle = thesisRows[0].title;
        }
    }

    const studentDetail = await getLecturerStudentDetail(thesisId);

    if (!studentDetail) {
        return null;
    }

    // Fetch approvals and signatures
    const approvalTable = `${seminarType}_approval`;
    const idCol = `${seminarType}_id`;
    const [allApprovals] = await db.execute(
        `SELECT a.lecturer_nip, a.status, a.use_signature, u.signature FROM ${approvalTable} a JOIN user u ON a.lecturer_nip = u.username WHERE a.${idCol} = UUID_TO_BIN(?)`, 
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
    const examinersData = await Promise.all(studentDetail.lecturers.filter(l => l.role === 'examiner').map(mapLecturer));

    return {
        studentName: studentDetail.student_name,
        studentNim: studentDetail.nim,
        programStudi: "Pendidikan Komputer",
        thesisTitle: proposalTitle || studentDetail.title || "Belum ada judul",
        proposedDate: seminarInfo.scheduled_date ? new Date(seminarInfo.scheduled_date).toISOString() : "",
        venue: seminarInfo.venue || "",
        supervisors: supervisorsData,
        examiners: examinersData,
    };
}
