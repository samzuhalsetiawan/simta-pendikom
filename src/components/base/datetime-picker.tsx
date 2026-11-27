"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Popover } from "radix-ui";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";

import {
    INDO_MONTHS,
    INDO_DAYS,
    INDO_DAYS_FULL,
    formatIndoDateTime,
    formatIndoDate,
    parseIndoDateTime,
    parseIndoDate,
    toIsoDateTime,
    toMySQLDateTime
} from "@/lib/utils/datetime";

export {
    INDO_MONTHS,
    INDO_DAYS,
    INDO_DAYS_FULL,
    formatIndoDateTime,
    formatIndoDate,
    parseIndoDateTime,
    parseIndoDate,
    toIsoDateTime,
    toMySQLDateTime
};

export interface DateTimePickerProps {
    id?: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    mode?: "datetime" | "date";
    onChange?: (formattedValue: string, isoValue: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function parseDateOnly(val: string): Date | null {
    return parseIndoDate(val);
}

export function formatDateOnly(date: Date): string {
    return formatIndoDate(date);
}

export function toIsoDateOnly(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export function DateTimePicker({
    id,
    name,
    value,
    defaultValue,
    mode = "datetime",
    onChange,
    placeholder,
    disabled = false,
    required = false,
    className
}: DateTimePickerProps) {
    const isDateOnly = mode === "date";
    const defaultPlaceholder = isDateOnly ? "Pilih tanggal..." : "Rabu 31 Maret 2023 16:00";
    const effectivePlaceholder = placeholder || defaultPlaceholder;

    const [open, setOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Ensure Popover is always fully visible in viewport by dynamically shifting it
    useEffect(() => {
        if (!open) return;

        const adjustPosition = () => {
            const content = contentRef.current;
            if (!content) return;

            content.style.transform = 'none'; // reset previous adjustments
            const rect = content.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            if (rect.bottom > viewportHeight - 20) {
                // If overflowing bottom, shift up
                const overflow = rect.bottom - (viewportHeight - 20);
                content.style.transform = `translateY(-${overflow}px)`;
            } else if (rect.top < 20) {
                // If overflowing top, shift down
                const overflow = 20 - rect.top;
                content.style.transform = `translateY(${overflow}px)`;
            }
        };

        // Radix positions elements asynchronously, so we wait for the next frames
        const timeout1 = setTimeout(adjustPosition, 0);
        const timeout2 = setTimeout(adjustPosition, 50);
        
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            if (contentRef.current) contentRef.current.style.transform = 'none';
        };
    }, [open]);

    // Initial internal date parsed from value or defaultValue or null
    const initialDate = useMemo(() => {
        const val = value !== undefined ? value : defaultValue;
        if (!val) return null;
        return isDateOnly ? parseDateOnly(val) : parseIndoDateTime(val);
    }, [value, defaultValue, isDateOnly]);

    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);

    // Calendar view state (which month/year is currently being viewed)
    const [viewYear, setViewYear] = useState<number>(() => (initialDate ? initialDate.getFullYear() : new Date().getFullYear()));
    const [viewMonth, setViewMonth] = useState<number>(() => (initialDate ? initialDate.getMonth() : new Date().getMonth()));

    // Temporary time state inside picker
    const [hours, setHours] = useState<number>(() => (initialDate ? initialDate.getHours() : 9));
    const [minutes, setMinutes] = useState<number>(() => (initialDate ? initialDate.getMinutes() : 0));

    // Synchronize when controlled value changes externally
    useEffect(() => {
        if (value !== undefined) {
            const parsed = isDateOnly ? parseDateOnly(value) : parseIndoDateTime(value);
            setSelectedDate(parsed);
            if (parsed) {
                setViewYear(parsed.getFullYear());
                setViewMonth(parsed.getMonth());
                setHours(parsed.getHours());
                setMinutes(parsed.getMinutes());
            }
        }
    }, [value, isDateOnly]);

    const displayValue = useMemo(() => {
        if (value !== undefined && value !== "") {
            const parsed = isDateOnly ? parseDateOnly(value) : parseIndoDateTime(value);
            if (parsed) {
                return isDateOnly ? formatDateOnly(parsed) : formatIndoDateTime(parsed);
            }
            return value;
        }
        if (selectedDate) {
            return isDateOnly ? formatDateOnly(selectedDate) : formatIndoDateTime(selectedDate);
        }
        return "";
    }, [value, selectedDate, isDateOnly]);

    // Handle selecting a specific day
    const handleSelectDay = (day: number) => {
        const newDate = new Date(viewYear, viewMonth, day, isDateOnly ? 0 : hours, isDateOnly ? 0 : minutes);
        setSelectedDate(newDate);
        const formatted = isDateOnly ? formatDateOnly(newDate) : formatIndoDateTime(newDate);
        const iso = isDateOnly ? toIsoDateOnly(newDate) : toIsoDateTime(newDate);
        onChange?.(formatted, iso);
        if (isDateOnly) {
            setOpen(false);
        }
    };

    // Handle updating time
    const handleTimeChange = (newHours: number, newMinutes: number) => {
        setHours(newHours);
        setMinutes(newMinutes);
        if (selectedDate) {
            const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), newHours, newMinutes);
            setSelectedDate(newDate);
            const formatted = formatIndoDateTime(newDate);
            const iso = toIsoDateTime(newDate);
            onChange?.(formatted, iso);
        } else {
            // Default to today if no date is yet chosen
            const today = new Date();
            const newDate = new Date(viewYear, viewMonth, today.getDate(), newHours, newMinutes);
            setSelectedDate(newDate);
            const formatted = formatIndoDateTime(newDate);
            const iso = toIsoDateTime(newDate);
            onChange?.(formatted, iso);
        }
    };

    // Quick select presets
    const handleSetToday = () => {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        if (!isDateOnly) {
            setHours(now.getHours());
            setMinutes(now.getMinutes());
        }
        setSelectedDate(now);
        const formatted = isDateOnly ? formatDateOnly(now) : formatIndoDateTime(now);
        const iso = isDateOnly ? toIsoDateOnly(now) : toIsoDateTime(now);
        onChange?.(formatted, iso);
        if (isDateOnly) {
            setOpen(false);
        }
    };

    // Calendar grid calculations
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells: { day: number; isCurrentMonth: boolean; dateObj: Date }[] = [];

        // Previous month trailing days
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            cells.push({
                day: d,
                isCurrentMonth: false,
                dateObj: new Date(viewYear, viewMonth - 1, d)
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({
                day: d,
                isCurrentMonth: true,
                dateObj: new Date(viewYear, viewMonth, d)
            });
        }

        // Next month leading days to complete rows (multiples of 7)
        const remainingCells = (7 - (cells.length % 7)) % 7;
        for (let d = 1; d <= remainingCells; d++) {
            cells.push({
                day: d,
                isCurrentMonth: false,
                dateObj: new Date(viewYear, viewMonth + 1, d)
            });
        }

        return cells;
    }, [viewYear, viewMonth]);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    // Quick time chips for seminars
    const timePresets = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

    const isSelectedDay = (dateObj: Date) => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === dateObj.getDate() &&
            selectedDate.getMonth() === dateObj.getMonth() &&
            selectedDate.getFullYear() === dateObj.getFullYear()
        );
    };

    const isToday = (dateObj: Date) => {
        const today = new Date();
        return (
            today.getDate() === dateObj.getDate() &&
            today.getMonth() === dateObj.getMonth() &&
            today.getFullYear() === dateObj.getFullYear()
        );
    };

    // Available years for quick selector (e.g. current year - 3 to current year + 4)
    const currentYearNum = new Date().getFullYear();
    const availableYears = useMemo(() => {
        const years: number[] = [];
        for (let y = currentYearNum - 3; y <= currentYearNum + 4; y++) {
            years.push(y);
        }
        return years;
    }, [currentYearNum]);

    return (
        <div className="relative w-full">
            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={displayValue} required={required} />}

            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        className={cn(
                            "w-full h-10 px-3 flex items-center justify-between text-left",
                            "rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted",
                            "shadow-none focus:outline-none focus:border-primary transition-colors text-xs cursor-pointer",
                            disabled && "opacity-50 cursor-not-allowed",
                            className
                        )}
                    >
                        <span className={cn(displayValue ? "text-foreground font-medium" : "text-muted-foreground")}>
                            {displayValue || effectivePlaceholder}
                        </span>
                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {!isDateOnly && <Clock className="h-3.5 w-3.5" />}
                        </div>
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        ref={contentRef}
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        collisionPadding={20}
                        className={cn(
                            "z-[200] w-[320px] sm:w-[340px] p-4 rounded-xl border border-border/80 shadow-2xl",
                            "bg-popover text-popover-foreground outline-none",
                            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                            "select-none text-left"
                        )}
                    >
                        {/* Month & Year Navigation Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                aria-label="Bulan sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                {/* Month Selector */}
                                <select
                                    value={viewMonth}
                                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                                    className="bg-transparent font-bold cursor-pointer hover:text-primary focus:outline-none text-xs pr-1"
                                >
                                    {INDO_MONTHS.map((m, idx) => (
                                        <option key={m} value={idx} className="bg-popover text-foreground">
                                            {m}
                                        </option>
                                    ))}
                                </select>

                                {/* Year Selector */}
                                <select
                                    value={viewYear}
                                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                                    className="bg-transparent font-bold cursor-pointer hover:text-primary focus:outline-none text-xs"
                                >
                                    {availableYears.map((y) => (
                                        <option key={y} value={y} className="bg-popover text-foreground">
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                aria-label="Bulan berikutnya"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-[10px] font-semibold text-muted-foreground">
                            {INDO_DAYS.map((day) => (
                                <div key={day} className="py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Day Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {calendarDays.map((cell, idx) => {
                                const isSelected = isSelectedDay(cell.dateObj);
                                const today = isToday(cell.dateObj);

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            if (!cell.isCurrentMonth) {
                                                setViewMonth(cell.dateObj.getMonth());
                                                setViewYear(cell.dateObj.getFullYear());
                                            }
                                            handleSelectDay(cell.day);
                                        }}
                                        className={cn(
                                            "h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer",
                                            !cell.isCurrentMonth && "text-muted-foreground/40",
                                            cell.isCurrentMonth && !isSelected && "text-foreground hover:bg-muted",
                                            today && !isSelected && "border border-primary/50 text-primary font-bold",
                                            isSelected && "bg-primary text-primary-foreground font-bold shadow-sm"
                                        )}
                                    >
                                        {cell.day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time Picker Section - only for datetime mode */}
                        {!isDateOnly && (
                            <div className="mt-3 pt-3 border-t border-border/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-foreground">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        Waktu (24 Jam)
                                    </span>
                                    <div className="flex items-center gap-1 bg-muted/80 px-2 py-0.5 rounded-lg border border-border/50">
                                        {/* Jam */}
                                        <select
                                            value={hours}
                                            onChange={(e) => handleTimeChange(parseInt(e.target.value, 10), minutes)}
                                            className="bg-transparent font-bold text-xs cursor-pointer focus:outline-none"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                                                <option key={h} value={h} className="bg-popover text-foreground">
                                                    {String(h).padStart(2, "0")}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="font-bold text-xs">:</span>
                                        {/* Menit */}
                                        <select
                                            value={minutes}
                                            onChange={(e) => handleTimeChange(hours, parseInt(e.target.value, 10))}
                                            className="bg-transparent font-bold text-xs cursor-pointer focus:outline-none"
                                        >
                                            {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                                <option key={m} value={m} className="bg-popover text-foreground">
                                                    {String(m).padStart(2, "0")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Quick Time Presets */}
                                <div className="flex flex-wrap gap-1">
                                    {timePresets.map((t) => {
                                        const [hStr, mStr] = t.split(":");
                                        const hNum = parseInt(hStr, 10);
                                        const mNum = parseInt(mStr, 10);
                                        const isActive = hours === hNum && minutes === mNum;

                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => handleTimeChange(hNum, mNum)}
                                                className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer border",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleSetToday}
                                className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                            >
                                {isDateOnly ? "Hari Ini" : "Hari Ini & Sekarang"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                                {isDateOnly ? "Tutup" : "Selesai"}
                            </button>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}

export function DatePicker(props: Omit<DateTimePickerProps, "mode">) {
    return <DateTimePicker {...props} mode="date" />;
}
