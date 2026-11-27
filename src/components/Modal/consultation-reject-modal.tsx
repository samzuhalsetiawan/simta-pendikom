"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { Textarea } from "@/components/base/textarea";
import { Label } from "@/components/base/label";
import { XCircle, Loader2, X } from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ConsultationRejectModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onReject?: (rejectReason: string) => Promise<void> | void;
    onSubmit?: (rejectReason: string) => Promise<void> | void;
    loading?: boolean;
    inline?: boolean;
    title?: string;
    description?: string;
    actionText?: string;
}

export function ConsultationRejectModal({
    open = false,
    onOpenChange = () => {},
    onReject,
    onSubmit,
    loading = false,
    inline = false,
    title = "Tolak Konsultasi",
    description = "Konfirmasi penolakan permohonan konsultasi",
    actionText = "Tolak Konsultasi"
}: ConsultationRejectModalProps) {
    const [rejectReason, setRejectReason] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const handler = onReject || onSubmit;
        if (handler) {
            await handler(rejectReason);
        }
    };

    const modalInner = (
        <GradientCard variant="destructive" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant="destructive" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <XCircle className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["destructive"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>{title}</GradientCardTitle>
                        <GradientCardDescription>{description}</GradientCardDescription>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">Alasan Penolakan</Label>
                    <Textarea 
                        placeholder="Tuliskan catatan atau alasan mengapa sesi konsultasi ditolak..." 
                        value={rejectReason} 
                        onChange={e => setRejectReason(e.target.value)} 
                        required 
                        rows={3}
                        className="rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 py-2.5 text-xs shadow-none focus-visible:ring-0 focus:ring-0 focus:border-rose-500 focus-visible:border-rose-500 resize-none transition-colors"
                    />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
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
                        type="submit" 
                        disabled={loading || !rejectReason.trim()} 
                        variant="destructive"
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        {actionText}
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
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Tolak Pengajuan Bimbingan</DialogTitle>
                <DialogDescription className="sr-only">Formulir penolakan permohonan bimbingan skripsi beserta alasan</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
