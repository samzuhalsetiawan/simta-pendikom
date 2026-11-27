import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getThesisDetail } from "@/lib/dal/thesis";
import { getStudentProposal } from "@/lib/dal/proposal";
import { getSeminarProposalSigners } from "@/lib/dal/seminar";
import { DocumentDetailLayout } from "@/components/layout/document-detail-layout";
import { StudentInfoCard } from "@/components/shared/student-info-card";
import { ProposalOrThesisInfoCard } from "@/components/shared/proposal-or-thesis-info-card";
import { SeminarProposalSignersCardList } from "@/components/shared/seminar-proposal-signers-card-list";
import { SharedPdfPreview } from "@/components/shared/shared-pdf-preview";
import { SeminarActionController } from "@/app/(main)/dashboard/_components/staff/seminar-action-controller";

export default async function PersetujuanSeminarProposalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    let isStaff = false;
    let lecturerApproval = undefined;

    if (session && session.user.username) {
        const [staffRows] = await db.execute("SELECT role FROM staff WHERE nip = ?", [session.user.username]) as any[];
        isStaff = staffRows.length > 0;

        const [lecturerRows] = await db.execute("SELECT nip FROM lecturer WHERE nip = ?", [session.user.username]) as any[];
        if (lecturerRows.length > 0) {
            const [userRows] = await db.execute("SELECT signature FROM user WHERE username = ?", [session.user.username]) as any[];
            const hasSignature = !!(userRows[0]?.signature);

            const [approvalRows] = await db.execute(`
                SELECT id FROM seminar_proposal_approval 
                WHERE seminar_proposal_id = UUID_TO_BIN(?) AND lecturer_nip = ? AND status = 'pending'
            `, [id, session.user.username]) as any[];

            if (approvalRows.length > 0) {
                lecturerApproval = {
                    id: approvalRows[0].id,
                    hasSignature
                };
            }
        }
    }

    const [rows] = await db.execute(`
        SELECT BIN_TO_UUID(sp.id) as id, sp.status, 
               BIN_TO_UUID(sp.thesis_id) as thesis_id
        FROM seminar_proposal sp
        WHERE sp.id = UUID_TO_BIN(?)
    `, [id]) as any[];

    if (rows.length === 0) {
        notFound();
    }

    const req = rows[0];

    const thesis = await getThesisDetail(req.thesis_id);
    if (!thesis) {
        notFound();
    }

    const signers = await getSeminarProposalSigners(id, req.thesis_id);

    const proposal = await getStudentProposal(thesis.nim);
    
    // Pass Date.now() to pdf url so it refreshes when router.refresh() is called by the client component
    const pdfUrl = `/api/pdf/seminar-proposal/${id}?v=${Date.now()}`;

    return (
        <DocumentDetailLayout
            breadcrumbs={[
                { label: "Persetujuan Seminar Proposal", href: "/dashboard" },
                { label: proposal?.title || "Detail Seminar Proposal" }
            ]}
            title={proposal?.title || "Persetujuan Seminar Proposal"}
            subtitle="Persetujuan Seminar Proposal"
            leftNode={
                <>
                    <SeminarActionController 
                        id={req.id}
                        type="seminar_proposal"
                        jenisName="Seminar Proposal"
                        status={req.status}
                        isStaff={isStaff}
                        lecturerApprovalId={lecturerApproval?.id}
                        hasSignature={lecturerApproval?.hasSignature}
                    />

                    <StudentInfoCard nim={thesis.nim} variant="seminar-proposal" />
                    <ProposalOrThesisInfoCard 
                        documentId={thesis.id} 
                        type="proposal"
                        variant="seminar-proposal"
                    />
                    <SeminarProposalSignersCardList signers={signers} variant="seminar-proposal" />
                </>
            }
            rightNode={
                <SharedPdfPreview 
                    title="Preview Surat Persetujuan"
                    url={pdfUrl}
                    isUploadable={false}
                />
            }
        />
    );
}
