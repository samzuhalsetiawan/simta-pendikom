"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { CalendarClock, Loader2, X } from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface ConsultationScheduleModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSchedule?: (scheduleDate: string, scheduleTime: string, scheduleVenue: string) => Promise<void> | void;
    onSubmit?: (scheduleDate: string, scheduleTime: string, scheduleVenue: string) => Promise<void> | void;
    loading?: boolean;
    initialDate?: string;
    initialTime?: string;
    initialVenue?: string;
    inline?: boolean;
}

export function ConsultationScheduleModal({
    open = false,
    onOpenChange = () => {},
    onSchedule,
    onSubmit,
    loading = false,
    initialDate = "2026-09-08",
    initialTime = "10:00",
    initialVenue = "Ruang Dosen 204",
    inline = false
}: ConsultationScheduleModalProps) {
    const [scheduleDate, setScheduleDate] = useState(initialDate);
    const [scheduleTime, setScheduleTime] = useState(initialTime);
    const [scheduleVenue, setScheduleVenue] = useState(initialVenue);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const handler = onSchedule || onSubmit;
        if (handler) {
            await handler(scheduleDate, scheduleTime, scheduleVenue);
        }
    };

    const modalInner = (
        <GradientCard variant="konsultasi" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <CalendarClock className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["konsultasi"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>Jadwal Bimbingan</GradientCardTitle>
                        <GradientCardDescription>Tentukan waktu & tempat sesi konsultasi</GradientCardDescription>
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-foreground">Tanggal</Label>
                        <Input 
                            type="date" 
                            value={scheduleDate} 
                            onChange={e => setScheduleDate(e.target.value)} 
                            required 
                            className="rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors h-10 text-xs"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-foreground">Waktu</Label>
                        <Input 
                            type="time" 
                            value={scheduleTime} 
                            onChange={e => setScheduleTime(e.target.value)} 
                            required 
                            className="rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors h-10 text-xs"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Ruangan / Tempat</Label>
                    <Input 
                        placeholder="Contoh: Ruang Dosen Lt. 2" 
                        value={scheduleVenue} 
                        onChange={e => setScheduleVenue(e.target.value)} 
                        required 
                        className="rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors h-10 text-xs"
                    />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => onOpenChange(false)} 
                        disabled={loading} 
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || !scheduleDate || !scheduleTime || !scheduleVenue} 
                        className="rounded-xl font-bold cursor-pointer text-xs"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
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
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Jadwalkan Konsultasi</DialogTitle>
                <DialogDescription className="sr-only">Formulir penentuan jadwal bimbingan skripsi</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
