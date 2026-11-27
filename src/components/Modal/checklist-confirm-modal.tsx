"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { CheckSquare, Loader2, X, AlertCircle } from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ChecklistConfirmModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    pendingState: boolean;
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
    inline?: boolean;
}

export function ChecklistConfirmModal({
    open = false,
    onOpenChange = () => {},
    pendingState,
    onConfirm,
    loading = false,
    inline = false
}: ChecklistConfirmModalProps) {
    const variant = pendingState ? "lulus" : "destructive";

    const modalInner = (
        <GradientCard variant={variant} rounded="bottom" className="w-full max-w-sm shadow-2xl border-0 text-left">
            <GradientCardHeader variant={variant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <CheckSquare className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[variant])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Konfirmasi Berkas</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Verifikasi kelengkapan berkas</GradientCardDescription>
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

            <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground leading-relaxed">
                    Apakah Anda yakin ingin menandai berkas ini sebagai{" "}
                    <strong className="text-foreground font-semibold">
                        {pendingState ? "diselesaikan" : "belum diselesaikan"}
                    </strong>
                    ?
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
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
                        className={cn(
                            "rounded-xl font-bold cursor-pointer text-xs",
                            pendingState 
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        )}
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                        Ya, Tandai
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
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-sm focus:outline-none">
                <DialogTitle className="sr-only">Konfirmasi Perubahan Checklist</DialogTitle>
                <DialogDescription className="sr-only">Formulir konfirmasi centang dokumen persyaratan</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
