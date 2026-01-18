"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { ScheduleEventDialog } from "./schedule-event-dialog";
import { EventType } from "@/types/event/event";
import { requestEventAction } from "@/actions/request-event";
import { toast } from "sonner";

type EventButtonProps = {
   nextEvent: Exclude<EventType, "konsultasi">;
};

export function EventButton({
   nextEvent,
}: EventButtonProps) {
   const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
   const [isPending, startTransition] = useTransition();

   const handleEventSchedule = (data: {
      datetime: string;
      location: string;
      notes?: string;
   }) => {
      startTransition(async () => {
         const result = await requestEventAction(undefined, {
            eventType: nextEvent,
            datetime: data.datetime,
            location: data.location
         });

         if (result.success) {
            toast.success(result.message);
            setScheduleDialogOpen(false);
         } else {
            toast.error(result.message);
         }
      });
   };

   const eventLabel = nextEvent.replace("_", " ");

   return (
      <>
         <Button
            size="lg"
            onClick={() => setScheduleDialogOpen(true)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
         >
            <CalendarPlus className="w-5 h-5 mr-2" />
            Jadwalkan {eventLabel}
         </Button>

         {nextEvent && (
            <ScheduleEventDialog
               open={scheduleDialogOpen}
               onOpenChange={setScheduleDialogOpen}
               eventType={nextEvent}
               onSubmit={handleEventSchedule}
               isLoading={isPending}
            />
         )}
      </>
   )
}