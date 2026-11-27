"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { requestSeminarProposal } from "@/lib/actions/seminar";
import { RequestSeminarProposalModal } from "@/components/Modal/request-seminar-proposal-modal";

interface RequestSeminarProposalProps {
    thesisId: string;
    disabled?: boolean;
    attendanceCount?: number;
    hasProposalTitle?: boolean;
    hasApprovedProposal?: boolean;
}

export default function RequestSeminarProposal({ thesisId, disabled, attendanceCount = 0, hasProposalTitle = false, hasApprovedProposal = false }: RequestSeminarProposalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleTriggerClick = (e: React.MouseEvent) => {
        if (!hasProposalTitle) {
            e.preventDefault();
            toast.error("kamu wajib menentukan judul proposalmu terlebih dahulu sebelum mengajukan permohonan seminar");
        } else if (attendanceCount < 3) {
            e.preventDefault();
            toast.error("kamu belum menghadiri seminar (proposal/hasil) sebanyak minimal 3 kali");
        } else if (!hasApprovedProposal) {
            e.preventDefault();
            toast.error("kamu wajib memiliki proposal yang disetujui dosen pembimbing terlebih dahulu");
        } else {
            setIsOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setLoading(true);
        const formData = new FormData();
        formData.append("thesisId", thesisId);

        const res = await requestSeminarProposal(formData);
        
        if (res.error) {
            toast.error(res.error);
            setLoading(false);
        } else {
            toast.success("Permohonan seminar proposal berhasil dikirim");
            setIsOpen(false);
            setLoading(false);
        }
    };

    return (
        <>
            <Button 
                disabled={disabled || attendanceCount < 3 || !hasProposalTitle || !hasApprovedProposal}
                onClick={handleTriggerClick}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20 gap-2 cursor-pointer"
            >
                <Send className="h-4 w-4" />
                Ajukan Permohonan Seminar Proposal
            </Button>

            <RequestSeminarProposalModal
                open={isOpen}
                onOpenChange={setIsOpen}
                onSubmit={handleSubmit}
                loading={loading}
                hasProposalTitle={hasProposalTitle}
            />
        </>
    );
}
