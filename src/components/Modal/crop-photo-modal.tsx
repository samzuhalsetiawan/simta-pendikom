"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Crop, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles,
    type GradientCardVariant,
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CropPhotoModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    imageSrc: string | null;
    aspect?: number;
    onCropSave: (croppedPixels: any) => Promise<void> | void;
    isUploading?: boolean;
    roleVariant?: "student" | "lecturer" | "staff";
    cardVariant?: GradientCardVariant;
    inline?: boolean;
}

export function CropPhotoModal({
    open = false,
    onOpenChange = () => {},
    imageSrc,
    aspect = 1,
    onCropSave,
    isUploading = false,
    roleVariant = "student",
    cardVariant,
    inline = false
}: CropPhotoModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const gradientVariant: GradientCardVariant = cardVariant || (
        roleVariant === "student" ? "pengajuan-proposal" :
        roleVariant === "lecturer" ? "konsultasi" : "primary"
    );

    const onCropComplete = useCallback((_: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        await onCropSave(croppedAreaPixels);
    };

    const modalInner = (
        <GradientCard variant={gradientVariant} rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left overflow-hidden">
            <GradientCardHeader variant={gradientVariant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <Crop className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[gradientVariant])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">Sesuaikan Foto</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">
                            {aspect === 1 ? "Atur crop dan perbesaran foto (1:1)" : "Atur crop dan perbesaran foto (3:4)"}
                        </GradientCardDescription>
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

            <div className="relative h-[320px] sm:h-[360px] bg-neutral-950 overflow-hidden">
                {imageSrc ? (
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white/50 text-xs">
                        Tidak ada foto dipilih
                    </div>
                )}
            </div>

            <div className="p-5 space-y-4 bg-card">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <Label className="text-xs font-semibold">Zoom</Label>
                        <span>{zoom.toFixed(1)}x</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-xl px-4 font-semibold cursor-pointer text-xs border-border/60"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isUploading || !imageSrc}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 rounded-xl cursor-pointer text-xs"
                    >
                        {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Simpan Foto
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
                <DialogTitle className="sr-only">Sesuaikan Foto</DialogTitle>
                <DialogDescription className="sr-only">Atur crop dan rasio foto 3:4</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
