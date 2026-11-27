"use client";

import React, { useRef } from "react";
import { Camera, Upload, X, Loader2, User } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    type GradientCardVariant,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ProfilePhotoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    currentPhotoUrl?: string | null;
    onOpenLiveCamera: () => void;
    onSelectFile: (file: File) => void;
    roleVariant?: "student" | "lecturer" | "staff";
    cardVariant?: GradientCardVariant;
    inline?: boolean;
    isUploading?: boolean;
}

export function ProfilePhotoModal({
    open = false,
    onOpenChange = () => {},
    currentPhotoUrl,
    onOpenLiveCamera,
    onSelectFile,
    roleVariant = "student",
    cardVariant,
    inline = false,
    isUploading = false,
}: ProfilePhotoModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const gradientVariant: GradientCardVariant = cardVariant || (
        roleVariant === "student" ? "pengajuan-proposal" :
        roleVariant === "lecturer" ? "konsultasi" : "sidang-skripsi"
    );

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            onSelectFile(file);
            e.target.value = "";
        }
    };

    const modalInner = (
        <GradientCard variant={gradientVariant} rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left overflow-hidden">
            <GradientCardHeader variant={gradientVariant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", variantIconBadgeStyles[gradientVariant])}>
                        <Camera className="h-4 w-4" />
                    </div>
                    <div>
                        <GradientCardTitle className="text-base truncate">Foto Profil</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Perbarui foto profil akun Anda</GradientCardDescription>
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

            {/* Preview Area: Full width, flush under header, black background, object-contain (no crop/stretch) */}
            <div className="w-full h-[280px] sm:h-[320px] bg-black border-b border-border/60 flex items-center justify-center overflow-hidden relative select-none">
                {currentPhotoUrl ? (
                    <img
                        src={currentPhotoUrl}
                        alt="Foto Profil"
                        className="w-full h-full object-contain block"
                    />
                ) : (
                    <div className="text-center py-6 text-neutral-400">
                        <div className="w-20 h-24 rounded-xl border border-dashed border-neutral-700 flex items-center justify-center mx-auto mb-2 bg-neutral-900/50">
                            <User className="h-8 w-8 text-neutral-500" />
                        </div>
                        <p className="text-xs font-medium text-neutral-400">Belum ada foto profil yang tersimpan.</p>
                    </div>
                )}
            </div>

            {/* Action buttons with padding */}
            <div className="p-4 sm:p-5 bg-card">
                <div className="flex gap-2.5">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={onOpenLiveCamera}
                        disabled={isUploading}
                        className="flex-1 h-10 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted cursor-pointer"
                    >
                        <Camera className="h-3.5 w-3.5" />
                        Foto dari Kamera
                    </Button>
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 h-10 text-xs font-semibold rounded-xl gap-2 border-border/60 hover:bg-muted cursor-pointer"
                    >
                        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Upload Foto
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileInputChange}
                        accept="image/jpeg,image/png,image/jpg" 
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
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Foto Profil</DialogTitle>
                <DialogDescription className="sr-only">Perbarui foto profil akun Anda</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
