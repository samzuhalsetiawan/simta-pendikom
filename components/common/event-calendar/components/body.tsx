"use client"

import { useEventData } from "@/hooks/data-fetcher/event";
import { EventCalendarView } from "../event-calendar";
import { useDaysInView } from "../hooks/days-in-view";
import { Fragment, useEffect, useMemo } from "react";
import { endOfISOWeek, endOfMonth, endOfWeek, isSameDay, startOfISOWeek, startOfMonth, startOfWeek } from "date-fns";
import { Event, EventType } from "@/types/event/event";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

export const getEventStyle = (type: EventType) => {
   switch (type) {
      case "seminar_proposal":
         return "bg-blue-100 border-l-4 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-blue-600";
      case "seminar_hasil":
         return "bg-purple-100 border-l-4 border-purple-500 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-purple-600";
      case "pendadaran":
         return "bg-pink-100 border-l-4 border-pink-500 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200 border-pink-600";
      case "konsultasi":
         return "bg-orange-100 border-l-4 border-orange-500 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200 border-orange-600";
      default:
         return "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200 border-yellow-600";
   }
}

type EventCalendarBodyProps = {
   initialEvents?: Event[];
   view: EventCalendarView;
   currentDate: Date;
   selectedDate: Date;
   daysInView: ReturnType<typeof useDaysInView>;
   onHourInDayClick?: (data: { date: Date, events: Event[] }) => void;
   onDayInMonthClick?: (data: { date: Date, events: Event[] }) => void;
}

export function EventCalendarBody({
   initialEvents,
   view,
   currentDate,
   selectedDate,
   daysInView,
   onHourInDayClick,
   onDayInMonthClick
}: EventCalendarBodyProps) {

   const { startDate, endDate } = useMemo(() => {
      switch (view) {
         case "day":
            return {
               startDate: currentDate,
               endDate: currentDate
            }
         case "week":
            return {
               startDate: startOfISOWeek<Date>(currentDate),
               endDate: endOfISOWeek<Date>(currentDate)
            }
         case "month":
            return {
               startDate: startOfMonth<Date>(currentDate),
               endDate: endOfMonth<Date>(currentDate)
            }
      }
   }, [view, currentDate]);

   const { events: rawEvents, isLoading, isError } = useEventData(startDate, endDate, {
      suspense: true,
      fallbackData: initialEvents
   })

   const events = rawEvents || [];

   return (
      <>
         {view === 'month' ? (
            <div className="grid grid-cols-7 auto-rows-[100px]">
               {daysInView.map((day, idx) => {
                  const dayEvents = events.filter(e => isSameDay(e.date, day.fullDate));
                  return (
                     <div
                        key={idx}
                        className={cn(
                           "border-b border-r border-border/20 p-1 relative cursor-pointer hover:bg-muted/10 transition-colors",
                           !day.isCurrentMonth && "bg-muted/20 text-muted-foreground",
                           day.isSelected && "bg-green-50/50 dark:bg-green-900/10"
                        )}
                        onClick={() => { onDayInMonthClick && onDayInMonthClick({ date: day.fullDate, events: dayEvents }) }}
                     >
                        <span className={cn("text-xs font-medium p-1", day.isToday && "bg-green-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center")}>
                           {day.date}
                        </span>
                        <div className="mt-1 space-y-1">
                           {dayEvents.slice(0, 3).map(event => (
                              <div key={event.id} className={cn("text-[9px] px-1 rounded truncate", getEventStyle(event.type).split(' ')[0])}>
                                 {event.type}
                              </div>
                           ))}
                           {dayEvents.length > 3 && (
                              <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 3} more</div>
                           )}
                        </div>
                     </div>
                  )
               })}
            </div>
         ) : (
            <div className={cn("grid", view === 'day' ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]")}>
               {/* Time Slots */}
               {hours.map((hour) => (
                  <Fragment key={hour}>
                     {/* Time Label */}
                     <div className="border-r border-border/20 border-b p-2 text-right">
                        <span className="text-[10px] text-muted-foreground relative -top-2">
                           {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                        </span>
                     </div>

                     {/* Day Columns for this hour */}
                     {daysInView.map((day) => {
                        const dayEvents = events.filter(e => {
                           return isSameDay(e.date, day.fullDate) && e.date.getHours() === hour
                        });
                        const isSelected = isSameDay(day.fullDate, selectedDate);

                        return (
                           <div
                              key={`${day.date}-${hour}`}
                              className={cn(
                                 "border-b border-r border-border/20 relative h-[60px] cursor-pointer hover:bg-muted/10",
                                 isSelected && "bg-green-50/30 dark:bg-green-900/5"
                              )}
                              onClick={() => { onHourInDayClick && onHourInDayClick({ date: day.fullDate, events: dayEvents }) }}
                           >
                              {dayEvents.map((event, idx) => (
                                 <div key={event.id}
                                    className={cn("absolute inset-x-1 top-0 bottom-1 p-1 pl-2 rounded text-[10px] leading-tight font-medium overflow-hidden z-10 shadow-sm transition-all hover:scale-[1.02] hover:z-20", getEventStyle(event.type))}
                                    style={{
                                       width: dayEvents.length > 1 ? `${90 / dayEvents.length}%` : 'auto',
                                       left: dayEvents.length > 1 ? `${(90 / dayEvents.length) * idx + 2}%` : '4px',
                                       right: dayEvents.length > 1 ? 'auto' : '4px'
                                    }}
                                    onClick={(e) => {
                                       e.stopPropagation(); // prevent triggering cell click twice logic if needed, but here filtering works same
                                       onHourInDayClick && onHourInDayClick({ date: day.fullDate, events: [event] });
                                    }}
                                 >
                                    <div className="font-bold mb-0.5 text-[9px] opacity-80">
                                       {event.date.getHours()}:00 - {event.date.getHours() + 1}:00
                                    </div>
                                    <div className="truncate">{event.type}</div>
                                 </div>
                              ))}
                           </div>
                        )
                     })}
                  </Fragment>
               ))}
            </div>
         )}
      </>
   )
}