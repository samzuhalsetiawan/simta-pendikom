import { notFound } from "next/navigation"
import { getThesisDetail, getLecturersInfoCardData } from "@/lib/dal/thesis"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { SharedPdfPreview } from "@/components/shared/shared-pdf-preview"
import { StudentInfoCard } from "@/components/shared/student-info-card"
import { ProposalOrThesisInfoCard } from "@/components/shared/proposal-or-thesis-info-card"
import { LecturersInfoCardList } from "@/components/shared/lecturers-info-card-list"
import { DocumentDetailLayout } from "@/components/layout/document-detail-layout"
import { Button } from "@/components/base/button"
import { FileText } from "lucide-react"
import Link from "next/link"
import { uploadProposalPdf } from "@/lib/actions/proposal"
import { uploadThesisPdf } from "@/lib/actions/thesis"

export default async function SkripsiDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() })
    const thesis = await getThesisDetail(id)

    if (!thesis) {
        notFound()
    }

    const lecturers = await getLecturersInfoCardData(thesis.id)
    const isOwner = session?.user?.username === thesis.nim

    const isProposalStage = thesis.progress === 'pengajuan_proposal' || thesis.progress === 'seminar_proposal';
    const isProposalEditable = isOwner && (thesis.proposal_approval_status === 'unrequested' || thesis.proposal_approval_status === 'rejected');

    const getStageVariant = (progress: string) => {
        switch (progress) {
            case "lulus":
                return "lulus";
            case "pendadaran":
                return "sidang-skripsi";
            case "seminar_hasil":
            case "penelitian":
                return "seminar-hasil";
            case "seminar_proposal":
                return "seminar-proposal";
            case "pengajuan_proposal":
            default:
                return "pengajuan-proposal";
        }
    };

    const variant = getStageVariant(thesis.progress);

    // Bound action for proposal upload
    const handleProposalUpload = async (formData: FormData) => {
        "use server";
        return await uploadProposalPdf(id, formData);
    };

    // Bound action for thesis upload
    const handleThesisUpload = async (formData: FormData) => {
        "use server";
        return await uploadThesisPdf(id, formData);
    };

    const documentType = isProposalStage ? "proposal" : "thesis";
    const documentUrl = isProposalStage ? thesis.proposal_url : thesis.thesis_url;
    const documentTitle = isProposalStage ? "Preview Dokumen Proposal" : "Preview Dokumen Skripsi";
    const emptyMsg = isProposalStage ? "Belum ada file proposal yang diupload" : "Belum ada file skripsi yang diupload";
    const uploadHandler = isProposalStage ? handleProposalUpload : handleThesisUpload;
    const isUploadAllowed = isProposalStage ? isProposalEditable : isOwner;

    return (
        <DocumentDetailLayout
            breadcrumbs={[
                { label: "Skripsi", href: "/skripsi" },
                { label: thesis.title || (isProposalStage ? "Detail Proposal" : "Detail Skripsi") }
            ]}
            title={thesis.title || (isProposalStage ? "Detail Proposal" : "Detail Skripsi")}
            subtitle={isProposalStage ? "Pengajuan Proposal" : "Skripsi"}
            leftNode={
                <>
                    <StudentInfoCard nim={thesis.nim} variant={variant} />
                    <ProposalOrThesisInfoCard 
                        documentId={thesis.id} 
                        type={documentType}
                        isEditable={isProposalStage ? isProposalEditable : isOwner}
                        variant={variant}
                        footerNode={
                            isProposalStage ? (
                                <Link href={`/persetujuan-proposal/${thesis.id}`} className="block w-full">
                                    <Button variant="outline" className="w-full h-10 rounded-xl font-bold text-xs gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary/90 cursor-pointer">
                                        <FileText className="h-3.5 w-3.5" />
                                        Lihat Surat Persetujuan Proposal
                                    </Button>
                                </Link>
                            ) : undefined
                        }
                    />
                    <LecturersInfoCardList lecturers={lecturers} variant={variant} hideIcon={true} />
                </>
            }
            rightNode={
                <SharedPdfPreview 
                    title={documentTitle}
                    url={documentUrl} 
                    isUploadable={isUploadAllowed}
                    uploadAction={uploadHandler}
                    thesisId={thesis.id}
                    isOwner={isOwner}
                    emptyMessage={emptyMsg}
                    variant={variant}
                    subtitle={documentUrl ? "Terakhir diupload" : undefined}
                />
            }
        />
    )
}
