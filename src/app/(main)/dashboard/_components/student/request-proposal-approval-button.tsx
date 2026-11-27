"use client";

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Loader2, Send } from "lucide-react";
import { requestProposalApproval } from "@/lib/actions/proposal";
import { toast } from "sonner";

interface RequestProposalApprovalButtonProps {
    proposalId: string;
    disabled: boolean;
    disabledMessage?: string;
}

export default function RequestProposalApprovalButton({ proposalId, disabled, disabledMessage }: RequestProposalApprovalButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        setLoading(true);
        const res = await requestProposalApproval(proposalId);
        
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Permohonan persetujuan proposal berhasil diajukan!");
        }
        setLoading(false);
    };

    return (
        <div>
            <Button
                className="w-full h-12 rounded-xl font-bold justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                disabled={disabled || loading}
                onClick={handleRequest}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
                Minta Persetujuan Proposal
            </Button>
            {disabled && (disabledMessage === undefined || disabledMessage !== "") && (
                <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    {disabledMessage === undefined ? "Kamu belum mengisi detail informasi dan mengupload file proposal" : disabledMessage}
                </p>
            )}
        </div>
    );
}
