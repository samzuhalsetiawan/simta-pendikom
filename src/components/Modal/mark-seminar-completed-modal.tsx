"use client";

import React from "react";
import { Button } from "@/components/base/button";
import { CheckCircle2, Loader2, AlertTriangle, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/base/dialog";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface MarkSeminarCompletedModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    type?: 'proposal' | 'hasil' | 'pendadaran';
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
    inline?: boolean;
}

export function MarkSeminarCompletedModal({
    open = false,
    onOpenChange = () => {},
    type = 'proposal',
    onConfirm,
    loading = false,
    inline = false
}: MarkSeminarCompletedModalProps) {
    const typeLabel = type === 'proposal' ? 'Seminar Proposal' : type === 'hasil' ? 'Seminar Hasil' : 'Sidang Skripsi';

    const modalInner = (
        <GradientCard variant="lulus" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant="lulus" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["lulus"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>Selesaikan {typeLabel}</GradientCardTitle>
                        <GradientCardDescription>Kunci penilaian & akumulasi skor akhir</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <div className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Apakah Anda yakin ingin menyelesaikan sesi {typeLabel} ini sekarang?
                </p>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                        <strong className="font-semibold">Perhatian:</strong> Setelah ditandai selesai, sistem akan mengunci skor dosen. Dosen tidak dapat lagi mengubah nilai setelah status ini difinalisasi.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        Ya, Selesaikan Seminar
                    </Button>
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Tandai Seminar Selesai</DialogTitle>
                <DialogDescription className="sr-only">Formulir konfirmasi penyelesaian seminar atau sidang</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
