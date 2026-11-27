"use client";

import React, { useMemo } from "react";
import { CalendarEventItem } from "@/lib/dal/seminar";
import { Button } from "@/components/base/button";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from "lucide-react";
import {
    MonthCalendarViewProps,
    GridCellInfo,
    MonthDayCell,
    toDateKey,
    WEEKDAY_NAMES,
    WEEKDAY_NAMES_SHORT
} from "./month-calendar-view";

const EMPTY_EVENTS: CalendarEventItem[] = [];

export function SwappedMonthCalendarView({
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

        // 2.B Push semua tanggal di dalam bulan saat ini
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

        // 2.C Padding tanggal maju setelah akhir bulan sampai baris terakhir lengkap
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

    // Hitung jumlah minggu (baris standar menjadi kolom di swapped view)
    const totalWeeks = useMemo(() => {
        if (activeWeekdaysOrdered.length === 0) return 0;
        return Math.ceil(gridCells.length / activeWeekdaysOrdered.length);
    }, [gridCells.length, activeWeekdaysOrdered.length]);

    // Handlers untuk navigasi bulan
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

            {/* Grid Kontainer (Transposed Matrix: Kolom = Minggu 1..N, Baris = Senin..Minggu) */}
            <div className="flex-1 overflow-x-auto sm:overflow-x-auto overflow-y-auto custom-scrollbar flex flex-col w-full">
                {/* Header Kolom: Minggu 1 s.d. Minggu N */}
                <div
                    className="grid sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b border-border text-center shrink-0 w-full min-w-0 sm:min-w-[640px]"
                    style={{
                        gridTemplateColumns: `minmax(42px, 50px) repeat(${totalWeeks}, minmax(0, 1fr))`
                    }}
                >
                    <div className="py-1.5 px-0.5 sm:py-2.5 sm:px-2 border-r border-border/80 sticky left-0 z-30 bg-muted/95 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-heading flex items-center justify-center">
                        {/* Sudut kosong */}
                    </div>
                    {Array.from({ length: totalWeeks }).map((_, wIdx) => (
                        <div
                            key={`week-col-${wIdx}`}
                            className="py-1.5 px-0.5 sm:py-2.5 sm:px-2 border-r border-border/60 last:border-r-0 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground font-heading truncate"
                        >
                            <span className="sm:hidden">M{wIdx + 1}</span>
                            <span className="hidden sm:inline">Minggu {wIdx + 1}</span>
                        </div>
                    ))}
                </div>

                {/* Body Grid: Baris per Hari (Senin..Minggu) */}
                <div
                    className="grid flex-1 border-t border-l border-border/60 w-full min-w-0 sm:min-w-[640px]"
                    style={{
                        gridTemplateColumns: `minmax(42px, 50px) repeat(${totalWeeks}, minmax(0, 1fr))`
                    }}
                >
                    {activeWeekdaysOrdered.map((dayNum, dIdx) => (
                        <React.Fragment key={`day-row-${dayNum}`}>
                            {/* Sticky Sidebar Hari di Kiri */}
                            <div className="sticky left-0 z-10 bg-muted/80 backdrop-blur-md border-r border-b border-border/80 flex items-center justify-center p-1 sm:p-3 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-foreground font-heading select-none shadow-[2px_0_5px_rgba(0,0,0,0.02)] text-center leading-tight">
                                <span className="sm:hidden">{WEEKDAY_NAMES_SHORT[dayNum]}</span>
                                <span className="hidden sm:inline">{WEEKDAY_NAMES[dayNum]}</span>
                            </div>

                            {/* Sel Tanggal untuk Minggu 1..N di baris hari ini */}
                            {Array.from({ length: totalWeeks }).map((_, wIdx) => {
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
