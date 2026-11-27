"use client";

import React from "react";
import { Button } from "@/components/base/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/base/dialog";
import { Loader2, AlertTriangle, X } from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CancelProposalApprovalModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm: (e: React.FormEvent) => Promise<void> | void;
    loading?: boolean;
    inline?: boolean;
}

export function CancelProposalApprovalModal({
    open = false,
    onOpenChange = () => {},
    onConfirm,
    loading = false,
    inline = false
}: CancelProposalApprovalModalProps) {
    const modalInner = (
        <GradientCard variant="destructive" rounded="bottom" className="w-full shadow-2xl border-0 text-left">
            <GradientCardHeader variant="destructive" rounded="none" className="p-4 sm:p-5 flex flex-row items-center justify-between gap-3 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <AlertTriangle className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["destructive"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Batalkan Permohonan</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Batalkan persetujuan proposal skripsi</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <form onSubmit={onConfirm} className="p-4 sm:p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Apakah Anda yakin ingin membatalkan permohonan persetujuan proposal? Dosen pembimbing dan staff yang sudah menyetujui perlu memverifikasi ulang saat Anda mengajukannya kembali.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="rounded-xl font-bold cursor-pointer text-xs" 
                        onClick={() => onOpenChange(false)}
                    >
                        Kembali
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading}
                        variant="destructive"
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Ya, Batalkan Permohonan
                    </Button>
                </div>
            </form>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none w-[calc(100vw-2rem)] max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Batalkan Persetujuan Proposal</DialogTitle>
                <DialogDescription className="sr-only">Formulir konfirmasi pembatalan persetujuan proposal</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
