"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/base/dialog";
import { CalendarViewMode } from "@/lib/constants/calendar";
import { Check, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/base/button";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CalendarViewModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    viewMode: CalendarViewMode;
    onChangeViewMode: (mode: CalendarViewMode) => void;
    swapAxis?: boolean;
    onChangeSwapAxis?: (swap: boolean) => void;
    inline?: boolean;
}

export function CalendarViewModal({
    open = false,
    onOpenChange = () => {},
    viewMode,
    onChangeViewMode,
    swapAxis = false,
    onChangeSwapAxis,
    inline = false
}: CalendarViewModalProps) {
    const [localViewMode, setLocalViewMode] = React.useState<CalendarViewMode>(viewMode);
    const [localSwapAxis, setLocalSwapAxis] = React.useState<boolean>(swapAxis);

    React.useEffect(() => {
        if (open || inline) {
            setLocalViewMode(viewMode);
            setLocalSwapAxis(swapAxis);
        }
    }, [open, viewMode, swapAxis, inline]);

    const handleApply = () => {
        onChangeViewMode(localViewMode);
        if (onChangeSwapAxis) {
            onChangeSwapAxis(localSwapAxis);
        }
        onOpenChange(false);
    };

    const modalInner = (
        <GradientCard variant="konsultasi" rounded="bottom" className="w-full max-w-sm shadow-2xl border-0 text-left">
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <LayoutGrid className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["konsultasi"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>Tampilan Kalender</GradientCardTitle>
                        <GradientCardDescription>Pengaturan orientasi & mode grid</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <div className="p-5 space-y-4">
                {/* View Mode Options */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                        Mode Tampilan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setLocalViewMode("day_hour")}
                            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                localViewMode === "day_hour"
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-card text-muted-foreground border-border hover:bg-muted/60"
                            }`}
                        >
                            <span>Jam & Hari</span>
                            <span className="text-[10px] opacity-75 font-normal">Timeline Vertikal</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setLocalViewMode("month")}
                            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                localViewMode === "month"
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-card text-muted-foreground border-border hover:bg-muted/60"
                            }`}
                        >
                            <span>Bulanan</span>
                            <span className="text-[10px] opacity-75 font-normal">Grid 1 Bulan</span>
                        </button>
                    </div>
                </div>

                {/* Checkbox: Tukar Baris dan Kolom */}
                <div className="pt-1">
                    <label className="flex items-center gap-2.5 transition-all select-none cursor-pointer group">
                        <div className="relative flex items-center justify-center shrink-0">
                            <input
                                type="checkbox"
                                checked={localSwapAxis}
                                onChange={(e) => setLocalSwapAxis(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                localSwapAxis 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'border-border bg-card group-hover:border-primary/50'
                            }`}>
                                {localSwapAxis && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                        </div>
                        <span className="text-xs text-foreground font-medium block leading-tight">
                            Tukar Baris dan Kolom (Rotasi Sumbu)
                        </span>
                    </label>
                </div>

                {/* Apply Button */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-4 font-bold rounded-xl cursor-pointer text-xs"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                        className="px-5 font-bold rounded-xl shadow-xs cursor-pointer text-xs"
                    >
                        Terapkan
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
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-sm focus:outline-none">
                <DialogTitle className="sr-only">Mode Tampilan Kalender</DialogTitle>
                <DialogDescription className="sr-only">Pilih mode tampilan kalender antara bulanan, mingguan, atau agenda</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
