import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MentoringTable,
  Student,
} from "@/app/(with-navbar-and-footer)/dashboard/lecturer/_sections/supervised-students-table/components/supervised-students-table";
import {
  ExamTable,
  ExamStudent,
} from "@/app/(with-navbar-and-footer)/dashboard/lecturer/_sections/examined-students-table/components/examined-students-table";
import { EventCalendar } from "@/components/common/event-calendar/event-calendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Lecturer } from "@/types/user/lecturer";
import { Event } from "@/types/event/event";
import { Thesis } from "@/types/thesis";
import { getLecturerById } from "@/data/lecturer/get-lecturer-by-id";
import { getLecturerNeedApproval } from "@/data/lecturer/get-lecturer-need-approval";
import { getLecturerThesis } from "@/data/lecturer/get-lecturer-thesis";
import { getLecturerEvent } from "@/data/lecturer/get-lecturer-event";
import { TopStatsSection } from "./_sections/top-stats/top-stats-section";
import { ImportantSection } from "./_sections/important/important-section";
import { SupervisedStudentsTableSection } from "./_sections/supervised-students-table/supervised-students-table-section";
import { ExaminedStudentsTableSection } from "./_sections/examined-students-table/examined-students-table-sections";
import { EventCalendarSection } from "./_sections/event-calendar/event-calendar-section";

// Data Fetchers
async function getLecturer(id: number): Promise<Lecturer> {
  const lecturer = await getLecturerById(id);
  if (!lecturer) throw new Error("Failed to fetch lecturer");
  return lecturer;
}

async function getNeedApproval(id: number): Promise<Event[]> {
  return await getLecturerNeedApproval(id);
}

async function getThesis(id: number): Promise<Thesis[]> {
  return await getLecturerThesis(id);
}

async function getEvents(id: number): Promise<Event[]> {
  return await getLecturerEvent(id);
}

// Page Component
export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "lecturer") {
    redirect("/login");
  }

  const id = session.user.id;

  // Start fetching in parallel
  const lecturerPromise = getLecturer(id);
  const approvalPromise = getNeedApproval(id);
  const thesisPromise = getThesis(id);
  const eventPromise = getEvents(id);

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-7xl font-sans">
      {/* Top Stats Section */}
      <TopStatsSection
        lecturer={}
        supervisedStudentsThesis={}
        examinedStudentsThesis={}
      />

      {/* Important Section */}
      <ImportantSection pendingEventsApprovals={} />

      {/* Mentoring Table */}
      <SupervisedStudentsTableSection studentsThesis={} />

      {/* Exam Table */}
      <ExaminedStudentsTableSection studentsThesis={} />

      {/* Calendar */}
      <EventCalendarSection />
    </div>
  );
}
