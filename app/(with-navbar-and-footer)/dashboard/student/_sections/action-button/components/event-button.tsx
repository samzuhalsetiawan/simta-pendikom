"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { ScheduleEventDialog } from "./schedule-event-dialog";

type EventButtonProps = {
   nextEvent: "Seminar Proposal" | "Seminar Hasil" | "Ujian Akhir";
};

export function EventButton({
   nextEvent,
}: EventButtonProps) {
   const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

   const handleEventSchedule = (data: any) => {
      console.log("Event schedule:", data);
      // In real implementation, this would call an API
   };

   return (
      <>
         <Button
            size="lg"
            onClick={() => setScheduleDialogOpen(true)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
         >
            <CalendarPlus className="w-5 h-5 mr-2" />
            Jadwalkan {nextEvent}
         </Button>

         {nextEvent && (
            <ScheduleEventDialog
               open={scheduleDialogOpen}
               onOpenChange={setScheduleDialogOpen}
               eventType={nextEvent}
               onSubmit={handleEventSchedule}
            />
         )}
      </>
   )
}