"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { Navbar, NavbarUser } from "@/components/navbar";
import { CalendarEventItem } from "@/lib/dal/seminar";
import {
    DEFAULT_EVENT_DURATION_MINUTES,
    CALENDAR_FIRST_LOOK_HOUR,
    HOUR_ROW_HEIGHT_PX,
    MIN_COLUMN_WIDTH_PX,
    MAX_OVERLAP_SPLIT,
    CalendarEventType,
    CalendarViewMode
} from "@/lib/constants/calendar";
import { CalendarEventCard } from "./calendar-event-card";
import { CalendarEventDetailModal } from "./calendar-event-detail-modal";
import { CalendarFilterModal } from "./calendar-filter-modal";
import { CalendarSearchModal } from "./calendar-search-modal";
import { CalendarViewModal } from "./calendar-view-modal";
import { MonthCalendarView } from "./views/month-calendar-view";
import { SwappedMonthCalendarView } from "./views/swapped-month-calendar-view";
import { SwappedDayHourView } from "./views/swapped-day-hour-view";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Input } from "@/components/base/input";
import {
    Calendar as CalendarIcon,
    Filter,
    Clock,
    Search,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Sparkles,
    Check,
    X,
    SlidersHorizontal,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface CalendarLayoutItem {
    key: string;
    event?: CalendarEventItem;
    overflowInfo?: {
        count: number;
        events: CalendarEventItem[];
        onOverflowClick: (events: CalendarEventItem[]) => void;
    };
    style: React.CSSProperties;
}

interface DayColumnHeaderProps {
    dateStr: string;
    isToday: boolean;
    dayEventsCount: number;
}

const DayColumnHeader = React.memo(({ dateStr, isToday, dayEventsCount }: DayColumnHeaderProps) => {
    const dt = useMemo(() => new Date(dateStr), [dateStr]);
    const dayName = dt.toLocaleDateString('id-ID', { weekday: 'long' });
    const dateNum = dt.getDate();
    const monthName = dt.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

    return (
        <div
            style={{ width: `${MIN_COLUMN_WIDTH_PX}px` }}
            className={`shrink-0 border-r border-border px-3 py-2.5 flex flex-col items-center justify-center text-center transition-colors relative ${
                isToday
                    ? 'bg-primary/10 dark:bg-primary/15 font-bold'
                    : 'hover:bg-muted/30'
            }`}
        >
            {isToday && (
                <span className="absolute top-1 right-2 inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-primary text-primary-foreground tracking-wider shadow-2xs">
                    Hari Ini
                </span>
            )}
            <span className={`text-[11px] uppercase tracking-wider font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {dayName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
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
    );
});
DayColumnHeader.displayName = 'DayColumnHeader';

const EMPTY_EVENTS: CalendarEventItem[] = [];

interface DayColumnGridProps {
    dateStr: string;
    isToday: boolean;
    dayEvents: CalendarEventItem[];
    computeLayout: (evts: CalendarEventItem[]) => CalendarLayoutItem[];
    onSelectEvent: (evt: CalendarEventItem) => void;
    onSelectOverflow: (evts: CalendarEventItem[]) => void;
    hours: number[];
    checkIsDragging?: () => boolean;
}

const DayColumnGrid = React.memo(({ dateStr, isToday, dayEvents, computeLayout, onSelectEvent, onSelectOverflow, hours, checkIsDragging }: DayColumnGridProps) => {
    const layoutItems = useMemo(() => computeLayout(dayEvents), [dayEvents, computeLayout]);

    return (
        <div
            style={{ width: `${MIN_COLUMN_WIDTH_PX}px` }}
            className={`shrink-0 border-r border-foreground/5 dark:border-white/5 relative flex flex-col ${
                isToday ? 'bg-primary/5 dark:bg-primary/10' : ''
            }`}
        >
            {/* Baris grid per jam (00:00 - 23:00) */}
            {hours.map((hour) => (
                <div
                    key={hour}
                    style={{ height: `${HOUR_ROW_HEIGHT_PX}px` }}
                    className="border-b border-foreground/5 dark:border-white/5 relative group transition-colors hover:bg-muted/20"
                >
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed border-foreground/5 dark:border-white/5 pointer-events-none" />
                </div>
            ))}

            {/* Render Komponen Agenda / Overflow pada Koordinat Absolut */}
            {layoutItems.map((item) => (
                <CalendarEventCard
                    key={item.key}
                    event={item.event}
                    overflowInfo={item.overflowInfo ? {
                        ...item.overflowInfo,
                        onOverflowClick: onSelectOverflow
                    } : undefined}
                    style={item.style}
                    onClick={item.event ? () => onSelectEvent(item.event!) : undefined}
                    checkIsDragging={checkIsDragging}
                />
            ))}
        </div>
    );
});
DayColumnGrid.displayName = 'DayColumnGrid';

interface KalenderClientViewProps {
    events: CalendarEventItem[];
    currentUser?: NavbarUser | null;
}

export default function KalenderClientView({ events, currentUser }: KalenderClientViewProps) {
    // 1. Filter State
    const [activeTypes, setActiveTypes] = useState<Record<CalendarEventType, boolean>>({
        proposal: true,
        hasil: true,
        pendadaran: true,
        konsultasi: true
    });
    const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [onlyScheduled, setOnlyScheduled] = useState(false);

    const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");

    // 2. Modal State
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [fabExpanded, setFabExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
    const [overflowEvents, setOverflowEvents] = useState<CalendarEventItem[] | null>(null);
    const [viewMode, setViewMode] = useState<CalendarViewMode>('day_hour');
    const [swapAxis, setSwapAxis] = useState<boolean>(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [monthViewDate, setMonthViewDate] = useState<Date>(() => new Date());

    // Shortcut Cmd+K / Ctrl+K untuk membuka pencarian agenda
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchModalOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // 3. Unlimited Day Range State (offset in days relative to anchorDate)
    const [anchorDate, setAnchorDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [dayRange, setDayRange] = useState({ startOffset: -20, endOffset: 40 });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasInitialScrolled = useRef(false);
    const rafLogicRef = useRef<number | null>(null);
    const pendingPrependCorrection = useRef<number | null>(null);
    const pendingPrependCorrectionTop = useRef<number | null>(null);
    const isJumpingRef = useRef(false);

    // Pan & Drag States/Refs for 2D Scrolling
    const [isPanningState, setIsPanningState] = useState(false);
    const isPanningRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const initialScrollLeftRef = useRef(0);
    const initialScrollTopRef = useRef(0);

    // Helper: format YYYY-MM-DD local
    const toDateKey = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = useMemo(() => toDateKey(new Date()), []);

    // 4. Filter all events based on active checkboxes & search
    const filteredEvents = useMemo(() => {
        return events.filter((evt) => {
            const evtType = (evt.seminar_type || 'proposal') as CalendarEventType;
            if (!activeTypes[evtType]) return false;

            if (selectedDateFilter && selectedDateFilter !== "") {
                const evtDay = toDateKey(new Date(evt.scheduled_date));
                if (evtDay !== selectedDateFilter) return false;
            }

            const dayOfWeek = new Date(evt.scheduled_date).getDay();
            if (!activeDays.includes(dayOfWeek)) return false;

            return true;
        });
    }, [events, activeTypes, selectedDateFilter, activeDays]);

    // Group events by date string (YYYY-MM-DD)
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEventItem[]> = {};
        filteredEvents.forEach((evt) => {
            const dKey = toDateKey(new Date(evt.scheduled_date));
            if (!map[dKey]) map[dKey] = [];
            map[dKey].push(evt);
        });
        return map;
    }, [filteredEvents]);

    // 5. Generate Column Days
    const displayDays = useMemo(() => {
        if (onlyScheduled) {
            // Hanya hari yang memiliki jadwal (atau terpilih oleh date picker) dan termasuk dalam activeDays
            const scheduledDates = Object.keys(eventsByDate);
            if (selectedDateFilter && !scheduledDates.includes(selectedDateFilter)) {
                scheduledDates.push(selectedDateFilter);
            }
            // Pastikan hari ini tetap ada agar tombol "Ke Hari Ini" bisa berfungsi
            if (!scheduledDates.includes(todayStr)) {
                scheduledDates.push(todayStr);
            }
            
            const filteredDates = scheduledDates.filter(dateStr => {
                const dateObj = new Date(dateStr);
                return activeDays.includes(dateObj.getDay());
            });
            filteredDates.sort();
            return filteredDates;
        }

        // Mode continuous (Unlimited Scrolling)
        const days: string[] = [];
        const baseDate = selectedDateFilter ? new Date(selectedDateFilter) : anchorDate;
        baseDate.setHours(0, 0, 0, 0);

        for (let offset = dayRange.startOffset; offset <= dayRange.endOffset; offset++) {
            const targetDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
            if (activeDays.includes(targetDate.getDay())) {
                days.push(toDateKey(targetDate));
            }
        }
        return days;
    }, [onlyScheduled, activeDays, dayRange, eventsByDate, todayStr, selectedDateFilter, anchorDate]);

    // 5.5 Scroll to specific event
    const scrollToEventRef = useRef<(evt: CalendarEventItem) => void>(() => {});
    const scrollToFirstLookRef = useRef<(smooth?: boolean) => void>(() => {});

    const scrollToEvent = useCallback((evt: CalendarEventItem) => {
        if (!scrollContainerRef.current || !evt.scheduled_date) return;
        
        const dateObj = new Date(evt.scheduled_date);
        const dateStr = toDateKey(dateObj);
        
        // Ensure the event type is active so it is visible
        const evtType = (evt.seminar_type || 'proposal') as CalendarEventType;
        if (!activeTypes[evtType]) {
            setActiveTypes(prev => ({ ...prev, [evtType]: true }));
            setTimeout(() => scrollToEventRef.current(evt), 100);
            return;
        }

        // Find if date is in current display list
        const dateIndex = displayDays.indexOf(dateStr);
        if (dateIndex === -1) {
            isJumpingRef.current = true;
            if (onlyScheduled) {
                const dayOfWeek = dateObj.getDay();
                if (!activeDays.includes(dayOfWeek)) {
                    setActiveDays(prev => [...prev, dayOfWeek]);
                } else {
                    setOnlyScheduled(false);
                    setAnchorDate(dateObj);
                }
                setTimeout(() => scrollToEventRef.current(evt), 100);
                return;
            } else {
                setAnchorDate(dateObj);
                setDayRange({ startOffset: -20, endOffset: 40 });
                setTimeout(() => scrollToEventRef.current(evt), 100);
                return;
            }
        }

        const targetColumnIndex = Math.max(0, dateIndex - 1);
        const leftPx = targetColumnIndex * MIN_COLUMN_WIDTH_PX;
        
        const hourVal = dateObj.getHours() + dateObj.getMinutes() / 60;
        const topPx = hourVal * HOUR_ROW_HEIGHT_PX;
        const clampedTop = Math.max(0, topPx - 50);

        isJumpingRef.current = true;
        scrollContainerRef.current.scrollTo({
            left: leftPx,
            top: clampedTop,
            behavior: 'smooth'
        });
        setTimeout(() => {
            isJumpingRef.current = false;
        }, 700);
    }, [displayDays, activeTypes, activeDays, onlyScheduled]);
    scrollToEventRef.current = scrollToEvent;

    // 6. First Look Scroll Automator (Horizontal: Hari Ini di kolom kedua; Vertikal: Jam event pertama di layar atau 07:00)
    const scrollToFirstLook = useCallback((smooth = false) => {
        if (!scrollContainerRef.current) return;

        const todayIndex = displayDays.indexOf(todayStr);
        const targetColumnIndex = todayIndex !== -1 ? Math.max(0, todayIndex - 1) : 0;
        const leftPx = targetColumnIndex * MIN_COLUMN_WIDTH_PX;

        // Hitung jam pertama dari event yang terlihat di layar saat ini
        let targetHour = CALENDAR_FIRST_LOOK_HOUR; // default jam 07:00 jika tidak ada event di layar
        const containerWidth = scrollContainerRef.current.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
        const sidebarWidthPx = 80; // lebar sidebar jam
        const availableWidth = Math.max(containerWidth - sidebarWidthPx, MIN_COLUMN_WIDTH_PX);
        const visibleColumnsCount = Math.ceil(availableWidth / MIN_COLUMN_WIDTH_PX);

        const visibleDays = displayDays.slice(targetColumnIndex, targetColumnIndex + visibleColumnsCount);

        let earliestHour: number | null = null;
        for (const dKey of visibleDays) {
            const dayEvents = eventsByDate[dKey] || [];
            for (const evt of dayEvents) {
                if (evt.scheduled_date) {
                    const dt = new Date(evt.scheduled_date);
                    const hourVal = dt.getHours() + dt.getMinutes() / 60;
                    if (earliestHour === null || hourVal < earliestHour) {
                        earliestHour = hourVal;
                    }
                }
            }
        }

        if (earliestHour !== null) {
            // Scroll ke jam event tersebut (dibulatkan ke jam terdekat ke bawah agar pas dengan garis jam)
            targetHour = Math.floor(earliestHour);
        }

        const topPx = targetHour * HOUR_ROW_HEIGHT_PX;

        scrollContainerRef.current.scrollTo({
            top: topPx,
            left: leftPx,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }, [displayDays, todayStr, eventsByDate]);
    scrollToFirstLookRef.current = scrollToFirstLook;

    const jumpToToday = useCallback((smooth = true) => {
        isJumpingRef.current = true;
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setAnchorDate(d);
        setMonthViewDate(d);
        setDayRange({ startOffset: -20, endOffset: 40 });
        setSelectedDateFilter("");
        setTimeout(() => {
            scrollToFirstLookRef.current(smooth);
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 700);
        }, 80);
    }, []);

    useEffect(() => {
        if (!hasInitialScrolled.current && displayDays.length > 0) {
            hasInitialScrolled.current = true;
            setTimeout(() => {
                scrollToFirstLook(false);
            }, 80);
        }
    }, [displayDays, scrollToFirstLook]);

    // 7a. Asynchronous Prepend Correction (useLayoutEffect runs precisely after DOM mutation, before paint)
    useLayoutEffect(() => {
        if (pendingPrependCorrection.current !== null && pendingPrependCorrection.current > 0) {
            const addedPx = pendingPrependCorrection.current;
            pendingPrependCorrection.current = null;
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft += addedPx;
            }
        }
        if (pendingPrependCorrectionTop.current !== null && pendingPrependCorrectionTop.current > 0) {
            const addedPx = pendingPrependCorrectionTop.current;
            pendingPrependCorrectionTop.current = null;
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop += addedPx;
            }
        }
    }, [dayRange.startOffset]);

    // 7b. Throttled & RAF-synchronized Unlimited Horizontal/Vertical Scroll Handler
    const evaluateInfiniteScroll = useCallback((target: HTMLDivElement) => {
        if (onlyScheduled || isJumpingRef.current) return;

        if (swapAxis) {
            const scrollTop = target.scrollTop;
            const maxScroll = target.scrollHeight - target.clientHeight;

            if (scrollTop < 350) {
                pendingPrependCorrectionTop.current = 20 * 100; // 100px adalah tinggi MIN_ROW_HEIGHT_PX di SwappedDayHourView
                setDayRange((prev) => ({
                    startOffset: prev.startOffset - 20,
                    endOffset: prev.endOffset
                }));
            }
            else if (maxScroll - scrollTop < 350) {
                setDayRange((prev) => ({
                    startOffset: prev.startOffset,
                    endOffset: prev.endOffset + 20
                }));
            }
        } else {
            const scrollLeft = target.scrollLeft;
            const maxScroll = target.scrollWidth - target.clientWidth;

            if (scrollLeft < 350) {
                pendingPrependCorrection.current = 20 * MIN_COLUMN_WIDTH_PX;
                setDayRange((prev) => ({
                    startOffset: prev.startOffset - 20,
                    endOffset: prev.endOffset
                }));
            }
            else if (maxScroll - scrollLeft < 350) {
                setDayRange((prev) => ({
                    startOffset: prev.startOffset,
                    endOffset: prev.endOffset + 20
                }));
            }
        }
    }, [onlyScheduled, swapAxis]);

    const handleContainerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (!rafLogicRef.current) {
            rafLogicRef.current = requestAnimationFrame(() => {
                rafLogicRef.current = null;
                evaluateInfiniteScroll(target);
            });
        }
    }, [evaluateInfiniteScroll]);

    // 7c. Click & Drag 2D Panning Engine (Desktop & Mobile Touch)
    const checkIsDragging = useCallback(() => {
        return hasDraggedRef.current;
    }, []);

    const handleWindowMouseMove = useCallback((e: MouseEvent) => {
        if (!isPanningRef.current || !scrollContainerRef.current) return;
        const dx = e.clientX - startXRef.current;
        const dy = e.clientY - startYRef.current;
        if (Math.hypot(dx, dy) > 5) {
            hasDraggedRef.current = true;
        }
        scrollContainerRef.current.scrollLeft = initialScrollLeftRef.current - dx;
        scrollContainerRef.current.scrollTop = initialScrollTopRef.current - dy;
    }, []);

    const handleWindowMouseUp = useCallback(() => {
        if (!isPanningRef.current) return;
        isPanningRef.current = false;
        setIsPanningState(false);
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
        setTimeout(() => {
            hasDraggedRef.current = false;
        }, 50);
    }, [handleWindowMouseMove]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0 || !scrollContainerRef.current) return;
        isPanningRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        initialScrollLeftRef.current = scrollContainerRef.current.scrollLeft;
        initialScrollTopRef.current = scrollContainerRef.current.scrollTop;
        setIsPanningState(true);
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    }, [handleWindowMouseMove, handleWindowMouseUp]);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 1 && scrollContainerRef.current) {
            startXRef.current = e.touches[0].clientX;
            startYRef.current = e.touches[0].clientY;
            hasDraggedRef.current = false;
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 1) {
            const dx = e.touches[0].clientX - startXRef.current;
            const dy = e.touches[0].clientY - startYRef.current;
            if (Math.hypot(dx, dy) > 5) {
                hasDraggedRef.current = true;
            }
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (hasDraggedRef.current) {
            setTimeout(() => {
                hasDraggedRef.current = false;
            }, 50);
        }
    }, []);

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [handleWindowMouseMove, handleWindowMouseUp]);

    // 8. Overlap & Collision Detection Engine per Day Column
    // Menghasilkan daftar cluster/posisi rendering untuk setiap event dalam satu hari
    const computeDayEventsLayout = useCallback((dayEvents: CalendarEventItem[]): CalendarLayoutItem[] => {
        if (!dayEvents || dayEvents.length === 0) return [];

        // Urutkan berdasarkan waktu mulai
        const sorted = [...dayEvents].sort((a, b) =>
            new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
        );

        // Bentuk cluster event yang bertumpuk (overlapping)
        const clusters: CalendarEventItem[][] = [];
        let currentCluster: CalendarEventItem[] = [];
        let clusterEndTime = -1;

        sorted.forEach((evt) => {
            const startMs = new Date(evt.scheduled_date).getTime();
            const endMs = startMs + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000;

            if (currentCluster.length === 0 || startMs < clusterEndTime) {
                currentCluster.push(evt);
                clusterEndTime = Math.max(clusterEndTime, endMs);
            } else {
                clusters.push(currentCluster);
                currentCluster = [evt];
                clusterEndTime = endMs;
            }
        });
        if (currentCluster.length > 0) clusters.push(currentCluster);

        // Tentukan posisi visual per cluster (maksimal split = 2 sesuai permintaan user)
        const renderItems: CalendarLayoutItem[] = [];

        clusters.forEach((cluster, clusterIndex) => {
            const totalInCluster = cluster.length;

            if (totalInCluster === 1) {
                const evt = cluster[0];
                const dt = new Date(evt.scheduled_date);
                const hours = dt.getHours();
                const minutes = dt.getMinutes();
                const topPx = (hours + minutes / 60) * HOUR_ROW_HEIGHT_PX;
                const heightPx = (DEFAULT_EVENT_DURATION_MINUTES / 60) * HOUR_ROW_HEIGHT_PX;

                renderItems.push({
                    event: evt,
                    key: evt.id,
                    style: {
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        left: '0px',
                        width: '100%'
                    }
                });
            } else if (totalInCluster === 2) {
                cluster.forEach((evt, idx) => {
                    const dt = new Date(evt.scheduled_date);
                    const hours = dt.getHours();
                    const minutes = dt.getMinutes();
                    const topPx = (hours + minutes / 60) * HOUR_ROW_HEIGHT_PX;
                    const heightPx = (DEFAULT_EVENT_DURATION_MINUTES / 60) * HOUR_ROW_HEIGHT_PX;

                    const leftPct = idx === 0 ? '0%' : '50%';
                    const widthPct = '50%';

                    renderItems.push({
                        event: evt,
                        key: `${evt.id}-split-${idx}`,
                        style: {
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            left: leftPct,
                            width: widthPct
                        }
                    });
                });
            } else {
                const firstEvt = cluster[0];
                const dt = new Date(firstEvt.scheduled_date);
                const hours = dt.getHours();
                const minutes = dt.getMinutes();
                const topPx = (hours + minutes / 60) * HOUR_ROW_HEIGHT_PX;
                const heightPx = (DEFAULT_EVENT_DURATION_MINUTES / 60) * HOUR_ROW_HEIGHT_PX;

                // Event pertama di kiri
                renderItems.push({
                    event: firstEvt,
                    key: firstEvt.id,
                    style: {
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        left: '0%',
                        width: '50%'
                    }
                });

                // Badge overflow di kanan
                const overflowList = cluster.slice(1);
                renderItems.push({
                    key: `overflow-cluster-${clusterIndex}`,
                    overflowInfo: {
                        count: overflowList.length,
                        events: overflowList,
                        onOverflowClick: (evts) => handleSelectOverflow(evts)
                    },
                    style: {
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        left: '50%',
                        width: '50%'
                    }
                });
            }
        });

        return renderItems;
    }, []);

    const handleSelectEvent = useCallback((evt: CalendarEventItem) => {
        setSelectedEvent(evt);
        setOverflowEvents(null);
        setModalOpen(true);
    }, []);

    const handleSelectOverflow = useCallback((evts: CalendarEventItem[]) => {
        setSelectedEvent(null);
        setOverflowEvents(evts);
        setModalOpen(true);
    }, []);

    // Jam 00:00 sampai 23:00
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    const hasActiveFilters = 
        !activeTypes.proposal || 
        !activeTypes.hasil || 
        !activeTypes.pendadaran || 
        activeDays.length < 7 || 
        selectedDateFilter !== "";

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* Desktop Navigation Toolbar */}
            <div className="hidden md:flex items-center justify-between px-6 py-2 border-b border-border bg-card/70 backdrop-blur-md shrink-0 shadow-2xs z-20">
                <div className="flex items-center gap-2.5">
                    {/* Tombol Ke Hari Ini */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => jumpToToday(true)}
                        className="h-8 px-3 rounded-xl font-bold text-xs gap-1.5 border-border/80 hover:bg-muted/80 shadow-2xs"
                    >
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        <span>Hari Ini</span>
                    </Button>

                    <div className="h-4 w-px bg-border/60 mx-1" />

                    {/* Mode Tampilan (Bulan vs Jam & Hari) */}
                    <div className="flex items-center bg-muted/80 p-0.5 rounded-xl border border-border/60 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('month')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                viewMode === 'month'
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Bulan</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('day_hour')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                viewMode === 'day_hour'
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Jam & Hari</span>
                        </button>
                    </div>

                    {/* Tombol Tukar Sumbu jika di mode Jam & Hari */}
                    {viewMode === 'day_hour' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSwapAxis(!swapAxis)}
                            title={swapAxis ? "Tampilan Kolom Hari (Default)" : "Tampilan Baris Hari"}
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            <span>{swapAxis ? "Sumbu: Baris" : "Sumbu: Kolom"}</span>
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Tombol Search Agenda */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchModalOpen(true)}
                        className="h-8 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground border-border/80 bg-background/50 hover:bg-muted/80 gap-2 shadow-2xs"
                    >
                        <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Cari Agenda...</span>
                        <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono bg-muted rounded border border-border/80 text-muted-foreground font-semibold">
                            ⌘K
                        </kbd>
                    </Button>

                    {/* Tombol Filter */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterModalOpen(true)}
                        className={cn(
                            "h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-border/80 transition-all shadow-2xs",
                            hasActiveFilters
                                ? "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
                                : "text-foreground hover:bg-muted/80"
                        )}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filter</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </Button>

                    {/* Tombol Pengaturan Tampilan Lainnya */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewModalOpen(true)}
                        title="Pengaturan Tampilan Kalender"
                        className="h-8 w-8 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 shadow-2xs"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <main className="flex-1 flex flex-col w-full relative select-none bg-background overflow-hidden">
                {viewMode === 'day_hour' ? (
                    swapAxis ? (
                        <SwappedDayHourView
                            displayDays={displayDays}
                            hours={hours}
                            eventsByDate={eventsByDate}
                            todayStr={todayStr}
                            onSelectEvent={handleSelectEvent}
                            onSelectOverflow={handleSelectOverflow}
                            checkIsDragging={checkIsDragging}
                            scrollContainerRef={scrollContainerRef}
                            onContainerScroll={handleContainerScroll}
                        />
                    ) : (
                    /* Unified Calendar Scroll Container (Handles both Horizontal & Vertical scrolling below Navbar) */
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleContainerScroll}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{ touchAction: 'pan-x pan-y' }}
                        className={`w-full h-full overflow-auto flex flex-col custom-scrollbar relative select-none ${
                            isPanningState ? "cursor-grabbing [&_*]:!cursor-grabbing" : "cursor-grab"
                        }`}
                    >
                        <div className="flex flex-col min-w-max relative">
                            {/* Header Row: WITA Corner + Day Header Columns (Sticky Top 0 relative to scroll container) */}
                            <div className="sticky top-0 z-30 flex min-w-max border-b border-border bg-background/95 backdrop-blur-md shadow-2xs">
                                {/* Top-Left Corner: WITA Clock (Sticky both Top 0 and Left 0 inside container) */}
                                <div className="sticky left-0 z-40 w-16 sm:w-20 shrink-0 border-r border-border bg-background flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold text-muted-foreground shadow-[1px_0_0_0_hsl(var(--border))]">
                                    <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                                    <span>WITA</span>
                                </div>

                                {/* Deretan Header Hari/Tanggal */}
                                {displayDays.map((dateStr) => (
                                    <DayColumnHeader
                                        key={dateStr}
                                        dateStr={dateStr}
                                        isToday={dateStr === todayStr}
                                        dayEventsCount={eventsByDate[dateStr]?.length || 0}
                                    />
                                ))}
                            </div>

                            {/* Body Grid Row: Hours Sidebar + Day Grid Columns */}
                            <div className="flex min-w-max relative flex-1">
                                {/* Left Column: Hours 00:00 - 23:00 (Sticky Left 0) */}
                                <div className="sticky left-0 z-20 w-16 sm:w-20 shrink-0 border-r border-border bg-background flex flex-col shadow-[1px_0_0_0_hsl(var(--border))]">
                                    {hours.map((hour) => (
                                        <div
                                            key={hour}
                                            style={{ height: `${HOUR_ROW_HEIGHT_PX}px` }}
                                            className="border-b border-foreground/5 dark:border-white/5 flex items-start justify-center pt-2 text-[11px] sm:text-xs font-mono font-bold text-muted-foreground select-none relative"
                                        >
                                            <span>{String(hour).padStart(2, '0')}:00</span>
                                            {/* Garis setengah jam di sidebar */}
                                            <span className="absolute top-1/2 left-4 right-4 h-[1px] border-t border-dotted border-foreground/10" />
                                        </div>
                                    ))}
                                </div>

                                {/* Deretan Kolom Hari & Area Grid Jam */}
                                <div className="flex relative min-w-max flex-1">
                                    {displayDays.map((dateStr) => {
                                        const isToday = dateStr === todayStr;
                                        const dayEvents = eventsByDate[dateStr] || EMPTY_EVENTS;

                                        return (
                                            <DayColumnGrid
                                                key={dateStr}
                                                dateStr={dateStr}
                                                isToday={isToday}
                                                dayEvents={dayEvents}
                                                computeLayout={computeDayEventsLayout}
                                                onSelectEvent={handleSelectEvent}
                                                onSelectOverflow={handleSelectOverflow}
                                                hours={hours}
                                                checkIsDragging={checkIsDragging}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    )
                ) : swapAxis ? (
                    <SwappedMonthCalendarView
                        currentMonthDate={monthViewDate}
                        onChangeMonthDate={setMonthViewDate}
                        eventsByDate={eventsByDate}
                        activeDays={activeDays}
                        onSelectEvent={handleSelectEvent}
                        onSelectOverflow={handleSelectOverflow}
                        todayStr={todayStr}
                    />
                ) : (
                    <MonthCalendarView
                        currentMonthDate={monthViewDate}
                        onChangeMonthDate={setMonthViewDate}
                        eventsByDate={eventsByDate}
                        activeDays={activeDays}
                        onSelectEvent={handleSelectEvent}
                        onSelectOverflow={handleSelectOverflow}
                        todayStr={todayStr}
                    />
                )}

                {/* Backdrop Overlay when FAB Menu is Expanded (Mobile only) */}
                {fabExpanded && (
                    <div
                        className="md:hidden fixed inset-0 z-30 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in"
                        onClick={() => setFabExpanded(false)}
                    />
                )}

                {/* Floating Action Button Menu (Mobile only, desktop uses top toolbar) */}
                <div className="md:hidden fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
                    {/* 3 Mini FABs when Expanded */}
                    {fabExpanded && (
                        <div className="flex flex-col items-end gap-3 mb-1 animate-in fade-in slide-in-from-bottom-4 duration-200">
                            {/* 1. Mini FAB: Jump to Current Date */}
                            <div className="flex items-center gap-2 group">
                                <span
                                    onClick={() => {
                                        jumpToToday(true);
                                        setFabExpanded(false);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-popover text-popover-foreground shadow-md border border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors"
                                >
                                    Ke Hari Ini
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        jumpToToday(true);
                                        setFabExpanded(false);
                                    }}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg border border-border/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    title="Jump to Current Date"
                                >
                                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* 2. Mini FAB: View Mode (Tampilan) */}
                            <div className="flex items-center gap-2 group">
                                <span
                                    onClick={() => {
                                        setViewModalOpen(true);
                                        setFabExpanded(false);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-popover text-popover-foreground shadow-md border border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors"
                                >
                                    Tampilan
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewModalOpen(true);
                                        setFabExpanded(false);
                                    }}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg border border-border/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    title="Tampilan Kalender"
                                >
                                    <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* 3. Mini FAB: Search */}
                            <div className="flex items-center gap-2 group">
                                <span
                                    onClick={() => {
                                        setSearchModalOpen(true);
                                        setFabExpanded(false);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-popover text-popover-foreground shadow-md border border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors"
                                >
                                    Cari
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchModalOpen(true);
                                        setFabExpanded(false);
                                    }}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg border border-border/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
                                    title="Search Agenda"
                                >
                                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* 3. Mini FAB: Filter */}
                            <div className="flex items-center gap-2 group">
                                <span
                                    onClick={() => {
                                        setFilterModalOpen(true);
                                        setFabExpanded(false);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-popover text-popover-foreground shadow-md border border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors"
                                >
                                    Filter
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilterModalOpen(true);
                                        setFabExpanded(false);
                                    }}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg border border-border/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
                                    title="Filter Agenda"
                                >
                                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {(
                                        !activeTypes.proposal ||
                                        !activeTypes.hasil ||
                                        !activeTypes.pendadaran ||
                                        onlyScheduled ||
                                        activeDays.length < 7 ||
                                        selectedDateFilter !== ""
                                    ) && (
                                        <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-destructive border border-background" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Floating Action Button */}
                    <button
                        type="button"
                        onClick={() => setFabExpanded((prev) => !prev)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer relative bg-primary text-primary-foreground ${
                            fabExpanded ? 'rotate-90' : ''
                        }`}
                        title={fabExpanded ? "Tutup Menu" : "Menu Aksi Kalender"}
                    >
                        {fabExpanded ? (
                            <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />
                        ) : (
                            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />
                        )}
                        {!fabExpanded && (
                            !activeTypes.proposal ||
                            !activeTypes.hasil ||
                            !activeTypes.pendadaran ||
                            onlyScheduled ||
                            activeDays.length < 7 ||
                            selectedDateFilter !== ""
                        ) && (
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-destructive border-2 border-background" />
                        )}
                    </button>
                </div>

                {/* Modal Detail Event / Overflow List */}
                <CalendarEventDetailModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    selectedEvent={selectedEvent}
                    overflowEvents={overflowEvents}
                    onSelectFromOverflow={(evt) => {
                        setSelectedEvent(evt);
                    }}
                    onBackToOverflow={
                        selectedEvent && overflowEvents && overflowEvents.length > 0
                            ? () => setSelectedEvent(null)
                            : undefined
                    }
                />

                {/* Modal Filter Kalender */}
                <CalendarFilterModal
                    open={filterModalOpen}
                    onOpenChange={setFilterModalOpen}
                    activeTypes={activeTypes}
                    onChangeActiveTypes={setActiveTypes}
                    activeDays={activeDays}
                    onChangeActiveDays={setActiveDays}
                    onlyScheduled={onlyScheduled}
                    onChangeOnlyScheduled={setOnlyScheduled}
                    selectedDateFilter={selectedDateFilter}
                    onChangeSelectedDateFilter={setSelectedDateFilter}
                    onJumpToTodayAnd7Am={() => jumpToToday(true)}
                    onResetAllFilters={() => {
                        setActiveTypes({ proposal: true, hasil: true, pendadaran: true, konsultasi: true });
                        setActiveDays([0, 1, 2, 3, 4, 5, 6]);
                        setOnlyScheduled(false);
                        setSelectedDateFilter("");
                        const d = new Date();
                        d.setHours(0, 0, 0, 0);
                        setAnchorDate(d);
                        setDayRange({ startOffset: -20, endOffset: 40 });
                    }}
                    totalFilteredCount={filteredEvents.length}
                    totalEventsCount={events.length}
                />

                {/* Modal Cari Agenda */}
                <CalendarSearchModal
                    open={searchModalOpen}
                    onOpenChange={setSearchModalOpen}
                    events={filteredEvents}
                    hasActiveFilters={hasActiveFilters}
                    onSelectEvent={(evt) => {
                        setSearchModalOpen(false);
                        // Optional slight delay so modal close animates smoothly before scrolling
                        setTimeout(() => {
                            scrollToEvent(evt);
                        }, 150);
                    }}
                />

                {/* Modal Pemilihan Mode Tampilan */}
                <CalendarViewModal
                    open={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    swapAxis={swapAxis}
                    onChangeSwapAxis={setSwapAxis}
                />
            </main>
        </div>
    );
}
