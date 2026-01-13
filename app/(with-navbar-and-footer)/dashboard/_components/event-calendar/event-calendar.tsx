"use client";

import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Consultation, Event, EventType } from "@/types/event/event";
import { on } from "events";
import { useDaysInView } from "./hooks/days-in-view";
import { EventCalendarBody } from "./components/body";
import { Suspense, useState } from "react";


export const eventCalendarViews = ["day", "month", "week"] as const;

export type EventCalendarView = typeof eventCalendarViews[number];

interface EventCalendarProps {
   initialEvents: Event[],
   view?: EventCalendarView;
   onHourInDayClick?: (data: { date: Date, events: Event[] }) => void;
   onDayInMonthClick?: (data: { date: Date, events: Event[] }) => void;
   onViewChange?: (view: EventCalendarView) => void;
}

export function EventCalendar({ 
   initialEvents = [],
   view = "week",
   onViewChange,
   onHourInDayClick,
   onDayInMonthClick
}: EventCalendarProps) {
   const [currentDate, setCurrentDate] = useState(new Date());
   const [selectedDate, setSelectedDate] = useState(new Date()); // For column highlight

   const daysInView = useDaysInView(view, selectedDate, currentDate);

   // Handlers
   const navigate = (direction: 'next' | 'prev') => {
      if (view === 'day') {
         const newDate = direction === 'next' ? addDays(selectedDate, 1) : addDays(selectedDate, -1);
         setSelectedDate(newDate);
         setCurrentDate(newDate);
      } else if (view === 'week') {
         setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
      } else {
         setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
      }
   };

   const handleDayClick = (date: Date) => {
      setSelectedDate(date);
      // If in month view, maybe switch to day view or just highlight? User asked for highlight.
      // Let's just highlight for now.
   };

   const monthYear = format(currentDate, "MMMM yyyy");

   return (
      <div className="space-y-4">
         <div className="flex justify-between items-end">
            <h2 className="text-xl font-semibold">Kalender Acara</h2>
            <span className="text-sm font-medium text-muted-foreground mr-1">{monthYear}</span>
         </div>

         <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="h-8 text-xs font-medium" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
                     Today
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
                     <ArrowRight className="h-4 w-4" />
                  </Button>
               </div>

               <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-md">
                  {eventCalendarViews.map((v) => (
                     <Button
                        key={v}
                        variant={view === v ? 'default' : 'ghost'}
                        size="sm"
                        className={cn("h-7 text-xs capitalize", view === v && "bg-green-600 hover:bg-green-700 text-white")}
                        onClick={() => onViewChange && onViewChange(v)}
                     >
                        {v}
                     </Button>
                  ))}
               </div>

               <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8 h-8 text-xs w-full md:w-[200px] bg-muted/20 border-none" />
               </div>
            </div>

            {/* View container */}
            <div className="border border-border/20 rounded-lg overflow-hidden bg-background">
               {/* Headers */}
               <div className={cn("grid bg-muted/30 border-b border-border/20",
                  view === 'month' ? "grid-cols-7" :
                     view === 'day' ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]"
               )}>
                  {view !== 'month' && <div className="p-2 border-r border-border/20"></div>} {/* Time col spacer */}

                  {view === 'month' ? (
                     ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground uppercase">{day}</div>
                     ))
                  ) : (
                     daysInView.map((day) => (
                        <div
                           key={day.fullDate.toString()}
                           className={cn(
                              "p-2 text-center cursor-pointer transition-colors hover:bg-muted/50",
                              day.isSelected ? "bg-green-50 dark:bg-green-900/20" : ""
                           )}
                           onClick={() => handleDayClick(day.fullDate)}
                        >
                           <div className={cn("text-[10px] uppercase font-bold", day.isSelected ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>{day.name}</div>
                           <div className={cn(
                              "text-lg font-medium mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full",
                              day.isToday && "bg-green-600 text-white shadow-sm",
                              !day.isToday && day.isSelected && "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                           )}>
                              {day.date}
                           </div>
                        </div>
                     ))
                  )}
               </div>

               {/* Body */}
               <Suspense key={currentDate.toISOString()} fallback={<div className="p-4 text-center text-sm text-muted-foreground">Loading calendar...</div>}>
                  <EventCalendarBody
                     initialEvents={initialEvents}
                     view={view}
                     currentDate={currentDate}
                     selectedDate={selectedDate}
                     daysInView={daysInView}
                     onHourInDayClick={onHourInDayClick}
                     onDayInMonthClick={onDayInMonthClick}
                  />
               </Suspense>
            </div>
         </div>
      </div>
   );
}
