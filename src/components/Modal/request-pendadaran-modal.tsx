"use client";

import React from "react";
import { Button } from "@/components/base/button";
import { Loader2, X, GraduationCap, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface RequestPendadaranModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => Promise<void> | void;
    loading?: boolean;
    hasThesisTitle?: boolean;
    inline?: boolean;
}

export type RequestSidangSkripsiModalProps = RequestPendadaranModalProps;

export function RequestPendadaranModal({
    open = false,
    onOpenChange = () => {},
    onSubmit,
    loading = false,
    hasThesisTitle = true,
    inline = false
}: RequestPendadaranModalProps) {
    const modalInner = (
        <GradientCard variant="sidang-skripsi" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant="sidang-skripsi" rounded="none" className="p-5 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <GraduationCap className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["sidang-skripsi"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Permohonan Sidang Skripsi</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Jadwal ujian akhir & persetujuan dewan penguji</GradientCardDescription>
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

            <form onSubmit={onSubmit} className="p-6 space-y-5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Permohonan sidang skripsi yang diajukan akan terlebih dahulu diberikan jadwal dan ruang oleh staf prodi, kemudian dimintakan persetujuan kepada seluruh dosen pembimbing & penguji. Setelah disetujui, kamu akan diminta mengunggah berkas syarat ujian akhir.
                </p>

                {!hasThesisTitle && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <p className="font-semibold">Perhatian</p>
                            <p className="leading-relaxed">Kamu belum menentukan judul skripsimu. Silakan tentukan judul skripsi terlebih dahulu melalui menu detail skripsi.</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl font-bold cursor-pointer text-xs"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || !hasThesisTitle}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl min-w-[120px] cursor-pointer text-xs"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                Memproses...
                            </>
                        ) : (
                            "Kirim Permohonan"
                        )}
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
                <DialogTitle className="sr-only">Ajukan Sidang Skripsi</DialogTitle>
                <DialogDescription className="sr-only">Formulir pendaftaran dan pengajuan sidang skripsi</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}

export const RequestSidangSkripsiModal = RequestPendadaranModal;

