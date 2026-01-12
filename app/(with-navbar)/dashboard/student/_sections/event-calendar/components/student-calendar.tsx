"use client";

import { use, useState } from "react";
import { EventCalendar, EventCalendarView } from "@/app/(with-navbar)/dashboard/_components/event-calendar/event-calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Users } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/types/event/event";
import { CalendarEventDialog } from "@/app/(with-navbar)/dashboard/_components/event-calendar/components/dialog";

interface StudentCalendarProps {
   eventsPromise: Promise<Event[]>;
   studentId: number;
}

export function StudentCalendar({ eventsPromise, studentId }: StudentCalendarProps) {
   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
   const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [ eventCalendarView, setEventCalendarView ] = useState<EventCalendarView>("week")

   const events = use(eventsPromise);


   const handleRegisterAsAttendee = (eventId: number) => {
      console.log("Register as attendee for event:", eventId);
      // In real implementation, this would call an API
   };

   // This would come from the server in a real implementation
   const isStudentEvent = (eventId: number) => {
      // For demo purposes, assume event with id 1-3 are student's own events
      return eventId <= 3;
   };

   const handleRegister = () => {
      if (selectedEvent) {
         handleRegisterAsAttendee(selectedEvent.id);
         setIsDialogOpen(false);
      }
   };

   return (
      <>
         <EventCalendar 
            initialEvents={events}
            view={eventCalendarView}
            onViewChange={setEventCalendarView}
            onDayInMonthClick={({date, events}) => {
               setSelectedDate(date);
               setSelectedEvents(events);
               setIsDialogOpen(true);
            }}
            onHourInDayClick={({date, events}) => {
               setSelectedDate(date);
               setSelectedEvents(events);
               setIsDialogOpen(true);
            }}
         />

         <CalendarEventDialog
            isDetailOpen={isDialogOpen}
            setIsDetailOpen={setIsDialogOpen}
            date={selectedDate}
            events={selectedEvents} 
         />

         {/* Custom Event Detail Dialog for Students */}
         <Dialog open={false} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <Calendar className="w-5 h-5 text-primary" />
                     {selectedEvent?.type}
                  </DialogTitle>
                  <DialogDescription>
                     {selectedEvent && format(selectedEvent.date, "EEEE, d MMMM yyyy")}
                  </DialogDescription>
               </DialogHeader>
               {selectedEvent && (
                  <div className="space-y-4 py-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-sm font-semibold text-muted-foreground mb-1">Waktu</div>
                           <div className="text-sm">
                              {format(selectedEvent.date, "HH:mm")}
                           </div>
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-muted-foreground mb-1">Jenis</div>
                           <Badge variant="outline" className="capitalize">
                              {selectedEvent.type}
                           </Badge>
                        </div>
                     </div>

                     <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                           <MapPin className="w-4 h-4" />
                           Tempat
                        </div>
                        <div className="text-sm">{selectedEvent.thesis.title}</div>
                     </div>

                     {!isStudentEvent(selectedEvent.id) && (
                        <div className="pt-4 border-t">
                           <p className="text-sm text-muted-foreground mb-3">
                              Tertarik untuk menghadiri acara ini? Daftarkan diri Anda sebagai penonton.
                           </p>
                           <Button
                              onClick={handleRegister}
                              className="w-full bg-green-600 hover:bg-green-700"
                           >
                              <Users className="w-4 h-4 mr-2" />
                              Daftar Sebagai Penonton
                           </Button>
                        </div>
                     )}

                     {isStudentEvent(selectedEvent.id) && (
                        <div className="pt-4 border-t">
                           <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                              <User className="w-3 h-3 mr-1" />
                              Acara Anda
                           </Badge>
                        </div>
                     )}
                  </div>
               )}
            </DialogContent>
         </Dialog>
      </>
   );
}
