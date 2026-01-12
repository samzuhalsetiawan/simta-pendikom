import { ThesisTitleSection } from "./_sections/thesis-title/thesis-title-section";
import { ResearchTypeAndModelSection } from "./_sections/research-type-and-model/research-type-and-model-section";
import { ProgressTrackerSection } from "./_sections/progress-tracker/progress-tracker-section";
import { SupervisorAndExaminerSection } from "./_sections/supervisor-and-examiner/supervisor-and-examiner-section";
import { ActionButtonSection } from "./_sections/action-button/action-button-section";
import { HistorySection } from "./_sections/history/history-section";
import { EventCalendarSection } from "./_sections/event-calendar/event-calendar-section";
import { Suspense } from "react";


export default async function StudentDashboardPage() {

   // Current progress stage (1-6)
   const currentProgress = 2; // Penelitian
   

   return (
      <div className="px-32">
         <Suspense fallback={<div>Loading...</div>}>
            <ThesisTitleSection />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <ResearchTypeAndModelSection />
         </Suspense>
         
         <Suspense fallback={<div>Loading...</div>}>
            <ProgressTrackerSection currentProgress={currentProgress} />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <SupervisorAndExaminerSection />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <ActionButtonSection currentProgress={currentProgress} />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <HistorySection />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <EventCalendarSection />
         </Suspense>
      </div>
   );
}
