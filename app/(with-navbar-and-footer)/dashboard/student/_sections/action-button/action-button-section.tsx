import { Button } from "@/components/ui/button";
import { CalendarPlus, MessageSquare } from "lucide-react";
import { ConsultationButton } from "./components/consultation-button";
import { EventButton } from "./components/event-button";
import { Supervisor, Examiner } from "@/types/user/lecturer";

type ActionButtonSectionProps = {
   currentProgress: number;
   lecturers: (Supervisor | Examiner)[];
};

export function ActionButtonSection({
   currentProgress,
   lecturers
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
            <ConsultationButton lecturers={lecturers} />

            {nextEvent && (<EventButton nextEvent={nextEvent} />)}
         </div>
      </section>
   )
}