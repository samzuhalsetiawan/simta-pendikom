"use client";

import React from "react";
import { CalendarEventItem } from "@/lib/dal/seminar";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Search, X, MapPin, ArrowDownUp, AlertCircle } from "lucide-react";
import { CalendarEventType } from "@/lib/constants/calendar";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CalendarSearchModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hasActiveFilters?: boolean;
    events: CalendarEventItem[];
    onSelectEvent: (event: CalendarEventItem) => void;
    inline?: boolean;
    initialQuery?: string;
}

const SEARCH_TYPE_STYLES = {
    proposal: {
        label: "Seminar Proposal",
        badge: "border-seminar-proposal/20 bg-seminar-proposal/10 text-seminar-proposal",
        timeColor: "text-seminar-proposal",
    },
    hasil: {
        label: "Seminar Hasil",
        badge: "border-seminar-hasil/20 bg-seminar-hasil/10 text-seminar-hasil",
        timeColor: "text-seminar-hasil",
    },
    pendadaran: {
        label: "Sidang Skripsi",
        badge: "border-sidang-skripsi/20 bg-sidang-skripsi/10 text-sidang-skripsi",
        timeColor: "text-sidang-skripsi",
    },
    konsultasi: {
        label: "Konsultasi",
        badge: "border-konsultasi/20 bg-konsultasi/10 text-konsultasi",
        timeColor: "text-konsultasi",
    }
} as const;

export function CalendarSearchModal({
    open = false,
    onOpenChange = () => {},
    hasActiveFilters,
    events,
    onSelectEvent,
    inline = false,
    initialQuery = ""
}: CalendarSearchModalProps) {
    const [searchQuery, setSearchQuery] = React.useState(initialQuery);
    const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc');
    const q = searchQuery.toLowerCase().trim();

    React.useEffect(() => {
        if (!open && !inline) {
            setSearchQuery("");
        } else if (open && !inline && initialQuery) {
            setSearchQuery(initialQuery);
        }
    }, [open, inline, initialQuery]);

    const filteredEvents = React.useMemo(() => {
        if (!q) return [];
        return events
            .filter((evt) => {
                const title = (evt.thesis_title || "").toLowerCase();
                const name = (evt.student_name || "").toLowerCase();
                const nim = (evt.student_nim || "").toLowerCase();
                const venue = (evt.venue || "").toLowerCase();
                const type = (evt.seminar_type || "").toLowerCase();

                return (
                    title.includes(q) ||
                    name.includes(q) ||
                    nim.includes(q) ||
                    venue.includes(q) ||
                    type.includes(q)
                );
            })
            .sort((a, b) => {
                const dateA = new Date(a.scheduled_date).getTime();
                const dateB = new Date(b.scheduled_date).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
    }, [events, q, sortOrder]);

    const modalInner = (
        <GradientCard variant="konsultasi" rounded="bottom" className="w-full max-w-lg shadow-2xl border-0 text-left">
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-5">
                <div className="flex items-center gap-3">
                    <Search className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["konsultasi"])} />
                    <div className="space-y-0.5">
                        <GradientCardTitle>Pencarian Agenda</GradientCardTitle>
                        <GradientCardDescription>Cari jadwal berdasarkan nama, NIM, atau judul</GradientCardDescription>
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

            <div className="p-6 space-y-4">
                {/* Search Input Bar */}
                <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama mahasiswa, NIM, atau judul skripsi..."
                        className="pl-9 pr-9 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                        autoFocus={!inline}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Sub-header status / sort toggle */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        {q ? (
                            <>Menemukan <strong className="text-foreground">{filteredEvents.length}</strong> agenda</>
                        ) : (
                            <span>Ketik kata kunci untuk mencari</span>
                        )}
                    </span>
                    {q && filteredEvents.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center gap-1 hover:text-foreground font-medium cursor-pointer"
                        >
                            <ArrowDownUp className="w-3.5 h-3.5" />
                            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
                        </button>
                    )}
                </div>

                {/* Results List */}
                <div className="divide-y divide-border/50 max-h-[340px] overflow-y-auto px-1">
                    {!q && (
                        <div className="text-center py-8 space-y-1.5 text-muted-foreground">
                            <Search className="w-6 h-6 mx-auto opacity-30 mb-1" />
                            <p className="text-xs font-medium">Ketik nama mahasiswa, NIM, atau judul untuk mencari</p>
                        </div>
                    )}

                    {q && filteredEvents.length === 0 && (
                        <div className="text-center py-10 space-y-2 bg-muted/20 rounded-2xl border border-dashed border-border/80 my-2">
                            <AlertCircle className="w-7 h-7 mx-auto text-muted-foreground/60" />
                            <p className="text-xs font-semibold text-muted-foreground">
                                Tidak ditemukan agenda yang cocok dengan &quot;{searchQuery}&quot;
                            </p>
                        </div>
                    )}

                    {filteredEvents.map((evt) => {
                        const type = (evt.seminar_type || 'proposal') as CalendarEventType;
                        const styleConfig = SEARCH_TYPE_STYLES[type] || SEARCH_TYPE_STYLES.proposal;
                        const startDate = new Date(evt.scheduled_date);
                        const formattedDate = startDate.toLocaleDateString("id-ID", {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        });
                        const timeStr = startDate.toLocaleTimeString("id-ID", {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div
                                key={evt.id}
                                onClick={() => {
                                    onSelectEvent(evt);
                                    onOpenChange(false);
                                }}
                                className="py-3.5 first:pt-2 last:pb-2 px-2 hover:bg-muted/30 -mx-2 transition-colors cursor-pointer text-left group"
                            >
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className={cn("font-mono font-bold", styleConfig.timeColor)}>
                                        {formattedDate}, {timeStr} WITA
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide",
                                        styleConfig.badge
                                    )}>
                                        {styleConfig.label}
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
                                        <span className="font-medium text-foreground/80 truncate max-w-[200px]">
                                            {evt.student_name}
                                            {evt.student_nim && (
                                                <span className="text-muted-foreground font-normal ml-1">({evt.student_nim})</span>
                                            )}
                                        </span>
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
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-lg focus:outline-none">
                <DialogTitle className="sr-only">Cari Agenda Kalender</DialogTitle>
                <DialogDescription className="sr-only">Pencarian jadwal seminar, sidang, dan agenda akademik</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
