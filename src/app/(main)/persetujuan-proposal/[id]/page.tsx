import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getProposalWithApprovals } from "@/lib/dal/proposal";
import { DocumentDetailLayout } from "@/components/layout/document-detail-layout";
import { StudentInfoCard } from "@/components/shared/student-info-card";
import { ProposalOrThesisInfoCard } from "@/components/shared/proposal-or-thesis-info-card";
import { ApprovalSignersCardList } from "@/components/shared/approval-signers-card-list";
import { SharedPdfPreview } from "@/components/shared/shared-pdf-preview";
import { ProposalActionController } from "@/app/(main)/dashboard/_components/shared/proposal-action-controller";

export default async function PersetujuanProposalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    let pendingApprovals: { id: number, role: string }[] = [];
    let hasSignature = false;

    if (session && session.user.username) {
        const [staffRows] = await db.execute("SELECT role FROM staff WHERE nip = ?", [session.user.username]) as any[];

        const [userRows] = await db.execute("SELECT signature FROM user WHERE username = ?", [session.user.username]) as any[];
        hasSignature = !!(userRows[0]?.signature);

        const [approvalRows] = await db.execute(`
            SELECT id, assigned_role 
            FROM proposal_approval 
            WHERE thesis_id = UUID_TO_BIN(?) AND lecturer_nip = ? AND status = 'pending'
        `, [id, session.user.username]) as any[];

        pendingApprovals = approvalRows.map((row: any) => ({
            id: row.id,
            role: row.assigned_role
        }));
    }

    const req = await getProposalWithApprovals(id);

    if (!req) {
        notFound();
    }


    // Pass Date.now() to pdf url so it refreshes when router.refresh() is called by the client component
    const pdfUrl = `/api/pdf/proposal/${id}?v=${Date.now()}`;

    return (
        <DocumentDetailLayout
            breadcrumbs={[
                { label: "Persetujuan Proposal", href: "/dashboard" },
                { label: req.title || "Detail Proposal" }
            ]}
            title={req.title || "Persetujuan Proposal"}
            subtitle="Persetujuan Proposal"
            leftNode={
                <>
                    <ProposalActionController 
                        pendingApprovals={pendingApprovals}
                        hasSignature={hasSignature}
                    />

                    <StudentInfoCard nim={req.nim} variant="pengajuan-proposal" />
                    <ProposalOrThesisInfoCard 
                        documentId={req.id} 
                        type="proposal"
                        variant="pengajuan-proposal"
                    />
                    <ApprovalSignersCardList approvals={req.approvals} variant="pengajuan-proposal" hideIcon={true} />


                </>
            }
            rightNode={
                <SharedPdfPreview 
                    title="Preview Surat Persetujuan Proposal"
                    url={pdfUrl}
                    isUploadable={false}
                />
            }
        />
    );
}
