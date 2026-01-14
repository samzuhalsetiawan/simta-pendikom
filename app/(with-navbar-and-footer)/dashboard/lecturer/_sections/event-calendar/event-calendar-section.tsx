"use client"

import { EventCalendar } from "@/components/common/event-calendar/event-calendar";
import { Event } from "@/types/event/event";
import { use } from "react";

type EventCalendarSectionProps = {
   initialEventsPromise: Promise<Event[]>
}

export function EventCalendarSection({
   initialEventsPromise
}: EventCalendarSectionProps) {

   const initialEvents = use(initialEventsPromise)

   return (
      <section>
         <EventCalendar 
            initialEvents={initialEvents}
            view="week"
            onViewChange={() => {}}
            onDayInMonthClick={() => {}}
            onHourInDayClick={() => {}}
         />
      </section>
   )
}