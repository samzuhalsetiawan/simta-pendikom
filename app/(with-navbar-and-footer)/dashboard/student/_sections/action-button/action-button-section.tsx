import { Button } from "@/components/ui/button";
import { CalendarPlus, MessageSquare } from "lucide-react";
import { ConsultationButton } from "./components/consultation-button";
import { EventButton } from "./components/event-button";
import { Supervisor, Examiner } from "@/types/user/lecturer";
import { EventType } from "@/types/event/event";

type ActionButtonSectionProps = {
   currentProgress: number;
   lecturers: (Supervisor | Examiner)[];
};

export function ActionButtonSection({
   currentProgress,
   lecturers
}: ActionButtonSectionProps) {

   // Determine which event should be scheduled next
   const getNextEvent = (): Exclude<EventType, "konsultasi"> | null => {
      // @ts-ignore
      if (currentProgress === 2) return "seminar_proposal";
      // @ts-ignore
      if (currentProgress === 4) return "seminar_hasil";
      // @ts-ignore
      if (currentProgress === 5) return "pendadaran";
      return null;
   };

   const nextEvent = getNextEvent();

   return (
      <section className="mb-4">
         <div className="flex flex-col sm:flex-row gap-4">
            <ConsultationButton lecturers={lecturers} />

            {nextEvent && (<EventButton nextEvent={nextEvent} />)}
         </div>
      </section>
   )
}