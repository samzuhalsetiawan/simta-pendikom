"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { requestConsultation } from "@/lib/actions/consultation";
import { Loader2, MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ConsultationModalProps {
    studentNim: string;
    lecturerNip: string;
    lecturerName: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmitSuccess?: () => void;
    inline?: boolean;
    title?: string;
}

export function ConsultationModal({
    studentNim,
    lecturerNip,
    lecturerName,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSubmitSuccess,
    inline = false,
    title = "Ajukan Konsultasi"
}: ConsultationModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (setControlledOpen || (() => {})) : setInternalOpen;

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            if (onSubmitSuccess) {
                onSubmitSuccess();
                toast.success("Konsultasi berhasil diajukan (preview)");
                setOpen(false);
                return;
            }

            await requestConsultation(lecturerNip, studentNim);
            toast.success("Konsultasi berhasil diajukan");
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Gagal mengajukan konsultasi");
        } finally {
            setLoading(false);
        }
    };

    const modalInner = (
        <GradientCard variant="konsultasi" rounded="bottom" className="w-full max-w-[425px] shadow-2xl border-0 text-left">
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <MessageSquarePlus className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["konsultasi"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>{title}</GradientCardTitle>
                        <GradientCardDescription>Permohonan sesi konsultasi ke dosen</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Apakah Anda yakin ingin mengajukan permohonan sesi konsultasi kepada dosen <strong className="text-foreground">{lecturerName}</strong>? Jadwal dan tempat pertemuan akan ditentukan oleh dosen pembimbing.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        className="rounded-xl font-bold cursor-pointer text-xs"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Ajukan Sekarang
                    </Button>
                </div>
            </form>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground dark:hover:text-white cursor-pointer">
                        Konsultasi
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-[425px] focus:outline-none">
                <DialogTitle className="sr-only">Ajukan Konsultasi Bimbingan</DialogTitle>
                <DialogDescription className="sr-only">Formulir permohonan bimbingan skripsi kepada dosen pembimbing</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
