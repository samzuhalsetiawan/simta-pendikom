import { ThesisTitleSection } from "./_sections/thesis-title/thesis-title-section";
import { ResearchTypeAndModelSection } from "./_sections/research-type-and-model/research-type-and-model-section";
import { ProgressTrackerSection } from "./_sections/progress-tracker/progress-tracker-section";
import { SupervisorAndExaminerSection } from "./_sections/supervisor-and-examiner/supervisor-and-examiner-section";
import { ActionButtonSection } from "./_sections/action-button/action-button-section";
import { HistorySection } from "./_sections/history/history-section";
import { EventCalendarSection } from "./_sections/event-calendar/event-calendar-section";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getThesisByStudent } from "@/data/thesis/get-thesis-by-student";
import { getStudentById } from "@/data/student/get-student-by-id";
import { ThesisStatus, thesisStatus } from "@/types/thesis";

// Map thesis status to progress number (1-6)
function getProgressNumber(status: ThesisStatus): number {
   return thesisStatus.indexOf(status) + 1;
}

export default async function StudentDashboardPage() {
   const session = await getServerSession(authOptions);
   if (!session?.user?.id || session.user.role !== "student") {
      redirect("/login");
   }

   const studentId = session.user.id;
   const [student, thesis] = await Promise.all([
      getStudentById(studentId),
      getThesisByStudent(studentId),
   ]);

   if (!student) {
      redirect("/login");
   }

   const currentProgress = thesis ? getProgressNumber(thesis.progress) : 1;
   const supervisors = thesis?.lecturers.filter(l => l.role === "pembimbing") ?? [];
   const examiners = thesis?.lecturers.filter(l => l.role === "penguji") ?? [];

   // Combine all lecturers for consultation requests
   const allLecturers = [...supervisors, ...examiners];

   return (
      <div className="px-32">
         <Suspense fallback={<div>Loading...</div>}>
            <ThesisTitleSection
               student={student}
               thesisTitle={thesis?.title}
            />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <ResearchTypeAndModelSection />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <ProgressTrackerSection currentProgress={currentProgress} />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <SupervisorAndExaminerSection
               supervisors={supervisors}
               examiners={examiners}
            />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <ActionButtonSection
               currentProgress={currentProgress}
               lecturers={allLecturers}
            />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <HistorySection studentId={studentId} />
         </Suspense>

         <Suspense fallback={<div>Loading...</div>}>
            <EventCalendarSection />
         </Suspense>
      </div>
   );
}

