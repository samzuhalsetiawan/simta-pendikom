"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/base/dialog";
import { Calendar, MapPin, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { DateTimePicker } from "@/components/base/datetime-picker";
import { toast } from "sonner";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles,
    type GradientCardVariant
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ScheduleSeminarModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    jenisName?: string;
    onSchedule: (scheduleDate: string, venue?: string) => Promise<void> | void;
    loading?: boolean;
    inline?: boolean;
    initialDate?: string;
}

export function ScheduleSeminarModal({
    open = false,
    onOpenChange = () => {},
    jenisName = "Seminar",
    onSchedule,
    loading = false,
    inline = false,
    initialDate = ""
}: ScheduleSeminarModalProps) {
    const [scheduleDate, setScheduleDate] = useState(initialDate);
    const [venue, setVenue] = useState("");

    const variant: GradientCardVariant = jenisName.toLowerCase().includes("pendadaran") || jenisName.toLowerCase().includes("skripsi")
        ? "sidang-skripsi"
        : jenisName.toLowerCase().includes("hasil")
        ? "seminar-hasil"
        : "seminar-proposal";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleDate) return toast.error(`Pilih tanggal dan waktu ${jenisName}`);
        if (!venue.trim()) return toast.error(`Ruangan / tempat pelaksanaan ${jenisName} wajib diisi`);
        await onSchedule(scheduleDate, venue.trim());
    };

    const modalInner = (
        <GradientCard variant={variant} rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant={variant} rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <Calendar className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[variant])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>Jadwalkan {jenisName}</GradientCardTitle>
                        <GradientCardDescription>Tentukan jadwal waktu & tempat pelaksanaan</GradientCardDescription>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="schedule-date-modal" className="text-xs font-bold flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        Tanggal & Waktu <span className="text-destructive">*</span>
                    </Label>
                    <DateTimePicker
                        id="schedule-date-modal"
                        value={scheduleDate}
                        onChange={(formatted) => setScheduleDate(formatted)}
                        placeholder="Rabu 31 Maret 2023 16:00"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="venue-modal" className="text-xs font-bold flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        Ruangan / Tempat <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                        id="venue-modal"
                        type="text"
                        placeholder="Contoh: Ruang Sidang Utama Lt. 3"
                        className="h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
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
                        disabled={loading || !scheduleDate || !venue.trim()}
                        className="rounded-xl font-bold text-xs cursor-pointer"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        Simpan Jadwal
                    </Button>
                </div>
            </form>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none w-[calc(100vw-2rem)] max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Jadwalkan Seminar</DialogTitle>
                <DialogDescription className="sr-only">Formulir penentuan jadwal seminar atau sidang skripsi</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
