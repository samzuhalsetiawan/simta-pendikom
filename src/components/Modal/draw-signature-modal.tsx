"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PenTool, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { toast } from "sonner";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface DrawSignatureModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSaveSignature: (signatureDataUrl: string) => Promise<void> | void;
    isUploading?: boolean;
    inline?: boolean;
}

export function DrawSignatureModal({
    open = false,
    onOpenChange = () => {},
    onSaveSignature,
    isUploading = false,
    inline = false
}: DrawSignatureModalProps) {
    const sigCanvasRef = useRef<SignatureCanvas>(null);

    const handleDrawSave = async () => {
        if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
            return toast.error("Silakan gambar tanda tangan terlebih dahulu.");
        }
        const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
        await onSaveSignature(dataUrl);
        onOpenChange(false);
    };

    const modalInner = (
        <GradientCard variant="lulus" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left overflow-hidden">
            <GradientCardHeader variant="lulus" rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <PenTool className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["lulus"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Gambar Tanda Tangan</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Bubuhkan tanda tangan digital Anda</GradientCardDescription>
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

            {/* Area Tanda Tangan: Didedikasikan penuh di seluruh body modal */}
            <div className="relative w-full bg-white dark:bg-neutral-950 touch-none select-none">
                <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor="#059669"
                    canvasProps={{
                        className: "w-full cursor-crosshair block",
                        style: { width: "100%", height: "220px" }
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex items-center justify-between gap-2 border-t border-border/50 bg-muted/20">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => sigCanvasRef.current?.clear()}
                    className="h-10 rounded-xl px-3 font-bold text-xs cursor-pointer text-muted-foreground hover:text-destructive hover:border-destructive/30"
                >
                    Hapus
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-xl px-4 font-bold text-xs cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDrawSave}
                        disabled={isUploading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl px-4 text-xs cursor-pointer"
                    >
                        {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Simpan
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
                <DialogTitle className="sr-only">Gambar Tanda Tangan</DialogTitle>
                <DialogDescription className="sr-only">Bubuhkan tanda tangan digital Anda</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
