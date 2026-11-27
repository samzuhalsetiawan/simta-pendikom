"use client";

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Loader2, XCircle } from "lucide-react";
import { cancelProposalApprovalRequest } from "@/lib/actions/proposal";
import { toast } from "sonner";
import { CancelProposalApprovalModal } from "@/components/Modal/cancel-proposal-approval-modal";

interface CancelProposalApprovalButtonProps {
    proposalId: string;
}

export default function CancelProposalApprovalButton({ proposalId }: CancelProposalApprovalButtonProps) {
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleCancel = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await cancelProposalApprovalRequest(proposalId);
        
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Permohonan persetujuan proposal berhasil dibatalkan!");
            setIsConfirmOpen(false);
        }
        setLoading(false);
    };

    return (
        <>
            <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-bold justify-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all hover:-translate-y-0.5"
                onClick={() => setIsConfirmOpen(true)}
            >
                <XCircle className="h-4 w-4" />
                Batalkan Permintaan Persetujuan Proposal
            </Button>

            <CancelProposalApprovalModal
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={handleCancel}
                loading={loading}
            />
        </>
    );
}
