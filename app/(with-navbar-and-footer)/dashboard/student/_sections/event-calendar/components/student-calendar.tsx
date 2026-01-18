"use client";

import { use, useState } from "react";
import { EventCalendar, EventCalendarView } from "@/components/common/event-calendar/event-calendar";
import { Event } from "@/types/event/event";
import { CalendarEventDialog } from "@/components/common/event-calendar/components/dialog";
import { KonsultasiEventDialog } from "./konsultasi-event-dialog";
import { SeminarProposalEventDialog } from "./seminar-proposal-event-dialog";
import { SeminarHasilEventDialog } from "./seminar-hasil-event-dialog";
import { PendadaranEventDialog } from "./pendadaran-event-dialog";
import { Konsultasi } from "@/types/event/konsultasi";
import { SeminarProposal } from "@/types/event/seminar-proposal";
import { SeminarHasil } from "@/types/event/seminar-hasil";
import { Pendadaran } from "@/types/event/pendadaran";

interface StudentCalendarProps {
   eventsPromise: Promise<Event[]>;
   studentId: number;
}

export function StudentCalendar({ eventsPromise, studentId }: StudentCalendarProps) {
   const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [eventCalendarView, setEventCalendarView] = useState<EventCalendarView>("week");

   // Detail dialog states
   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
   const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

   const events = use(eventsPromise);

   const handleEventClick = (event: Event) => {
      setSelectedEvent(event);
      setIsDetailDialogOpen(true);
   };

   const handleDetailDialogClose = (open: boolean) => {
      setIsDetailDialogOpen(open);
      if (!open) {
         setSelectedEvent(null);
      }
   };

   return (
      <>
         <EventCalendar
            initialEvents={events}
            view={eventCalendarView}
            onViewChange={setEventCalendarView}
            onDayInMonthClick={({ date, events }) => {
               setSelectedDate(date);
               setSelectedEvents(events);
               setIsDialogOpen(true);
            }}
            onHourInDayClick={({ date, events }) => {
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
            onEventClick={handleEventClick}
         />

         {/* Event Detail Dialogs */}
         {selectedEvent?.type === "konsultasi" && (
            <KonsultasiEventDialog
               open={isDetailDialogOpen}
               onOpenChange={handleDetailDialogClose}
               event={selectedEvent as Konsultasi}
            />
         )}

         {selectedEvent?.type === "seminar_proposal" && (
            <SeminarProposalEventDialog
               open={isDetailDialogOpen}
               onOpenChange={handleDetailDialogClose}
               event={selectedEvent as SeminarProposal}
               currentStudentId={studentId}
            />
         )}

         {selectedEvent?.type === "seminar_hasil" && (
            <SeminarHasilEventDialog
               open={isDetailDialogOpen}
               onOpenChange={handleDetailDialogClose}
               event={selectedEvent as SeminarHasil}
               currentStudentId={studentId}
            />
         )}

         {selectedEvent?.type === "pendadaran" && (
            <PendadaranEventDialog
               open={isDetailDialogOpen}
               onOpenChange={handleDetailDialogClose}
               event={selectedEvent as Pendadaran}
               currentStudentId={studentId}
            />
         )}
      </>
   );
}
