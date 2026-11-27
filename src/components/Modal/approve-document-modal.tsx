"use client"

import { useState, useEffect } from "react"
import { Check, CheckCircle2, Loader2, X, PenTool } from "lucide-react"
import { Button } from "@/components/base/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/base/dialog"
import Link from "next/link"
import { toast } from "sonner"
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card"
import { cn } from "@/lib/utils/utils"
import { authClient } from "@/lib/auth-client"
import { DrawSignatureModal } from "./draw-signature-modal"
import { updateSignature } from "@/lib/actions/profile"

export interface ApproveDocumentModalProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onApprove: (useSignature: boolean, selectedIds: number[]) => Promise<void>;
    hasSignature: boolean;
    documentName?: string;
    pendingApprovals?: { id: number, role: string }[];
    inline?: boolean;
}

const roleDisplayMap: Record<string, string> = {
    'supervisor': 'Dosen Pembimbing',
    'examiner': 'Dosen Penguji',
    'ketua_jurusan': 'Ketua Jurusan',
    'koordinator_program_studi': 'Koordinator Program Studi'
};

export function ApproveDocumentModal({
    isOpen = false,
    onOpenChange = () => {},
    onApprove,
    hasSignature,
    documentName = "Surat Persetujuan",
    pendingApprovals = [],
    inline = false
}: ApproveDocumentModalProps) {
    const [currentHasSignature, setCurrentHasSignature] = useState(Boolean(hasSignature));
    const [useSignature, setUseSignature] = useState(Boolean(hasSignature));
    const [selectedRoleOption, setSelectedRoleOption] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isDrawOpen, setIsDrawOpen] = useState(false);
    const [isSavingSig, setIsSavingSig] = useState(false);

    const { data: authSession } = authClient.useSession();
    const user = authSession?.user;
    const profileUrl = user?.username 
        ? ((user as any)?.role?.includes("staff") ? `/staff/${user.username}` : `/dosen/${user.username}`)
        : "/login";

    useEffect(() => {
        setCurrentHasSignature(Boolean(hasSignature));
        setUseSignature(Boolean(hasSignature));
    }, [hasSignature, isOpen]);

    const handleSaveSignature = async (dataUrl: string) => {
        if (!user?.username) {
            toast.error("Sesi tidak valid.");
            return;
        }
        setIsSavingSig(true);
        try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `signature_${user.username}.png`, { type: "image/png" });
            const formData = new FormData();
            formData.append("username", user.username);
            formData.append("file", file);

            const updateRes = await updateSignature(formData);
            if (updateRes.error) {
                toast.error(updateRes.error);
            } else {
                toast.success("Tanda tangan digital berhasil dibuat dan disimpan!");
                setCurrentHasSignature(true);
                setUseSignature(true);
                setIsDrawOpen(false);
            }
        } catch (err: any) {
            toast.error(err.message || "Gagal menyimpan tanda tangan");
        } finally {
            setIsSavingSig(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let selectedIds: number[] = [];
        if (selectedRoleOption === 'all') {
            selectedIds = pendingApprovals.map(a => a.id);
        } else {
            selectedIds = [parseInt(selectedRoleOption)];
        }

        try {
            await onApprove(useSignature, selectedIds);
        } finally {
            setIsLoading(false);
        }
    };

    const modalInner = (
        <GradientCard variant="lulus" rounded="bottom" className="w-full shadow-2xl border-0 text-left">
            <GradientCardHeader variant="lulus" rounded="none" className="p-4 sm:p-5 flex flex-row items-center justify-between gap-3 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["lulus"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Setujui {documentName.replace('Surat Persetujuan ', '')}</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Verifikasi dan pengesahan dokumen permohonan</GradientCardDescription>
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

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {pendingApprovals.length > 1 && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">
                            Setujui sebagai:
                        </label>
                        <select 
                            value={selectedRoleOption}
                            onChange={(e) => setSelectedRoleOption(e.target.value)}
                            className="w-full rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
                        >
                            <option value="all">Semuanya ({(pendingApprovals.map(a => roleDisplayMap[a.role] || a.role).join(', '))})</option>
                            {pendingApprovals.map(app => (
                                <option key={app.id} value={app.id}>
                                    {roleDisplayMap[app.role] || app.role}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={useSignature}
                                onChange={(e) => setUseSignature(e.target.checked)}
                                disabled={!currentHasSignature}
                            />
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors group-hover:border-emerald-500 ${useSignature ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border bg-card'}`}>
                                {useSignature && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                        </div>
                        <span className={`text-xs font-semibold leading-snug transition-colors ${useSignature ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-500'} ${!currentHasSignature ? 'opacity-50' : ''}`}>
                            Gunakan tanda tangan digital saya
                        </span>
                    </label>

                    {!currentHasSignature && (
                        <div className="sm:ml-8 flex flex-col gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 sm:p-3">
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
                                Anda belum memiliki tanda tangan digital tersimpan.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsDrawOpen(true)}
                                    className="h-7 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-sm"
                                >
                                    <PenTool className="w-3 h-3" />
                                    Buat Tanda Tangan Sekarang
                                </Button>
                                <span className="text-[10px] text-muted-foreground">atau di <Link href={profileUrl} className="underline underline-offset-2 hover:text-foreground">profil</Link></span>
                            </div>
                        </div>
                    )}

                    <DrawSignatureModal
                        open={isDrawOpen}
                        onOpenChange={setIsDrawOpen}
                        onSaveSignature={handleSaveSignature}
                        isUploading={isSavingSig}
                    />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="rounded-xl font-bold text-xs cursor-pointer" 
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        {useSignature ? 'Setujui & Tanda-tangani' : 'Setujui'}
                    </Button>
                </div>
            </form>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none w-[calc(100vw-2rem)] max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Persetujuan Dokumen</DialogTitle>
                <DialogDescription className="sr-only">Formulir konfirmasi persetujuan dokumen</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    )
}
