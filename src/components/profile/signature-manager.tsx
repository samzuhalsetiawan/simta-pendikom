"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/base/button";
import { PenTool, Upload, Trash2, Loader2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { updateSignature } from "@/lib/actions/profile";
import { 
    GradientCard, 
    GradientCardHeader, 
    GradientCardTitle, 
    GradientCardDescription,
    type GradientCardVariant 
} from "@/components/shared/gradient-card";

interface SignatureManagerProps {
    username: string;
    signaturePath: string | null;
    isOwner: boolean;
    roleVariant?: "student" | "lecturer" | "staff";
    cardVariant?: GradientCardVariant;
}

export default function SignatureManager({
    username,
    signaturePath,
    isOwner,
    roleVariant = "student",
    cardVariant,
}: SignatureManagerProps) {
    const [currentPath, setCurrentPath] = useState(signaturePath);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Don't show anything if not owner and no signature
    if (!isOwner && !currentPath) return null;
    // Don't show the component at all on other people's profiles
    if (!isOwner) return null;

    const gradientVariant: GradientCardVariant = cardVariant || (
        roleVariant === "student" ? "pengajuan-proposal" :
        roleVariant === "lecturer" ? "konsultasi" : "sidang-skripsi"
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
            if (res.error) toast.error(res.error);
            else {
                toast.success("Tanda tangan berhasil diupload.");
                setCurrentPath(res.path!);
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
            if (res.error) toast.error(res.error);
            else {
                toast.success("Tanda tangan berhasil disimpan.");
                setCurrentPath(res.path!);
                setIsDrawing(false);
            }
            setIsUploading(false);
        }, "image/png");
    };

    return (
        <GradientCard variant={gradientVariant} className="shadow-sm">
            <GradientCardHeader variant={gradientVariant}>
                <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                        <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                        <GradientCardTitle>Tanda Tangan Digital</GradientCardTitle>
                        <GradientCardDescription>Gunakan tanda tangan untuk pengesahan berkas</GradientCardDescription>
                    </div>
                </div>
            </GradientCardHeader>

            <div className="p-5 sm:p-6 space-y-4">
                {/* Show current signature if exists */}
                {currentPath ? (
                    <div className="border border-border/60 rounded-xl p-4 bg-muted/20 flex items-center justify-center">
                        <img
                            src={currentPath}
                            alt="Tanda Tangan"
                            className="max-h-24 mx-auto object-contain"
                        />
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center">
                        <PenTool className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1.5" />
                        <p className="text-xs text-muted-foreground">Belum ada tanda tangan yang tersimpan.</p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsDrawing(true)}
                        className="flex-1 h-9 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted cursor-pointer"
                    >
                        <PenTool className="h-3.5 w-3.5" />
                        Gambar
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 h-9 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted cursor-pointer"
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

                {/* Signature drawing dialog */}
                <Dialog.Root open={isDrawing} onOpenChange={setIsDrawing}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-[110] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-card text-card-foreground border border-border shadow-2xl overflow-hidden">
                            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
                                <Dialog.Title className="text-sm font-bold font-heading flex items-center gap-2">
                                    <PenTool className="h-4 w-4 text-primary" />
                                    Gambar Tanda Tangan
                                </Dialog.Title>
                                <button 
                                    onClick={() => setIsDrawing(false)}
                                    className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-5 sm:p-6 space-y-4">
                                <div className="border-2 border-border/70 rounded-xl overflow-hidden bg-white">
                                    <SignatureCanvas
                                        ref={sigCanvasRef}
                                        penColor="black"
                                        canvasProps={{
                                            width: 460,
                                            height: 200,
                                            className: "w-full",
                                            style: { width: "100%", height: "200px" }
                                        }}
                                    />
                                </div>

                                <div className="flex gap-2.5 pt-1">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => sigCanvasRef.current?.clear()}
                                        className="h-9 rounded-xl px-3.5 font-semibold text-xs gap-1.5 cursor-pointer border-border/60"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                        Hapus
                                    </Button>
                                    <div className="flex-1" />
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsDrawing(false)}
                                        className="h-9 rounded-xl px-4 font-semibold text-xs cursor-pointer border-border/60"
                                    >
                                        Batal
                                    </Button>
                                    <Button 
                                        onClick={handleDrawSave} 
                                        disabled={isUploading}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 rounded-xl px-4 text-xs cursor-pointer"
                                    >
                                        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Simpan"}
                                    </Button>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        </GradientCard>
    );
}
