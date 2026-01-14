import { EventCalendar } from "@/components/common/event-calendar/event-calendar";

export function EventCalendarSection() {
   return (
      <section>
         <EventCalendar 
            initialEvents={}
            view="week"
            onViewChange={}
            onDayInMonthClick={}
            onHourInDayClick={}
         />
      </section>
   )
}