"use client";

import React from "react";
import { X, Maximize2, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ImageLightboxModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    imageUrl?: string | null;
    title?: string;
    alt?: string;
    inline?: boolean;
}

export function ImageLightboxModal({
    open = false,
    onOpenChange = () => {},
    imageUrl,
    title = "Foto Profil",
    alt = "Preview Gambar",
    inline = false
}: ImageLightboxModalProps) {
    const modalInner = (
        <GradientCard variant="primary" rounded="bottom" className="w-full max-w-sm shadow-2xl border-0 text-left overflow-hidden">
            <GradientCardHeader variant="primary" rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                    <Maximize2 className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["primary"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">{title}</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">{alt}</GradientCardDescription>
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

            {/* Area Gambar: Didedikasikan penuh di seluruh body modal */}
            {imageUrl ? (
                <div className="relative w-full bg-black/5 dark:bg-black/40 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="w-full object-cover aspect-[3/4] block"
                    />
                </div>
            ) : (
                <div className="w-full aspect-[3/4] bg-muted/20 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2 select-none">
                    <ImageIcon className="w-8 h-8 opacity-30" />
                    <span>Tidak ada gambar</span>
                </div>
            )}

            {/* Action Buttons Footer */}
            <div className="p-4 flex items-center justify-end border-t border-border/50 bg-muted/20">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-9 rounded-xl px-4 font-bold cursor-pointer text-xs"
                >
                    Tutup
                </Button>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-sm focus:outline-none">
                <DialogTitle className="sr-only">{title || "Lihat Gambar"}</DialogTitle>
                <DialogDescription className="sr-only">Tampilan penuh gambar</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
