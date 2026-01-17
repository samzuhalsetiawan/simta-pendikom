import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Thesis } from "@/types/thesis";
import { getLecturerById } from "@/data/lecturer/get-lecturer-by-id";
import { getLecturerNeedApproval } from "@/data/lecturer/get-lecturer-need-approval";
import { getLecturerThesis } from "@/data/lecturer/get-lecturer-thesis";
import { TopStatsSection } from "./_sections/top-stats/top-stats-section";
import { ImportantSection } from "./_sections/important/important-section";
import { SupervisedStudentsTableSection } from "./_sections/supervised-students-table/supervised-students-table-section";
import { ExaminedStudentsTableSection } from "./_sections/examined-students-table/examined-students-table-sections";
import { EventCalendarSection } from "./_sections/event-calendar/event-calendar-section";
import { getLecturerEvent } from "@/data/lecturer/get-lecturer-event";
import { Suspense } from "react";


export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "lecturer") {
    redirect("/login");
  }
  const lecturer = await getLecturerById(session.user.id);
  if (!lecturer) {
    redirect("/")
  }

  const needApprovalsPromise = getLecturerNeedApproval(lecturer.id);
  const lecturerEventsPromise = getLecturerEvent(lecturer.id);
  const lecturerStudentsThesisPromise = getLecturerThesis(lecturer.id);

  const supervisedStudentsThesisPromise = new Promise<Thesis[]>(async (resolve, reject) => {
    const lecturerStudentsThesis = await lecturerStudentsThesisPromise
    const supervisedStudentsThesis = lecturerStudentsThesis.filter(thesis => {
      return thesis.lecturers.some(lec => {
        return lec.id === lecturer.id && lec.role === "pembimbing"
      })
    })
    resolve(supervisedStudentsThesis)
  })

  const examinedStudentsThesisPromise = new Promise<Thesis[]>(async (resolve, reject) => {
    const lecturerStudentsThesis = await lecturerStudentsThesisPromise
    const examinedStudentsThesis = lecturerStudentsThesis.filter(thesis => {
      return thesis.lecturers.some(lec => {
        return lec.id === lecturer.id && lec.role === "penguji"
      })
    })
    resolve(examinedStudentsThesis)
  })

  return (
    <main className="container mx-auto p-4 space-y-8 max-w-7xl font-sans">

      {/* Top Stats Section */}
      <Suspense fallback={<div>loading...</div>}>
        <TopStatsSection
          lecturer={lecturer}
          supervisedStudentsThesisPromise={supervisedStudentsThesisPromise}
          examinedStudentsThesisPromise={examinedStudentsThesisPromise}
        />
      </Suspense>

      {/* Important Section */}
      <Suspense fallback={<div>loading...</div>}>
        <ImportantSection needApprovalsPromise={needApprovalsPromise} />
      </Suspense>

      {/* Mentoring Table */}
      <Suspense fallback={<div>loading...</div>}>
        <SupervisedStudentsTableSection studentsThesisPromise={supervisedStudentsThesisPromise} lecturerId={lecturer.id} />
      </Suspense>

      {/* Exam Table */}
      <Suspense fallback={<div>loading...</div>}>
        <ExaminedStudentsTableSection studentsThesisPromise={examinedStudentsThesisPromise} />
      </Suspense>

      {/* Calendar */}
      <Suspense fallback={<div>loading...</div>}>
        <EventCalendarSection initialEventsPromise={lecturerEventsPromise} />
      </Suspense>

    </main>
  );
}
