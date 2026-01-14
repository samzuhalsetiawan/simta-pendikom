"use client"

import { useMemo } from "react";
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { EventCalendarView } from "../event-calendar";

export const useDaysInView = (
   view: EventCalendarView,
   selectedDate: Date,
   currentDate: Date
) => {
   return useMemo(() => {
         if (view === "day") {
            return [{
               name: format(selectedDate, "EEE"), // E.g., "Mon", "Tue"
               date: format(selectedDate, "d"), // Day of month as string, e.g., "1", "2"
               fullDate: selectedDate,
               isToday: isSameDay(selectedDate, new Date()),
               isSelected: true,
               isCurrentMonth: isSameMonth(selectedDate, currentDate)
            }];
         }
   
         if (view === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            return Array.from({ length: 7 }).map((_, i) => {
               const date = addDays(start, i);
               return {
                  name: format(date, "EEE"),
                  date: format(date, "d"),
                  fullDate: date,
                  isToday: isSameDay(date, new Date()),
                  isSelected: isSameDay(date, selectedDate),
                  isCurrentMonth: isSameMonth(date, currentDate)
               };
            });
         }
   
         if (view === "month") {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
            const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
            return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
               name: format(date, "EEE"),
               date: format(date, "d"),
               fullDate: date,
               isToday: isSameDay(date, new Date()),
               isSelected: isSameDay(date, selectedDate),
               isCurrentMonth: isSameMonth(date, currentDate)
            }));
         }
         return [];
      }, [currentDate, selectedDate, view]);
}