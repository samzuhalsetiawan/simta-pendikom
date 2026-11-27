"use client"

import { useState } from "react"
import { Loader2, XCircle, X } from "lucide-react"
import { Button } from "@/components/base/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/base/dialog"
import { Label } from "@/components/base/label"
import { Textarea } from "@/components/base/textarea"
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card"
import { cn } from "@/lib/utils/utils"

export interface RejectDocumentModalProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onReject: (reason: string, selectedIds: number[]) => Promise<void>;
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

export function RejectDocumentModal({
    isOpen = false,
    onOpenChange = () => {},
    onReject,
    documentName = "Proposal",
    pendingApprovals = [],
    inline = false
}: RejectDocumentModalProps) {
    const [reason, setReason] = useState("");
    const [selectedRoleOption, setSelectedRoleOption] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);

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
            await onReject(reason, selectedIds);
        } finally {
            setIsLoading(false);
        }
    };

    const modalInner = (
        <GradientCard variant="destructive" rounded="bottom" className="w-full shadow-2xl border-0 text-left">
            <GradientCardHeader variant="destructive" rounded="none" className="p-4 sm:p-5 flex flex-row items-center justify-between gap-3 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <XCircle className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["destructive"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Tolak {documentName}</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Berikan alasan penolakan dokumen</GradientCardDescription>
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
                        <Label className="text-xs font-bold text-foreground">
                            Tolak sebagai:
                        </Label>
                        <select 
                            value={selectedRoleOption}
                            onChange={(e) => setSelectedRoleOption(e.target.value)}
                            className="w-full rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 py-2 text-xs focus:border-rose-500 focus:outline-none transition-colors cursor-pointer"
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
                    <Label htmlFor="reject-reason-modal" className="text-xs font-bold text-foreground">
                        Alasan Penolakan
                    </Label>
                    <Textarea 
                        id="reject-reason-modal"
                        placeholder="Tuliskan alasan penolakan..."
                        className="min-h-[110px] rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 py-2.5 text-xs shadow-none focus-visible:ring-0 focus:ring-0 focus:border-rose-500 focus-visible:border-rose-500 resize-none transition-colors"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
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
                        variant="destructive"
                        className="rounded-xl font-bold text-xs cursor-pointer" 
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        Tolak {documentName}
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
                <DialogTitle className="sr-only">Tolak Dokumen</DialogTitle>
                <DialogDescription className="sr-only">Formulir penolakan dokumen beserta catatan perbaikan</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    )
}
