"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { respondToProposalApproval } from "@/lib/actions/proposal"
import { ApprovalActionButtons } from "./approval-action-buttons"
import { ApproveDocumentModal } from "./approve-document-modal"
import { RejectDocumentModal } from "./reject-document-modal"

interface ProposalActionControllerProps {
    pendingApprovals?: { id: number, role: string }[];
    hasSignature?: boolean;
}

export function ProposalActionController({ 
    pendingApprovals = [],
    hasSignature = false
}: ProposalActionControllerProps) {
    const router = useRouter();
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    if (pendingApprovals.length === 0) return null;

    const handleReject = async (reason: string, selectedIds: number[]) => {
        const res = await respondToProposalApproval(selectedIds, 'rejected', reason);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Permohonan telah ditolak");
            setIsRejectOpen(false);
            router.refresh();
        }
    };

    const handleApproveSubmit = async (useSignature: boolean, selectedIds: number[]) => {
        const res = await respondToProposalApproval(selectedIds, 'approved', undefined, useSignature);
        
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Permohonan telah disetujui");
            setIsApproveOpen(false);
            router.refresh();
        }
    };

    return (
        <>
            <ApprovalActionButtons 
                onApproveClick={() => setIsApproveOpen(true)}
                onRejectClick={() => setIsRejectOpen(true)}
            />

            <RejectDocumentModal 
                isOpen={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                onReject={handleReject}
                documentName="Proposal"
                pendingApprovals={pendingApprovals}
            />

            <ApproveDocumentModal 
                isOpen={isApproveOpen}
                onOpenChange={setIsApproveOpen}
                onApprove={handleApproveSubmit}
                hasSignature={hasSignature}
                documentName="Surat Persetujuan Proposal"
                pendingApprovals={pendingApprovals}
            />
        </>
    )
}
