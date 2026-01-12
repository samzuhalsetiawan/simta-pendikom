import { Button } from "@/components/ui/button";
import { CalendarPlus, MessageSquare } from "lucide-react";
import { ConsultationButton } from "./components/consultation-button";
import { EventButton } from "./components/event-button";

type ActionButtonSectionProps = {
   currentProgress: number;
};

export function ActionButtonSection({
   currentProgress,
}: ActionButtonSectionProps) {

   // Determine which event should be scheduled next
   const getNextEvent = (): "Seminar Proposal" | "Seminar Hasil" | "Ujian Akhir" | null => {
      // @ts-ignore
      if (currentProgress === 2) return "Seminar Proposal";
      // @ts-ignore
      if (currentProgress === 4) return "Seminar Hasil";
      // @ts-ignore
      if (currentProgress === 5) return "Ujian Akhir";
      return null;
   };

   const nextEvent = getNextEvent();

   return (
      <section className="mb-4">
         <div className="flex flex-col sm:flex-row gap-4">
            <ConsultationButton />

            {nextEvent && (<EventButton nextEvent={nextEvent} />)}
         </div>
      </section>
   )
}