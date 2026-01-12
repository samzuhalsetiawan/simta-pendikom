import { getStudentEvent } from "@/data/student/get-student-event";
import { StudentCalendar } from "./components/student-calendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getISOWeekRange } from "@/lib/utils";
import { endOfISOWeek, startOfISOWeek } from "date-fns";

export async function EventCalendarSection() {
   const session = await getServerSession(authOptions);
   if (!session?.user.role || session.user.role !== "student") {
      return null;
   }
   const studentId = session.user.id;
   const currentDate = new Date();
   const week = {
      start: startOfISOWeek(currentDate),
      end: endOfISOWeek(currentDate)
   }
   const eventsPromise = getStudentEvent(studentId, week.start, week.end);
   return (
      <section className="mb-8">
         <StudentCalendar
            eventsPromise={eventsPromise}
            studentId={studentId}
         />
      </section>
   )
}