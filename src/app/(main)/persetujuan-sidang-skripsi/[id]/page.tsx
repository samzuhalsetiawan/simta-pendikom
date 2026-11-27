import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getThesisDetail } from "@/lib/dal/thesis";
import { getPendadaranSigners } from "@/lib/dal/seminar";
import { DocumentDetailLayout } from "@/components/layout/document-detail-layout";
import { StudentInfoCard } from "@/components/shared/student-info-card";
import { ProposalOrThesisInfoCard } from "@/components/shared/proposal-or-thesis-info-card";
import { SidangSkripsiSignersCardList } from "@/components/shared/sidang-skripsi-signers-card-list";
import { SharedPdfPreview } from "@/components/shared/shared-pdf-preview";
import { SeminarActionController } from "@/app/(main)/dashboard/_components/staff/seminar-action-controller";

export default async function PersetujuanSidangSkripsiPage({ params }: { params: Promise<{ id: string }> }) {
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
                SELECT id FROM pendadaran_approval 
                WHERE pendadaran_id = UUID_TO_BIN(?) AND lecturer_nip = ? AND status = 'pending'
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
        SELECT BIN_TO_UUID(p.id) as id, p.status, p.surat_permohonan_pendadaran_url as document_url,
               BIN_TO_UUID(p.thesis_id) as thesis_id
        FROM pendadaran p
        WHERE p.id = UUID_TO_BIN(?)
    `, [id]) as any[];

    if (rows.length === 0) {
        notFound();
    }

    const req = rows[0];

    const thesis = await getThesisDetail(req.thesis_id);
    if (!thesis) {
        notFound();
    }

    const signers = await getPendadaranSigners(id, req.thesis_id);

    const pdfUrl = req.document_url || `/api/pdf/sidang-skripsi/${id}?v=${Date.now()}`;

    return (
        <DocumentDetailLayout
            breadcrumbs={[
                { label: "Sidang Skripsi", href: "/sidang-skripsi" },
                { label: thesis.title || "Detail Sidang Skripsi" }
            ]}
            title={thesis.title || "Persetujuan Sidang Skripsi"}
            subtitle="Persetujuan Sidang Skripsi"
            leftNode={
                <>
                    <SeminarActionController 
                        id={req.id}
                        type="pendadaran"
                        jenisName="Sidang Skripsi"
                        status={req.status}
                        isStaff={isStaff}
                        lecturerApprovalId={lecturerApproval?.id}
                        hasSignature={lecturerApproval?.hasSignature}
                    />
                    <StudentInfoCard nim={thesis.nim} variant="sidang-skripsi" />
                    <ProposalOrThesisInfoCard 
                        documentId={thesis.id} 
                        type="thesis"
                        isEditable={false} 
                    />
                    <SidangSkripsiSignersCardList signers={signers} />
                </>
            }
            rightNode={
                <SharedPdfPreview 
                    title="Preview Surat Persetujuan Sidang Skripsi"
                    url={pdfUrl} 
                    isUploadable={false}
                    variant="sidang-skripsi"
                    subtitle="Dokumen Persetujuan Pelaksanaan Ujian Sidang Skripsi"
                />
            }
        />
    );
}
