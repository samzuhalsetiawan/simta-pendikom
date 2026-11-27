"use client";

import React, { useMemo } from "react";
import { CalendarEventItem } from "@/lib/dal/seminar";
import { CalendarEventType } from "@/lib/constants/calendar";
import { Button } from "@/components/base/button";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Sparkles,
    MapPin
} from "lucide-react";

const EMPTY_EVENTS: CalendarEventItem[] = [];

export const WEEKDAY_NAMES: Record<number, string> = {
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
    0: "Minggu"
};

export const WEEKDAY_NAMES_SHORT: Record<number, string> = {
    1: "Sen",
    2: "Sel",
    3: "Rab",
    4: "Kam",
    5: "Jum",
    6: "Sab",
    0: "Min"
};

export function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(isoStr: string): string {
    const date = new Date(isoStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export interface MonthCalendarViewProps {
    currentMonthDate: Date;
    onChangeMonthDate: (date: Date) => void;
    eventsByDate: Record<string, CalendarEventItem[]>;
    activeDays: number[];
    onSelectEvent: (evt: CalendarEventItem) => void;
    onSelectOverflow: (evts: CalendarEventItem[]) => void;
    todayStr: string;
}

export interface GridCellInfo {
    dateStr: string;
    dateObj: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
}

// Sub-komponen sel hari terisolasi & ter-memoize (React.memo)
export interface MonthDayCellProps {
    cell: GridCellInfo;
    dayEvents: CalendarEventItem[];
    onSelectEvent: (evt: CalendarEventItem) => void;
    onSelectOverflow: (evts: CalendarEventItem[]) => void;
}

const MONTH_VIEW_TYPE_STYLES = {
    proposal: {
        className: "bg-seminar-proposal/10 border-seminar-proposal/30 text-[hsl(from_var(--color-seminar-proposal)_h_s_30%)] dark:bg-seminar-proposal/15 dark:text-[hsl(from_var(--color-seminar-proposal)_h_s_80%)]"
    },
    hasil: {
        className: "bg-seminar-hasil/10 border-seminar-hasil/30 text-[hsl(from_var(--color-seminar-hasil)_h_s_30%)] dark:bg-seminar-hasil/15 dark:text-[hsl(from_var(--color-seminar-hasil)_h_s_80%)]"
    },
    pendadaran: {
        className: "bg-sidang-skripsi/10 border-sidang-skripsi/30 text-[hsl(from_var(--color-sidang-skripsi)_h_s_30%)] dark:bg-sidang-skripsi/15 dark:text-[hsl(from_var(--color-sidang-skripsi)_h_s_80%)]"
    },
    konsultasi: {
        className: "bg-konsultasi/10 border-konsultasi/30 text-[hsl(from_var(--color-konsultasi)_h_s_30%)] dark:bg-konsultasi/15 dark:text-[hsl(from_var(--color-konsultasi)_h_s_80%)]"
    }
} as const;

export const MonthDayCell = React.memo(({
    cell,
    dayEvents,
    onSelectEvent,
    onSelectOverflow
}: MonthDayCellProps) => {
    const dayNum = cell.dateObj.getDate();
    const isFirstOfMonth = dayNum === 1;
    const monthShortName = cell.dateObj.toLocaleDateString('id-ID', { month: 'short' });

    // Maksimal agenda ringkas yang ditampilkan di dalam sel sebelum dimunculkan tombol overflow "+ n lainnya"
    const maxVisible = 3;
    const visibleEvents = dayEvents.slice(0, maxVisible);
    const overflowCount = dayEvents.length - maxVisible;

    return (
        <div
            className={`min-h-[75px] sm:min-h-[130px] border-r border-b border-border/60 flex flex-col transition-colors relative group min-w-0 overflow-hidden ${
                !cell.isCurrentMonth
                    ? "bg-muted/30 dark:bg-muted/10 opacity-60"
                    : cell.isToday
                    ? "bg-primary/5 dark:bg-primary/10"
                    : "bg-background hover:bg-muted/10"
            }`}
        >
            {/* Header Tanggal Sel */}
            <div className="flex items-center justify-between p-1 sm:px-2 sm:pt-2 sm:pb-1 shrink-0 min-w-0">
                <span className={`text-[10px] sm:text-xs font-bold font-mono transition-transform shrink-0 ${
                    cell.isToday
                        ? "w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm scale-105 text-[9px] sm:text-xs"
                        : cell.isCurrentMonth
                        ? "text-foreground group-hover:text-primary"
                        : "text-muted-foreground"
                }`}>
                    {dayNum} {isFirstOfMonth && !cell.isToday ? <span className="text-[8px] sm:text-[10px] uppercase font-normal ml-0.5 hidden xs:inline">{monthShortName}</span> : null}
                </span>

                {dayEvents.length > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground bg-muted px-1 sm:px-1.5 py-0.5 rounded-md shrink-0">
                        {dayEvents.length}
                    </span>
                )}
            </div>

            {/* Daftar Agenda Ringkas */}
            <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 p-1 sm:p-1.5 overflow-hidden min-w-0">
                {visibleEvents.map((event) => {
                    const eventType = (event.seminar_type || 'proposal') as CalendarEventType;
                    const styleConfig = MONTH_VIEW_TYPE_STYLES[eventType] || MONTH_VIEW_TYPE_STYLES.proposal;
                    return (
                        <div
                            key={event.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectEvent(event);
                            }}
                            className={`px-1 py-0.5 sm:px-2 sm:py-1 rounded-none text-[9px] sm:text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-2xs hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] min-w-0 overflow-hidden border-l-2 sm:border-l-[3px] ${styleConfig.className}`}
                            title={`${event.thesis_title || event.student_name} (${formatTime(event.scheduled_date)})`}
                        >
                            <span className="truncate font-semibold text-foreground block flex-1 min-w-0">
                                {event.thesis_title || event.student_name}
                            </span>
                        </div>
                    );
                })}

                {/* Tombol Overflow Jika Lebih dari maxVisible */}
                {overflowCount > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectOverflow(dayEvents);
                        }}
                        className="w-full py-0.5 sm:py-1 px-1 sm:px-2 rounded-none text-[8px] sm:text-[11px] font-bold bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-center transition-colors cursor-pointer border border-border/60 shadow-2xs truncate"
                    >
                        + {overflowCount} lagi
                    </button>
                )}
            </div>
        </div>
    );
});
MonthDayCell.displayName = "MonthDayCell";

export function MonthCalendarView({
    currentMonthDate,
    onChangeMonthDate,
    eventsByDate,
    activeDays,
    onSelectEvent,
    onSelectOverflow,
    todayStr
}: MonthCalendarViewProps) {
    // 1. Urutan kolom hari aktif (Senin - Minggu yang terpilih di filter)
    const activeWeekdaysOrdered = useMemo(() => {
        const order = [0, 1, 2, 3, 4, 5, 6];
        return order.filter(d => activeDays.includes(d));
    }, [activeDays]);

    // 2. Kalkulasi matriks sel grid satu bulan penuh (berikut padding)
    const gridCells = useMemo((): GridCellInfo[] => {
        if (activeWeekdaysOrdered.length === 0) return [];

        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const cells: GridCellInfo[] = [];

        // 2.A Padding tanggal mundur sebelum tanggal 1 agar sejajar dengan kolom hari pertama di activeWeekdaysOrdered
        const firstWeekdayCol = activeWeekdaysOrdered[0];
        let currentPadDate = new Date(firstDayOfMonth);
        while (currentPadDate.getDay() !== firstWeekdayCol) {
            currentPadDate.setDate(currentPadDate.getDate() - 1);
        }

        // Push semua tanggal dari currentPadDate sampai sebelum tanggal 1 (hanya jika hari tsb masuk activeDays)
        let iterDate = new Date(currentPadDate);
        while (iterDate < firstDayOfMonth) {
            if (activeDays.includes(iterDate.getDay())) {
                const dateStr = toDateKey(iterDate);
                cells.push({
                    dateStr,
                    dateObj: new Date(iterDate),
                    isCurrentMonth: false,
                    isToday: dateStr === todayStr
                });
            }
            iterDate.setDate(iterDate.getDate() + 1);
        }

        // 2.B Push semua tanggal di dalam bulan saat ini (hanya jika hari tsb masuk activeDays)
        iterDate = new Date(firstDayOfMonth);
        while (iterDate <= lastDayOfMonth) {
            if (activeDays.includes(iterDate.getDay())) {
                const dateStr = toDateKey(iterDate);
                cells.push({
                    dateStr,
                    dateObj: new Date(iterDate),
                    isCurrentMonth: true,
                    isToday: dateStr === todayStr
                });
            }
            iterDate.setDate(iterDate.getDate() + 1);
        }

        // 2.C Padding tanggal maju setelah akhir bulan sampai baris terakhir lengkap (multiples of activeWeekdaysOrdered.length)
        while (cells.length % activeWeekdaysOrdered.length !== 0) {
            if (activeDays.includes(iterDate.getDay())) {
                const dateStr = toDateKey(iterDate);
                cells.push({
                    dateStr,
                    dateObj: new Date(iterDate),
                    isCurrentMonth: false,
                    isToday: dateStr === todayStr
                });
            }
            iterDate.setDate(iterDate.getDate() + 1);
        }

        return cells;
    }, [currentMonthDate, activeDays, activeWeekdaysOrdered, todayStr]);

    // Hitung jumlah minggu (untuk label baris vertikal)
    const totalWeeks = useMemo(() => {
        if (activeWeekdaysOrdered.length === 0) return 0;
        return Math.ceil(gridCells.length / activeWeekdaysOrdered.length);
    }, [gridCells.length, activeWeekdaysOrdered.length]);

    // Handlers untuk ganti bulan
    const handlePrevMonth = () => {
        const nextDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
        onChangeMonthDate(nextDate);
    };

    const handleNextMonth = () => {
        const nextDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);
        onChangeMonthDate(nextDate);
    };

    const monthTitle = useMemo(() => {
        return currentMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }, [currentMonthDate]);

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background overflow-hidden">
            {/* Sticky Navigation Bar Bulan */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-md z-20 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border/60">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-8 w-8 rounded-lg hover:bg-background shadow-none"
                            title="Bulan Sebelumnya"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-8 w-8 rounded-lg hover:bg-background shadow-none"
                            title="Bulan Berikutnya"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <h2 className="text-base sm:text-xl font-bold font-heading capitalize text-foreground flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary hidden sm:inline-block" />
                        <span>{monthTitle}</span>
                    </h2>
                </div>
            </div>

            {/* Grid Kontainer (Scrollable Secara Vertikal jika layar pendek) */}
            <div className="flex-1 overflow-x-auto sm:overflow-x-auto overflow-y-auto custom-scrollbar flex flex-col w-full">
                {/* Header Kolom Hari dalam Seminggu */}
                <div
                    className="grid sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b border-border text-center shrink-0 w-full min-w-0 sm:min-w-[640px]"
                    style={{ gridTemplateColumns: `minmax(42px, 50px) repeat(${activeWeekdaysOrdered.length}, minmax(0, 1fr))` }}
                >
                    <div className="py-1.5 px-0.5 sm:py-2.5 sm:px-2 border-r border-border/80 sticky left-0 z-30 bg-muted/95 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-heading flex items-center justify-center">
                        {/* Sudut kosong */}
                    </div>
                    {activeWeekdaysOrdered.map((dayNum) => (
                        <div key={dayNum} className="py-1.5 px-0.5 sm:py-2.5 sm:px-2 border-r border-border/60 last:border-r-0 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading truncate">
                            <span className="sm:hidden">{WEEKDAY_NAMES_SHORT[dayNum]}</span>
                            <span className="hidden sm:inline">{WEEKDAY_NAMES[dayNum]}</span>
                        </div>
                    ))}
                </div>

                {/* Grid Matriks Sel Hari */}
                <div
                    className="grid flex-1 border-t border-l border-border/60 w-full min-w-0 sm:min-w-[640px]"
                    style={{ gridTemplateColumns: `minmax(42px, 50px) repeat(${activeWeekdaysOrdered.length}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: totalWeeks }).map((_, wIdx) => (
                        <React.Fragment key={`week-row-${wIdx}`}>
                            {/* Sticky Sidebar Minggu di Kiri */}
                            <div className="sticky left-0 z-10 bg-muted/80 backdrop-blur-md border-r border-b border-border/80 flex items-center justify-center p-1 sm:p-2 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-foreground font-heading select-none shadow-[2px_0_5px_rgba(0,0,0,0.02)] text-center leading-tight">
                                <span className="sm:hidden">M{wIdx + 1}</span>
                                <span className="hidden sm:inline">Minggu {wIdx + 1}</span>
                            </div>

                            {activeWeekdaysOrdered.map((dayNum, dIdx) => {
                                const cellIndex = wIdx * activeWeekdaysOrdered.length + dIdx;
                                const cell = gridCells[cellIndex];

                                if (!cell) {
                                    return (
                                        <div
                                            key={`empty-${wIdx}-${dayNum}`}
                                            className="min-h-[75px] sm:min-h-[130px] border-r border-b border-border/60 bg-muted/10"
                                        />
                                    );
                                }

                                const dayEvents = eventsByDate[cell.dateStr] || EMPTY_EVENTS;
                                return (
                                    <MonthDayCell
                                        key={cell.dateStr}
                                        cell={cell}
                                        dayEvents={dayEvents}
                                        onSelectEvent={onSelectEvent}
                                        onSelectOverflow={onSelectOverflow}
                                    />
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

