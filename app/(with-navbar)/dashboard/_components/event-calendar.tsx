"use client";

import * as React from "react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

// Mock events generator
const generateMockEvents = (baseDate: Date) => {
   const start = startOfWeek(baseDate);
   return [
      { id: "1", title: "Seminar Proposal", date: addDays(start, 1), startHour: 9, duration: 2, type: "proposal", desc: "Ruang Sidang 1" },
      { id: "2", title: "Seminar Hasil", date: addDays(start, 1), startHour: 11, duration: 1, type: "hasil", desc: "Lab Komputer" },
      { id: "3", title: "Seminar Proposal", date: addDays(start, 1), startHour: 13, duration: 1, type: "proposal", desc: "Ruang Dosen" },
      { id: "4", title: "Konsultasi", date: addDays(start, 1), startHour: 14, duration: 1, type: "consultation", desc: "Online (Zoom)" },
      { id: "5", title: "Seminar Proposal", date: addDays(start, 2), startHour: 9, duration: 1, type: "proposal", desc: "Ruang Sidang 2" },
      { id: "6", title: "Seminar Proposal", date: addDays(start, 2), startHour: 12, duration: 1, type: "proposal", desc: "Ruang Sidang 1" },
      { id: "8", title: "Ujian Akhir", date: addDays(start, 2), startHour: 16, duration: 2, type: "ujian", desc: "Ruang Ujian Utama" },
      { id: "13", title: "Seminar Hasil", date: addDays(start, 4), startHour: 10, duration: 2, type: "hasil", desc: "Lab Jaringan" },
      { id: "15", title: "Seminar Hasil", date: addDays(start, 5), startHour: 9, duration: 2, type: "proposal", desc: "Ruang Sidang 1" },
   ] as const;
};

type EventType = "proposal" | "hasil" | "ujian" | "consultation" | "other";

type CalendarEvent = {
   id: string;
   title: string;
   date: Date;
   startHour: number;
   duration: number;
   type: EventType;
   desc: string;
};

const getEventStyle = (type: EventType) => {
   switch (type) {
      case "proposal":
         return "bg-blue-100 border-l-4 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-blue-600";
      case "hasil":
         return "bg-purple-100 border-l-4 border-purple-500 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-purple-600";
      case "ujian":
         return "bg-pink-100 border-l-4 border-pink-500 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200 border-pink-600";
      case "consultation":
         return "bg-orange-100 border-l-4 border-orange-500 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200 border-orange-600";
      case "other":
         return "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200 border-yellow-600";
      default:
         return "bg-gray-100 border-l-4 border-gray-500 text-gray-700";
   }
}

export function EventCalendar() {
   const [currentDate, setCurrentDate] = React.useState(new Date());
   const [selectedDate, setSelectedDate] = React.useState(new Date()); // For column highlight
   const [view, setView] = React.useState<"day" | "week" | "month">("week");

   // Details Modal State
   const [isDetailOpen, setIsDetailOpen] = React.useState(false);
   const [detailData, setDetailData] = React.useState<{ date: Date, events: CalendarEvent[] } | null>(null);

   // Derived State
   const events = React.useMemo(() => generateMockEvents(currentDate), [currentDate]);

   const daysInView = React.useMemo(() => {
      if (view === "day") {
         return [{
            name: format(selectedDate, "EEE"),
            date: format(selectedDate, "d"),
            fullDate: selectedDate,
            isToday: isSameDay(selectedDate, new Date()),
            isSelected: true
         }];
      }

      if (view === "week") {
         const start = startOfWeek(currentDate);
         return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(start, i);
            return {
               name: format(date, "EEE"),
               date: format(date, "d"),
               fullDate: date,
               isToday: isSameDay(date, new Date()),
               isSelected: isSameDay(date, selectedDate)
            };
         });
      }

      if (view === "month") {
         const monthStart = startOfMonth(currentDate);
         const monthEnd = endOfMonth(monthStart);
         const startDate = startOfWeek(monthStart);
         const endDate = endOfWeek(monthEnd);
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

   const handleCellClick = (date: Date, hour?: number) => {
      // Filter events for this specific slot or whole day
      let filteredEvents = events.filter(e => isSameDay(e.date, date));
      if (hour !== undefined) {
         filteredEvents = filteredEvents.filter(e => e.startHour === hour);
      }
      setDetailData({ date, events: filteredEvents });
      setIsDetailOpen(true);
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
                  {(['day', 'week', 'month'] as const).map((v) => (
                     <Button
                        key={v}
                        variant={view === v ? 'default' : 'ghost'}
                        size="sm"
                        className={cn("h-7 text-xs capitalize", view === v && "bg-green-600 hover:bg-green-700 text-white")}
                        onClick={() => setView(v)}
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
                     ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
                              onClick={() => handleCellClick(day.fullDate)}
                           >
                              <span className={cn("text-xs font-medium p-1", day.isToday && "bg-green-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center")}>
                                 {day.date}
                              </span>
                              <div className="mt-1 space-y-1">
                                 {dayEvents.slice(0, 3).map(event => (
                                    <div key={event.id} className={cn("text-[9px] px-1 rounded truncate", getEventStyle(event.type).split(' ')[0])}>
                                       {event.title}
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
                  <ScrollArea className="h-[500px]">
                     <div className={cn("grid", view === 'day' ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]")}>
                        {/* Time Slots */}
                        {hours.map((hour) => (
                           <React.Fragment key={hour}>
                              {/* Time Label */}
                              <div className="border-r border-border/20 border-b border-border/20 p-2 text-right">
                                 <span className="text-[10px] text-muted-foreground relative -top-2">
                                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                                 </span>
                              </div>

                              {/* Day Columns for this hour */}
                              {daysInView.map((day) => {
                                 const dayEvents = events.filter(e => isSameDay(e.date, day.fullDate) && e.startHour === hour);
                                 const isSelected = isSameDay(day.fullDate, selectedDate);

                                 return (
                                    <div
                                       key={`${day.date}-${hour}`}
                                       className={cn(
                                          "border-b border-r border-border/20 relative h-[60px] cursor-pointer hover:bg-muted/10",
                                          isSelected && "bg-green-50/30 dark:bg-green-900/5"
                                       )}
                                       onClick={() => handleCellClick(day.fullDate, hour)}
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
                                                handleCellClick(day.fullDate, hour);
                                             }}
                                          >
                                             <div className="font-bold mb-0.5 text-[9px] opacity-80">
                                                {event.startHour}:00 - {event.startHour + event.duration}:00
                                             </div>
                                             <div className="truncate">{event.title}</div>
                                          </div>
                                       ))}
                                    </div>
                                 )
                              })}
                           </React.Fragment>
                        ))}
                     </div>
                  </ScrollArea>
               )}
            </div>
         </div>

         {/* Event Details Modal */}
         <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Agenda Details</DialogTitle>
                  <DialogDescription>
                     {detailData && format(detailData.date, "EEEE, d MMMM yyyy")}
                  </DialogDescription>
               </DialogHeader>
               <div className="py-4">
                  {detailData?.events && detailData.events.length > 0 ? (
                     <div className="space-y-3">
                        {detailData.events.map(event => (
                           <div key={event.id} className={cn("p-3 rounded-md border text-sm", getEventStyle(event.type))}>
                              <div className="font-semibold flex justify-between">
                                 <span>{event.title}</span>
                                 <span className="opacity-75">{event.startHour}:00 - {event.startHour + event.duration}:00</span>
                              </div>
                              <div className="mt-1 text-xs opacity-90">
                                 Type: <span className="uppercase">{event.type}</span>
                              </div>
                              <div className="mt-2 text-xs opacity-80 border-t border-black/10 pt-2">
                                 Notes: {event.desc}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center text-muted-foreground py-8">
                        No events scheduled for this time slot.
                        <Button variant="link" className="mt-2 text-green-600 block mx-auto">
                           + Add New Event
                        </Button>
                     </div>
                  )}
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
