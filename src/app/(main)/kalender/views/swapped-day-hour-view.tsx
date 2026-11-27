"use client";

import React, { useMemo, useRef, useState } from "react";
import { DEFAULT_EVENT_DURATION_MINUTES } from "@/lib/constants/calendar";
import { CalendarEventItem } from "@/lib/dal/seminar";
import { Clock } from "lucide-react";
import { Badge } from "@/components/base/badge";
import { CalendarEventCard } from "../calendar-event-card";

interface SwappedDayHourViewProps {
    displayDays: string[];
    hours: number[];
    eventsByDate: Record<string, CalendarEventItem[]>;
    todayStr: string;
    onSelectEvent: (evt: CalendarEventItem) => void;
    onSelectOverflow: (evts: CalendarEventItem[]) => void;
    checkIsDragging?: () => boolean;
    scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
    onContainerScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const HOUR_COL_WIDTH_PX = 140;
const SIDEBAR_WIDTH_PX = 140;
const MIN_ROW_HEIGHT_PX = 100;

interface HorizontalLayoutItem {
    key: string;
    event?: CalendarEventItem;
    overflowInfo?: {
        count: number;
        events: CalendarEventItem[];
        onOverflowClick: (evts: CalendarEventItem[]) => void;
    };
    style: React.CSSProperties;
}

const SwappedDayRow = React.memo(({
    dateStr,
    isToday,
    dayEvents,
    hours,
    onSelectEvent,
    onSelectOverflow,
    checkIsDragging
}: {
    dateStr: string;
    isToday: boolean;
    dayEvents: CalendarEventItem[];
    hours: number[];
    onSelectEvent: (evt: CalendarEventItem) => void;
    onSelectOverflow: (evts: CalendarEventItem[]) => void;
    checkIsDragging?: () => boolean;
}) => {
    const dt = useMemo(() => new Date(dateStr), [dateStr]);
    const dayName = dt.toLocaleDateString('id-ID', { weekday: 'long' });
    const dateNum = dt.getDate();
    const monthName = dt.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    const dayEventsCount = dayEvents.length;

    const totalGridWidth = hours.length * HOUR_COL_WIDTH_PX;

    // Hitung posisi horizontal & aturan overlap baru
    const { layoutItems, rowHeight } = useMemo(() => {
        if (!dayEvents || dayEvents.length === 0) {
            return { layoutItems: [], rowHeight: MIN_ROW_HEIGHT_PX };
        }

        // Sort by start time ascending
        const sorted = [...dayEvents].sort((a, b) => {
            return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
        });

        // Group overlapping events into time clusters
        const clusters: CalendarEventItem[][] = [];
        let currentCluster: CalendarEventItem[] = [];
        let clusterEndTime = -1;

        sorted.forEach((evt) => {
            const evtDt = new Date(evt.scheduled_date);
            const startHour = evtDt.getHours() + evtDt.getMinutes() / 60;
            const durationHours = DEFAULT_EVENT_DURATION_MINUTES / 60;
            const endHour = startHour + durationHours;

            if (currentCluster.length === 0 || startHour < clusterEndTime) {
                currentCluster.push(evt);
                clusterEndTime = Math.max(clusterEndTime, endHour);
            } else {
                clusters.push(currentCluster);
                currentCluster = [evt];
                clusterEndTime = endHour;
            }
        });
        if (currentCluster.length > 0) clusters.push(currentCluster);

        const items: HorizontalLayoutItem[] = [];

        clusters.forEach((cluster) => {
            if (cluster.length === 1) {
                // 1. Tidak overlap -> Full height baris hari/tanggal tanpa margin, full press ke grid line
                const evt = cluster[0];
                const evtDt = new Date(evt.scheduled_date);
                const startHour = evtDt.getHours() + evtDt.getMinutes() / 60;
                const durationHours = DEFAULT_EVENT_DURATION_MINUTES / 60;
                const leftPx = startHour * HOUR_COL_WIDTH_PX;
                const maxAllowedWidth = totalGridWidth - leftPx;
                const widthPx = Math.min(durationHours * HOUR_COL_WIDTH_PX, maxAllowedWidth);

                if (widthPx > 0) {
                    items.push({
                        key: evt.id,
                        event: evt,
                        style: {
                            position: 'absolute',
                            left: `${leftPx}px`,
                            width: `${Math.max(40, widthPx)}px`,
                            top: '0%',
                            height: '100%'
                        }
                    });
                }
            } else if (cluster.length === 2) {
                // 2. Maksimal 2 event overlap -> rasio pembagian height 1:1 (masing-masing 50% full press)
                cluster.forEach((evt, idx) => {
                    const evtDt = new Date(evt.scheduled_date);
                    const startHour = evtDt.getHours() + evtDt.getMinutes() / 60;
                    const durationHours = DEFAULT_EVENT_DURATION_MINUTES / 60;
                    const leftPx = startHour * HOUR_COL_WIDTH_PX;
                    const maxAllowedWidth = totalGridWidth - leftPx;
                    const widthPx = Math.min(durationHours * HOUR_COL_WIDTH_PX, maxAllowedWidth);

                    if (widthPx > 0) {
                        items.push({
                            key: evt.id,
                            event: evt,
                            style: {
                                position: 'absolute',
                                left: `${leftPx}px`,
                                width: `${Math.max(40, widthPx)}px`,
                                top: idx === 0 ? '0%' : '50%',
                                height: '50%'
                            }
                        });
                    }
                });
            } else {
                // 3. Lebih dari 2 event -> Event pertama di top (50%), sisanya digabung di bottom sebagai '+n agenda lainnya' (50%)
                const firstEvt = cluster[0];
                const evtDt = new Date(firstEvt.scheduled_date);
                const startHour = evtDt.getHours() + evtDt.getMinutes() / 60;
                const durationHours = DEFAULT_EVENT_DURATION_MINUTES / 60;
                const leftPx = startHour * HOUR_COL_WIDTH_PX;
                const maxAllowedWidth = totalGridWidth - leftPx;
                const widthPx = Math.min(durationHours * HOUR_COL_WIDTH_PX, maxAllowedWidth);

                if (widthPx > 0) {
                    items.push({
                        key: firstEvt.id,
                        event: firstEvt,
                        style: {
                            position: 'absolute',
                            left: `${leftPx}px`,
                            width: `${Math.max(40, widthPx)}px`,
                            top: '0%',
                            height: '50%'
                        }
                    });
                }

                const overflowEvents = cluster.slice(1);
                let minStart = startHour;
                let maxEnd = startHour + durationHours;
                overflowEvents.forEach((e) => {
                    const eDt = new Date(e.scheduled_date);
                    const eStart = eDt.getHours() + eDt.getMinutes() / 60;
                    const eEnd = eStart + DEFAULT_EVENT_DURATION_MINUTES / 60;
                    if (eStart < minStart) minStart = eStart;
                    if (eEnd > maxEnd) maxEnd = eEnd;
                });
                const overflowLeftPx = minStart * HOUR_COL_WIDTH_PX;
                const overflowWidthPx = Math.min((maxEnd - minStart) * HOUR_COL_WIDTH_PX, totalGridWidth - overflowLeftPx);

                if (overflowWidthPx > 0) {
                    items.push({
                        key: `overflow-${firstEvt.id}`,
                        overflowInfo: {
                            count: overflowEvents.length,
                            events: overflowEvents,
                            onOverflowClick: (evts) => onSelectOverflow(evts)
                        },
                        style: {
                            position: 'absolute',
                            left: `${overflowLeftPx}px`,
                            width: `${Math.max(60, overflowWidthPx)}px`,
                            top: '50%',
                            height: '50%'
                        }
                    });
                }
            }
        });

        return { layoutItems: items, rowHeight: MIN_ROW_HEIGHT_PX };
    }, [dayEvents, totalGridWidth, onSelectOverflow]);

    return (
        <div className="flex border-b border-border transition-colors hover:bg-muted/10 relative">
            {/* Left Sidebar: Tanggal (Sticky Left 0) */}
            <div
                style={{ width: `${SIDEBAR_WIDTH_PX}px`, height: `${rowHeight}px` }}
                className={`sticky left-0 z-20 shrink-0 border-r border-border px-3 py-3 flex flex-col items-center justify-center text-center transition-colors shadow-[1px_0_0_0_hsl(var(--border))] ${
                    isToday
                        ? 'bg-primary/10 dark:bg-primary/15 font-bold'
                        : 'bg-background hover:bg-muted/30'
                }`}
            >
                {isToday && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-primary text-primary-foreground tracking-wider shadow-2xs mb-1">
                        Hari Ini
                    </span>
                )}
                <span className={`text-[11px] uppercase tracking-wider font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {dayName}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-base sm:text-lg font-black ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {dateNum}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                        {monthName}
                    </span>
                </div>
                {dayEventsCount > 0 && (
                    <Badge variant="outline" className="mt-1 h-4 px-1.5 text-[9px] font-bold border-primary/30 text-primary bg-primary/5">
                        {dayEventsCount} Agenda
                    </Badge>
                )}
            </div>

            {/* Right Area: Grid jam & Event Card (dengan overflow-hidden agar tepat berhenti di 24:00) */}
            <div style={{ width: `${totalGridWidth}px`, height: `${rowHeight}px` }} className="relative shrink-0 overflow-hidden">
                {/* Vertical Hour Columns Background */}
                <div className="absolute inset-0 flex pointer-events-none">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            style={{ width: `${HOUR_COL_WIDTH_PX}px` }}
                            className="h-full border-r border-foreground/5 dark:border-white/5 relative shrink-0"
                        >
                            {/* Dotted half-hour vertical line */}
                            <span className="absolute top-0 bottom-0 left-1/2 w-[1px] border-l border-dotted border-foreground/10" />
                        </div>
                    ))}
                </div>

                {/* Event Cards */}
                {layoutItems.map((item) => (
                    <CalendarEventCard
                        key={item.key}
                        event={item.event}
                        overflowInfo={item.overflowInfo}
                        style={item.style}
                        onClick={item.event ? () => onSelectEvent(item.event!) : undefined}
                        checkIsDragging={checkIsDragging}
                    />
                ))}
            </div>
        </div>
    );
});
SwappedDayRow.displayName = "SwappedDayRow";

export function SwappedDayHourView({
    displayDays,
    hours,
    eventsByDate,
    todayStr,
    onSelectEvent,
    onSelectOverflow,
    checkIsDragging,
    scrollContainerRef: externalScrollRef,
    onContainerScroll
}: SwappedDayHourViewProps) {
    const internalScrollRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = externalScrollRef || internalScrollRef;

    const [isPanningState, setIsPanningState] = useState(false);
    const isMouseDownRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const scrollTopRef = useRef(0);
    const hasDraggedRef = useRef(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        isMouseDownRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        if (scrollContainerRef.current) {
            scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
            scrollTopRef.current = scrollContainerRef.current.scrollTop;
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isMouseDownRef.current || !scrollContainerRef.current) return;
        const dx = e.clientX - startXRef.current;
        const dy = e.clientY - startYRef.current;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasDraggedRef.current = true;
            setIsPanningState(true);
        }
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - dx;
        scrollContainerRef.current.scrollTop = scrollTopRef.current - dy;
    };

    const handleMouseUp = () => {
        isMouseDownRef.current = false;
        setIsPanningState(false);
    };

    return (
        <div
            ref={scrollContainerRef}
            onScroll={onContainerScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-full overflow-auto flex flex-col custom-scrollbar relative select-none ${
                isPanningState ? "cursor-grabbing [&_*]:!cursor-grabbing" : "cursor-grab"
            }`}
        >
            <div className="flex flex-col min-w-max relative">
                {/* Header Row: WITA Corner + Hour Columns (Sticky Top 0) */}
                <div className="sticky top-0 z-30 flex min-w-max border-b border-border bg-background/95 backdrop-blur-md shadow-2xs">
                    {/* Top-Left Corner (Sticky both Top 0 and Left 0) */}
                    <div
                        style={{ width: `${SIDEBAR_WIDTH_PX}px` }}
                        className="sticky left-0 z-40 shrink-0 border-r border-border bg-background px-3 py-2.5 flex items-center justify-center gap-1 font-mono text-xs font-bold text-muted-foreground shadow-[1px_0_0_0_hsl(var(--border))]"
                    >
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Hari & Jam</span>
                    </div>

                    {/* Deretan Header Jam */}
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            style={{ width: `${HOUR_COL_WIDTH_PX}px` }}
                            className="shrink-0 border-r border-border px-2 py-2.5 flex items-center justify-center font-mono text-xs font-bold text-muted-foreground bg-background/50 hover:bg-muted/20 transition-colors"
                        >
                            <span>{String(hour).padStart(2, '0')}:00</span>
                        </div>
                    ))}
                </div>

                {/* Deretan Baris Hari / Tanggal */}
                <div className="flex flex-col min-w-max relative flex-1">
                    {displayDays.map((dateStr) => {
                        const isToday = dateStr === todayStr;
                        const dayEvents = eventsByDate[dateStr] || [];

                        return (
                            <SwappedDayRow
                                key={dateStr}
                                dateStr={dateStr}
                                isToday={isToday}
                                dayEvents={dayEvents}
                                hours={hours}
                                onSelectEvent={onSelectEvent}
                                onSelectOverflow={onSelectOverflow}
                                checkIsDragging={() => hasDraggedRef.current}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
