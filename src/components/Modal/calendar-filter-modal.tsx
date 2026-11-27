"use client";

import React, { useState, useEffect } from "react";
import { CalendarEventType } from "@/lib/constants/calendar";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import {
    Calendar as CalendarIcon,
    Check,
    X,
    SlidersHorizontal
} from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CalendarFilterModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    activeTypes: Record<CalendarEventType, boolean>;
    onChangeActiveTypes: (types: Record<CalendarEventType, boolean>) => void;
    activeDays: number[];
    onChangeActiveDays: (days: number[]) => void;
    onlyScheduled: boolean;
    onChangeOnlyScheduled: (onlyScheduled: boolean) => void;
    selectedDateFilter?: string;
    onChangeSelectedDateFilter?: (date: string) => void;

    onJumpToTodayAnd7Am?: () => void;
    onResetAllFilters?: () => void;
    totalFilteredCount?: number;
    totalEventsCount?: number;
    inline?: boolean;
}

const FILTER_TYPE_STYLES = {
    proposal: {
        label: "Seminar Proposal",
        className: "bg-seminar-proposal/15 text-[hsl(from_var(--color-seminar-proposal)_h_s_30%)] dark:bg-seminar-proposal/20 dark:text-[hsl(from_var(--color-seminar-proposal)_h_s_80%)]",
        activeBorder: "var(--color-seminar-proposal)"
    },
    hasil: {
        label: "Seminar Hasil",
        className: "bg-seminar-hasil/15 text-[hsl(from_var(--color-seminar-hasil)_h_s_30%)] dark:bg-seminar-hasil/20 dark:text-[hsl(from_var(--color-seminar-hasil)_h_s_80%)]",
        activeBorder: "var(--color-seminar-hasil)"
    },
    pendadaran: {
        label: "Sidang Skripsi",
        className: "bg-sidang-skripsi/15 text-[hsl(from_var(--color-sidang-skripsi)_h_s_30%)] dark:bg-sidang-skripsi/20 dark:text-[hsl(from_var(--color-sidang-skripsi)_h_s_80%)]",
        activeBorder: "var(--color-sidang-skripsi)"
    },
    konsultasi: {
        label: "Konsultasi",
        className: "bg-konsultasi/15 text-[hsl(from_var(--color-konsultasi)_h_s_30%)] dark:bg-konsultasi/20 dark:text-[hsl(from_var(--color-konsultasi)_h_s_80%)]",
        activeBorder: "var(--color-konsultasi)"
    }
} as const;

export function CalendarFilterModal({
    open = false,
    onOpenChange = () => {},
    activeTypes,
    onChangeActiveTypes,
    activeDays,
    onChangeActiveDays,
    onlyScheduled,
    onChangeOnlyScheduled,
    inline = false
}: CalendarFilterModalProps) {
    const [localActiveTypes, setLocalActiveTypes] = useState(activeTypes);
    const [localActiveDays, setLocalActiveDays] = useState(activeDays);
    const [localOnlyScheduled, setLocalOnlyScheduled] = useState(onlyScheduled);

    useEffect(() => {
        if (open || inline) {
            setLocalActiveTypes(activeTypes);
            setLocalActiveDays(activeDays);
            setLocalOnlyScheduled(onlyScheduled);
        }
    }, [open, activeTypes, activeDays, onlyScheduled, inline]);

    const handleApply = () => {
        onChangeActiveTypes(localActiveTypes);
        onChangeActiveDays(localActiveDays);
        onChangeOnlyScheduled(localOnlyScheduled);
        onOpenChange(false);
    };

    const handleCancel = () => {
        setLocalActiveTypes(activeTypes);
        setLocalActiveDays(activeDays);
        setLocalOnlyScheduled(onlyScheduled);
        onOpenChange(false);
    };

    const toggleType = (type: CalendarEventType) => {
        setLocalActiveTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const toggleDay = (dayIndex: number) => {
        setLocalActiveDays(prev => {
            if (prev.includes(dayIndex)) {
                if (prev.length === 1) return prev;
                return prev.filter(d => d !== dayIndex);
            } else {
                return [...prev, dayIndex].sort();
            }
        });
    };

    const daysName = [
        { label: "Sen", index: 1 },
        { label: "Sel", index: 2 },
        { label: "Rab", index: 3 },
        { label: "Kam", index: 4 },
        { label: "Jum", index: 5 },
        { label: "Sab", index: 6 },
        { label: "Min", index: 0 },
    ];

    const modalInner = (
        <GradientCard variant="konsultasi" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <SlidersHorizontal className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["konsultasi"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>Filter Kalender</GradientCardTitle>
                        <GradientCardDescription>Saring jenis agenda & hari aktif</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            <div className="p-6 space-y-5">
                {/* Jenis Agenda */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-foreground">
                        Jenis Agenda
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(FILTER_TYPE_STYLES) as CalendarEventType[]).map(type => {
                            const style = FILTER_TYPE_STYLES[type];
                            const isChecked = localActiveTypes[type];
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleType(type)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        isChecked
                                            ? 'border-primary/40 bg-card shadow-xs'
                                            : 'border-border/50 bg-muted/30 opacity-60'
                                    }`}
                                >
                                    <span className="truncate">{style.label}</span>
                                    <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors ${
                                        isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card'
                                    }`}>
                                        {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Hari Tampilan */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-foreground">
                        Hari Ditampilkan
                    </label>
                    <div className="flex items-center justify-between gap-1.5">
                        {daysName.map(({ label, index }) => {
                            const isSelected = localActiveDays.includes(index);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => toggleDay(index)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                            : 'bg-card text-muted-foreground border-border hover:bg-muted/60'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setLocalOnlyScheduled(!localOnlyScheduled)}
                            className="flex items-start sm:items-center gap-2 group cursor-pointer text-left"
                        >
                            <div className={`w-4.5 h-4.5 shrink-0 mt-0.5 sm:mt-0 rounded-md border flex items-center justify-center transition-colors ${
                                localOnlyScheduled ? 'bg-primary border-primary text-primary-foreground' : 'border-border group-hover:border-primary bg-card'
                            }`}>
                                {localOnlyScheduled && <Check className="w-3 h-3 stroke-[2.5]" />}
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                Hanya tampilkan hari yang memiliki agenda
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setLocalActiveTypes({ proposal: true, hasil: true, pendadaran: true, konsultasi: true });
                            setLocalActiveDays([1, 2, 3, 4, 5, 6, 0]);
                            setLocalOnlyScheduled(false);
                        }}
                        className="px-3 font-bold rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer text-xs"
                    >
                        Reset
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
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
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Filter Agenda Kalender</DialogTitle>
                <DialogDescription className="sr-only">Saring agenda kalender berdasarkan jenis seminar dan status kegiatan</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
