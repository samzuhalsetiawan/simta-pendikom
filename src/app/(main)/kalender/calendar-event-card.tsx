"use client";

import React from "react";
import { CalendarEventItem } from "@/lib/dal/seminar";
import { DEFAULT_EVENT_DURATION_MINUTES } from "@/lib/constants/calendar";
import { Clock, MapPin, Layers } from "lucide-react";
import { cva } from "class-variance-authority";

interface CalendarEventCardProps {
    event?: CalendarEventItem;
    style: React.CSSProperties;
    onClick?: (event: CalendarEventItem) => void;
    overflowInfo?: {
        count: number;
        events: CalendarEventItem[];
        onOverflowClick: (events: CalendarEventItem[]) => void;
    };
    checkIsDragging?: () => boolean;
}

const eventCardVariants = cva(
    "absolute z-10 flex flex-col justify-between p-1.5 sm:p-2 transition-all cursor-pointer border-l-4 hover:shadow-md border-t border-r border-b border-foreground/5 dark:border-white/10 group select-none overflow-hidden rounded-none animate-in fade-in zoom-in-95",
    {
        variants: {
            eventType: {
                proposal: "border-l-seminar-proposal bg-seminar-proposal/15 dark:bg-seminar-proposal/20 hover:bg-seminar-proposal/25 dark:hover:bg-seminar-proposal/30 text-[hsl(from_var(--color-seminar-proposal)_h_s_30%)] dark:text-[hsl(from_var(--color-seminar-proposal)_h_s_80%)]",
                hasil: "border-l-seminar-hasil bg-seminar-hasil/15 dark:bg-seminar-hasil/20 hover:bg-seminar-hasil/25 dark:hover:bg-seminar-hasil/30 text-[hsl(from_var(--color-seminar-hasil)_h_s_30%)] dark:text-[hsl(from_var(--color-seminar-hasil)_h_s_80%)]",
                pendadaran: "border-l-sidang-skripsi bg-sidang-skripsi/15 dark:bg-sidang-skripsi/20 hover:bg-sidang-skripsi/25 dark:hover:bg-sidang-skripsi/30 text-[hsl(from_var(--color-sidang-skripsi)_h_s_30%)] dark:text-[hsl(from_var(--color-sidang-skripsi)_h_s_80%)]",
                konsultasi: "border-l-konsultasi bg-konsultasi/15 dark:bg-konsultasi/20 hover:bg-konsultasi/25 dark:hover:bg-konsultasi/30 text-[hsl(from_var(--color-konsultasi)_h_s_30%)] dark:text-[hsl(from_var(--color-konsultasi)_h_s_80%)]"
            }
        },
        defaultVariants: {
            eventType: "proposal"
        }
    }
);

const badgeVariants = cva(
    "inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-2xs shrink-0 text-white",
    {
        variants: {
            eventType: {
                proposal: "bg-seminar-proposal",
                hasil: "bg-seminar-hasil",
                pendadaran: "bg-sidang-skripsi",
                konsultasi: "bg-konsultasi"
            }
        },
        defaultVariants: {
            eventType: "proposal"
        }
    }
);

const EVENT_LABELS: Record<string, string> = {
    proposal: "Seminar Proposal",
    hasil: "Seminar Hasil",
    pendadaran: "Sidang Skripsi",
    konsultasi: "Konsultasi"
};

export const CalendarEventCard = React.memo(function CalendarEventCard({
    event,
    style,
    onClick,
    overflowInfo,
    checkIsDragging
}: CalendarEventCardProps) {
    // Jika komponen ini adalah penanda overflow (+n lainnya) karena batas maksimal split = 2
    if (overflowInfo && overflowInfo.events.length > 0) {
        return (
            <div
                style={style}
                onClick={(e) => {
                    e.stopPropagation();
                    if (checkIsDragging && checkIsDragging()) return;
                    overflowInfo.onOverflowClick(overflowInfo.events);
                }}
                className="absolute z-20 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center transition-all border-t border-b border-r cursor-pointer border-l-4 border-l-emerald-500 bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-xs group select-none overflow-hidden rounded-none animate-in fade-in zoom-in-95"
            >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>+{overflowInfo.count} Agenda Lain</span>
                </div>
                <span className="text-[10px] sm:text-xs opacity-80 font-medium mt-0.5 text-emerald-700/80 dark:text-emerald-300/80">
                    Klik untuk lihat semua
                </span>
            </div>
        );
    }

    if (!event) return null;

    const validEventType: "proposal" | "hasil" | "pendadaran" | "konsultasi" = 
        (event.seminar_type && ['proposal', 'hasil', 'pendadaran', 'konsultasi'].includes(event.seminar_type)) 
            ? event.seminar_type as "proposal" | "hasil" | "pendadaran" | "konsultasi"
            : 'proposal';
    const label = EVENT_LABELS[validEventType] || EVENT_LABELS.proposal;

    // Hitung waktu selesai secara visual berdasarkan konstanta durasi default
    const startDate = new Date(event.scheduled_date);
    const endDate = new Date(startDate.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000);

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const timeRangeStr = `${formatTime(startDate)} - ${formatTime(endDate)} WITA`;

    return (
        <div
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                if (checkIsDragging && checkIsDragging()) return;
                if (onClick) onClick(event);
            }}
            className={eventCardVariants({ eventType: validEventType })}
        >
            {/* Top header: Badge Jenis Agenda & Jam */}
            <div className="flex items-center justify-between gap-1 shrink-0">
                <span className={badgeVariants({ eventType: validEventType })}>
                    {label}
                </span>
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold opacity-90 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTime(startDate)}</span>
                </div>
            </div>

            {/* Middle: Judul Skripsi / Proposal */}
            <div className="my-0.5 min-w-0">
                <h4 className="font-semibold text-[11px] sm:text-xs line-clamp-1 sm:line-clamp-2 leading-snug group-hover:underline decoration-1 underline-offset-2">
                    {event.thesis_title || "Tanpa Judul"}
                </h4>
                <p className="text-[9px] sm:text-[10px] opacity-85 line-clamp-1 mt-0.5 font-medium">
                    {event.student_name} ({event.student_nim})
                </p>
            </div>

            {/* Bottom: Tempat / Ruangan */}
            <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] opacity-90 pt-0.5 border-t border-foreground/10 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-1 truncate font-medium">
                    <MapPin className="w-2.5 h-2.5 shrink-0 opacity-80" />
                    <span className="truncate">{event.venue || "Belum ditentukan"}</span>
                </div>
                <span className="text-[9px] sm:hidden font-mono font-bold shrink-0">
                    {formatTime(startDate)}
                </span>
            </div>
        </div>
    );
});

