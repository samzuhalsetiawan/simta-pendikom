"use client";

import React from "react";
import Link from "next/link";
import { CalendarEventItem } from "@/lib/dal/seminar";
import { DEFAULT_EVENT_DURATION_MINUTES, CalendarEventType } from "@/lib/constants/calendar";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/base/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Button } from "@/components/base/button";
import { Clock, MapPin, Users, Calendar as CalendarIcon, ArrowLeft, X, BookOpen, GraduationCap } from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles,
    type GradientCardVariant
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CalendarEventDetailModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    selectedEvent: CalendarEventItem | null;
    overflowEvents?: CalendarEventItem[] | null;
    onSelectFromOverflow?: (event: CalendarEventItem) => void;
    onBackToOverflow?: () => void;
    inline?: boolean;
}

const MODAL_TYPE_STYLES = {
    proposal: {
        label: "Seminar Proposal",
        variant: "seminar-proposal" as GradientCardVariant,
        badge: "border-seminar-proposal/20 bg-seminar-proposal/10 text-seminar-proposal",
        timeColor: "text-seminar-proposal",
    },
    hasil: {
        label: "Seminar Hasil",
        variant: "seminar-hasil" as GradientCardVariant,
        badge: "border-seminar-hasil/20 bg-seminar-hasil/10 text-seminar-hasil",
        timeColor: "text-seminar-hasil",
    },
    pendadaran: {
        label: "Sidang Skripsi",
        variant: "sidang-skripsi" as GradientCardVariant,
        badge: "border-sidang-skripsi/20 bg-sidang-skripsi/10 text-sidang-skripsi",
        timeColor: "text-sidang-skripsi",
    },
    konsultasi: {
        label: "Konsultasi",
        variant: "konsultasi" as GradientCardVariant,
        badge: "border-konsultasi/20 bg-konsultasi/10 text-konsultasi",
        timeColor: "text-konsultasi",
    }
} as const;

export function CalendarEventDetailModal({
    open = false,
    onOpenChange = () => {},
    selectedEvent,
    overflowEvents,
    onSelectFromOverflow,
    onBackToOverflow,
    inline = false
}: CalendarEventDetailModalProps) {
    if (!selectedEvent && overflowEvents && overflowEvents.length > 0) {
        const overflowContent = (
            <GradientCard variant="lulus" rounded="bottom" className="w-full max-w-lg shadow-2xl border-0 text-left">
                <GradientCardHeader variant="lulus" rounded="none" className="p-5">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["lulus"])} />
                        <div className="space-y-0.5">
                            <GradientCardTitle>Daftar Agenda ({overflowEvents.length} Seminar)</GradientCardTitle>
                            <GradientCardDescription>Klik salah satu agenda untuk melihat detail lengkap</GradientCardDescription>
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
                <div className="px-6 divide-y divide-border/50 max-h-[380px] overflow-y-auto">
                    {overflowEvents.map((evt) => {
                        const type = (evt.seminar_type || 'proposal') as CalendarEventType;
                        const config = MODAL_TYPE_STYLES[type] || MODAL_TYPE_STYLES.proposal;
                        const startDate = new Date(evt.scheduled_date);
                        const timeStr = startDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div
                                key={evt.id}
                                onClick={() => onSelectFromOverflow?.(evt)}
                                className="py-3.5 first:pt-4 last:pb-4 px-2 hover:bg-muted/30 -mx-2 transition-colors cursor-pointer text-left group"
                            >
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className={cn("font-mono font-bold", config.timeColor)}>{timeStr} WITA</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide",
                                        config.badge
                                    )}>
                                        {config.label}
                                    </span>
                                </div>
                                <h5 className="text-xs sm:text-sm font-semibold line-clamp-2 mt-1.5 group-hover:text-primary transition-colors text-foreground">
                                    {evt.thesis_title || "Tanpa Judul"}
                                </h5>
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <Avatar className="w-5 h-5 border border-border/70 shadow-xs shrink-0">
                                            <AvatarImage 
                                                src={evt.student_image || (evt.student_nim ? `/api/avatar/${evt.student_nim}` : undefined)} 
                                                alt={evt.student_name}
                                                className="object-cover" 
                                            />
                                            <AvatarFallback className="font-bold text-[9px] bg-primary/10 text-primary">
                                                {evt.student_name ? evt.student_name.slice(0, 2).toUpperCase() : 'M'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-foreground/80 truncate max-w-[200px]">{evt.student_name}</span>
                                    </div>
                                    <span className="flex items-center gap-1 shrink-0 text-muted-foreground">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate max-w-[150px]">{evt.venue || "Ruang -"}</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GradientCard>
        );

        if (inline) {
            return overflowContent;
        }

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-lg focus:outline-none">
                    <DialogTitle className="sr-only">Agenda Kalender</DialogTitle>
                    <DialogDescription className="sr-only">Daftar agenda dan jadwal pada tanggal terpilih</DialogDescription>
                    {overflowContent}
                </DialogContent>
            </Dialog>
        );
    }

    if (!selectedEvent) return null;

    const eventType = (selectedEvent.seminar_type || 'proposal') as CalendarEventType;
    const styleConfig = MODAL_TYPE_STYLES[eventType] || MODAL_TYPE_STYLES.proposal;
    const variant = styleConfig.variant;

    const startDate = new Date(selectedEvent.scheduled_date);
    const endDate = new Date(startDate.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000);

    const dateFormatted = startDate.toLocaleDateString("id-ID", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const timeFormatted = `${startDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WITA`;

    const detailUrl = eventType === 'proposal'
        ? `/seminar-proposal/${selectedEvent.id}`
        : eventType === 'hasil'
        ? `/seminar-hasil/${selectedEvent.id}`
        : eventType === 'pendadaran'
        ? `/sidang-skripsi/${selectedEvent.id}`
        : eventType === 'konsultasi'
        ? `/konsultasi/${selectedEvent.id}`
        : '#';

    const singleEventContent = (
        <GradientCard variant={variant} rounded="bottom" className="w-full max-w-lg shadow-2xl border-0 text-left">
            <GradientCardHeader variant={variant} rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <CalendarIcon className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[variant])} />
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <GradientCardTitle>Detail Agenda</GradientCardTitle>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide",
                                styleConfig.badge
                            )}>
                                {styleConfig.label}
                            </span>
                        </div>
                        <GradientCardDescription>{dateFormatted}</GradientCardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {overflowEvents && overflowEvents.length > 0 && onBackToOverflow && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBackToOverflow}
                            className="h-8 px-2 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali</span>
                        </Button>
                    )}
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
                </div>
            </GradientCardHeader>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Judul Penelitian */}
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        Judul Penelitian
                    </span>
                    <h4 className="text-sm sm:text-base font-heading font-bold text-foreground leading-snug">
                        {selectedEvent.thesis_title || "Judul Belum Ditentukan"}
                    </h4>
                </div>

                {/* Mahasiswa Info - Menyatu dengan surface */}
                <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        Mahasiswa
                    </span>
                    <div className="flex items-center gap-3.5">
                        <Avatar className="w-12 h-12 border border-border/80 shadow-sm shrink-0">
                            <AvatarImage 
                                src={selectedEvent.student_image || (selectedEvent.student_nim ? `/api/avatar/${selectedEvent.student_nim}` : undefined)} 
                                alt={selectedEvent.student_name}
                                className="object-cover" 
                            />
                            <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                                {selectedEvent.student_name ? selectedEvent.student_name.slice(0, 2).toUpperCase() : 'M'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                                {selectedEvent.student_name}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                                NIM. {selectedEvent.student_nim}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Waktu & Lokasi - Menyatu dengan surface */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-border/50">
                    <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Waktu Pelaksanaan</span>
                            <span className="text-xs font-semibold text-foreground">{timeFormatted}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ruangan / Tempat</span>
                            <span className="text-xs font-semibold text-foreground">{selectedEvent.venue || "Ruang Seminar"}</span>
                        </div>
                    </div>
                </div>

                {/* Dosen Pembimbing & Penguji - Menyatu dengan surface */}
                {selectedEvent.lecturers && selectedEvent.lecturers.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            Dosen Pembimbing & Penguji
                        </span>
                        <div className="divide-y divide-border/30">
                            {selectedEvent.lecturers.map((lec, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2.5 first:pt-1 last:pb-0">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Avatar className="w-9 h-9 border border-border/80 shadow-sm shrink-0">
                                            <AvatarImage 
                                                src={lec.image || (lec.nip ? `/api/avatar/${lec.nip}` : undefined)} 
                                                alt={lec.name}
                                                className="object-cover" 
                                            />
                                            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary">
                                                {lec.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-semibold text-foreground truncate">
                                                {lec.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                NIP. {lec.nip}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground shrink-0 capitalize">
                                        {lec.role.replace(/_/g, ' ')} {lec.position > 0 ? lec.position : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold text-xs cursor-pointer"
                    >
                        Tutup
                    </Button>
                    <Link href={detailUrl}>
                        <Button className="rounded-xl font-bold text-xs shadow-sm cursor-pointer">
                            Lihat Detail Seminar
                        </Button>
                    </Link>
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return singleEventContent;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-lg focus:outline-none">
                <DialogTitle className="sr-only">Detail Jadwal</DialogTitle>
                <DialogDescription className="sr-only">Informasi detail agenda seminar atau kegiatan akademik</DialogDescription>
                {singleEventContent}
            </DialogContent>
        </Dialog>
    );
}
