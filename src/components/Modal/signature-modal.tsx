"use client";

import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PenTool, Upload, Trash2, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { toast } from "sonner";
import { updateSignature } from "@/lib/actions/profile";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    type GradientCardVariant,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface SignatureModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    username: string;
    signaturePath: string | null;
    onSignatureChange?: (newPath: string) => void;
    roleVariant?: "student" | "lecturer" | "staff";
    cardVariant?: GradientCardVariant;
    inline?: boolean;
}

export function SignatureModal({
    open = false,
    onOpenChange = () => {},
    username,
    signaturePath,
    onSignatureChange,
    roleVariant = "staff",
    cardVariant,
    inline = false,
}: SignatureModalProps) {
    const [currentPath, setCurrentPath] = useState(signaturePath);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentPath(signaturePath);
    }, [signaturePath]);

    const gradientVariant: GradientCardVariant = cardVariant || (
        roleVariant === "student" ? "pengajuan-proposal" :
        roleVariant === "lecturer" ? "konsultasi" : "primary"
    );

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== "image/png") {
                return toast.error("Hanya file PNG yang diizinkan untuk tanda tangan.");
            }
            if (file.size > 2 * 1024 * 1024) {
                return toast.error("Ukuran file terlalu besar. Maksimal 2MB.");
            }

            setIsUploading(true);
            const formData = new FormData();
            formData.append("username", username);
            formData.append("file", file);

            const res = await updateSignature(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Tanda tangan berhasil diupload.");
                setCurrentPath(res.path!);
                onSignatureChange?.(res.path!);
                onOpenChange(false);
            }
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleDrawSave = async () => {
        if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
            return toast.error("Silakan gambar tanda tangan terlebih dahulu.");
        }
        setIsUploading(true);
        sigCanvasRef.current.getTrimmedCanvas().toBlob(async (blob) => {
            if (!blob) {
                setIsUploading(false);
                return toast.error("Gagal memproses gambar.");
            }
            const formData = new FormData();
            formData.append("username", username);
            formData.append("file", blob, "signature.png");

            const res = await updateSignature(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Tanda tangan berhasil disimpan.");
                setCurrentPath(res.path!);
                onSignatureChange?.(res.path!);
                setIsDrawing(false);
                onOpenChange(false);
            }
            setIsUploading(false);
        }, "image/png");
    };

    const modalInner = isDrawing ? (
        <GradientCard variant={gradientVariant} rounded="bottom" className="w-full max-w-lg shadow-2xl border-0 text-left overflow-hidden">
            <GradientCardHeader variant={gradientVariant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <PenTool className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[gradientVariant])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Gambar Tanda Tangan</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Bubuhkan tanda tangan digital Anda</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => setIsDrawing(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            {/* Canvas Area: Edge-to-edge without horizontal padding, flush under header, always white surface */}
            <div className="relative w-full bg-white border-b border-border/60 touch-none select-none">
                <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor="black"
                    canvasProps={{
                        className: "w-full cursor-crosshair block",
                        style: { width: "100%", height: "220px" }
                    }}
                />
            </div>

            {/* Action buttons with padding */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-2.5 bg-card">
                <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => sigCanvasRef.current?.clear()}
                    className="h-10 rounded-xl px-4 font-semibold text-xs gap-1.5 cursor-pointer border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                </Button>
                <div className="flex items-center gap-2">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setIsDrawing(false)}
                        className="h-10 rounded-xl px-4 font-semibold text-xs cursor-pointer border-border/60"
                    >
                        Batal
                    </Button>
                    <Button 
                        type="button"
                        onClick={handleDrawSave} 
                        disabled={isUploading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 rounded-xl px-4 text-xs cursor-pointer"
                    >
                        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                        Simpan
                    </Button>
                </div>
            </div>
        </GradientCard>
    ) : (
        <GradientCard variant={gradientVariant} rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left overflow-hidden">
            <GradientCardHeader variant={gradientVariant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                        <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                        <GradientCardTitle className="text-base truncate">Tanda Tangan Digital</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Gunakan tanda tangan untuk pengesahan berkas</GradientCardDescription>
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

            {/* Preview Area: Pure white light surface even in dark mode, edge-to-edge flush under header */}
            <div className="w-full bg-white border-b border-border/60 min-h-[160px] flex items-center justify-center p-4">
                {currentPath ? (
                    <img
                        src={currentPath}
                        alt="Tanda Tangan"
                        className="max-h-28 max-w-full object-contain mx-auto"
                    />
                ) : (
                    <div className="text-center py-6">
                        <PenTool className="h-7 w-7 text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-neutral-500">Belum ada tanda tangan yang tersimpan.</p>
                    </div>
                )}
            </div>

            {/* Action buttons with padding */}
            <div className="p-4 sm:p-5 bg-card">
                <div className="flex gap-2.5">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setIsDrawing(true)}
                        className="flex-1 h-10 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted cursor-pointer"
                    >
                        <PenTool className="h-3.5 w-3.5" />
                        Gambar
                    </Button>
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 h-10 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted cursor-pointer"
                    >
                        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Upload PNG
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleUpload}
                        accept="image/png" 
                        className="hidden" 
                    />
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className={cn("p-0 border-0 bg-transparent shadow-none focus:outline-none", isDrawing ? "max-w-lg" : "max-w-md")}>
                <DialogTitle className="sr-only">
                    {isDrawing ? "Gambar Tanda Tangan" : "Tanda Tangan Digital"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {isDrawing ? "Bubuhkan tanda tangan digital Anda" : "Gunakan tanda tangan untuk pengesahan berkas"}
                </DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
