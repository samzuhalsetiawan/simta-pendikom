import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImportantSection, NotificationItem } from "@/app/(with-navbar)/dashboard/_components/important-section";
import { MentoringTable, Student } from "@/app/(with-navbar)/dashboard/_components/mentoring-table";
import { ExamTable, ExamStudent } from "@/app/(with-navbar)/dashboard/_components/exam-table";
import { EventCalendar, CalendarEvent } from "@/app/(with-navbar)/dashboard/_components/event-calendar/event-calendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Lecturer } from "@/types/lecturer";
import { Event } from "@/types/event";
import { Thesis } from "@/types/thesis";
import { getLecturerById } from "@/data/lecturer/get-lecturer-by-id";
import { getLecturerNeedApproval } from "@/data/lecturer/get-lecturer-need-approval";
import { getLecturerThesis } from "@/data/lecturer/get-lecturer-thesis";
import { getLecturerEvent } from "@/data/lecturer/get-lecturer-event";

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


function calculateProgress(thesisList: Thesis[]) {
   if (thesisList.length === 0) return 0;
   const totalScore = thesisList.reduce((acc, t) => {
      let weight;
      switch (t.progress) {
         case "Pengajuan Judul":
            weight = 1;
            break;
         case "Seminar Proposal":
            weight = 2;
            break;
         case "Penelitian":
            weight = 3;
            break;
         case "Seminar Hasil":
            weight = 4;
            break;
         case "Sidang Akhir":
            weight = 5;
            break;
         case "Selesai":
            weight = 6;
            break;
         default:
            weight = 0;
            break;
      }
      return acc + (weight / 6) * 100;
   }, 0);
   return Math.round(totalScore / thesisList.length);
}

// Sub-components for Streaming
async function ProfileSection({ promise }: { promise: Promise<Lecturer> }) {
   const user = await promise;
   return (
      <Card className="md:col-span-4 lg:col-span-3 border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
         <CardContent className="p-4 flex items-center gap-4 h-full">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
               <AvatarImage src={user.image === null ? undefined : user.image} alt={user.name} />
               <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
               <h3 className="font-semibold text-sm">{user.name}</h3>
               <p className="text-xs text-muted-foreground">NIP. {user.nip}</p>
               <div className="flex items-center gap-1 mt-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                     <Users className="w-3 h-3 mr-1" />
                     Dosen
                  </span>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}

async function StatsSection({ thesisPromise, lecturerId }: { thesisPromise: Promise<Thesis[]>, lecturerId: number }) {
   const thesisData = await thesisPromise;

   const mentoringStudents = thesisData.filter(t =>
      t.lecturers.some(l => l.id === lecturerId && l.role === "Pembimbing")
   );
   const examStudents = thesisData.filter(t =>
      t.lecturers.some(l => l.id === lecturerId && l.role === "Penguji")
   );

   const mentoringProgress = calculateProgress(mentoringStudents);
   const examProgress = calculateProgress(examStudents);

   return (
      <>
         <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4 flex items-center justify-between h-full">
               <div className="flex items-center gap-4 w-full">
                  <span className="text-4xl font-normal text-green-500">{mentoringProgress}%</span>
                  <div className="flex flex-col space-y-1 w-full">
                     <span className="text-xs font-semibold">Progress Mahasiswa Bimbingan</span>
                     <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{mentoringStudents.length} Mahasiswa</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Recent</span>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4 flex items-center justify-between h-full">
               <div className="flex items-center gap-4 w-full">
                  <span className="text-4xl font-normal text-orange-400">{examProgress}%</span>
                  <div className="flex flex-col space-y-1 w-full">
                     <span className="text-xs font-semibold">Progress Mahasiswa yang Diuji</span>
                     <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{examStudents.length} Mahasiswa</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Recent</span>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </>
   );
}

async function ImportantSectionWrapper({ promise }: { promise: Promise<Event[]> }) {
   const data = await promise;
   const notifications: NotificationItem[] = data.map((event, idx) => ({
      id: event.id,
      name: event.thesis.student.name,
      title: `Permintaan ${event.type}`,
      date: event.date ? new Date(event.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "TBD",
      time: event.date ? new Date(event.date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "TBD",
      location: event.location || "TBD",
      avatar: event.thesis.student.image || "/avatars/default.png",
      type: event.type,
   }));

   return <ImportantSection data={notifications} />;
}

async function MentoringTableWrapper({ promise, lecturerId }: { promise: Promise<Thesis[]>, lecturerId: number }) {
   const thesis = await promise;
   const mentoringData: Student[] = thesis
      .filter(t => t.lecturers.some(l => l.id === lecturerId && l.role === "Pembimbing"))
      .map(t => ({
         id: t.student.id,
         name: t.student.name,
         avatar: t.student.image,
         title: t.title,
         status: t.progress,
         consultations: "-", // Not available in thesis endpoint
         update: "-" // Not available
      }));

   return <MentoringTable data={mentoringData} />;
}

async function ExamTableWrapper({ promise, lecturerId }: { promise: Promise<Thesis[]>, lecturerId: number }) {
   const data = await promise;
   const examData: ExamStudent[] = data
      .filter(t => t.lecturers.some(l => l.id === lecturerId && l.role === "Penguji"))
      .map(t => ({
         id: t.student.id,
         name: t.student.name,
         avatar: t.student.image,
         title: t.title,
         status: t.progress,
         upcomingAgenda: "-"
      }));

   return <ExamTable data={examData} />;
}

async function CalendarWrapper({ promise }: { promise: Promise<Event[]> }) {
   const events = await promise;
   const calendarEvents: CalendarEvent[] = events.map((event, idx) => ({
      id: event.id,
      title: event.type,
      date: new Date(event.date),
      startHour: event.date ? new Date(event.date).getHours() : 9,
      duration: 2,
      type: event.type,
      desc: event.location || "No location"
   }));

   return <EventCalendar data={calendarEvents} />;
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
         <section className="flex flex-col gap-2 items-center lg:items-stretch">
            <div className="flex flex-col gap-3 lg:flex-row lg:justify-center w-full">
               <Suspense fallback={<Skeleton className="h-32 w-full lg:w-1/3 rounded-lg" />}>
                  <ProfileSection promise={lecturerPromise} />
               </Suspense>
               <Suspense fallback={<Skeleton className="h-32 w-full lg:w-2/3 rounded-lg" />}>
                  <StatsSection thesisPromise={thesisPromise} lecturerId={id} />
               </Suspense>
            </div>
         </section>

         {/* Important Section */}
         <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <ImportantSectionWrapper promise={approvalPromise} />
         </Suspense>

         {/* Mentoring Table */}
         <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <MentoringTableWrapper promise={thesisPromise} lecturerId={id} />
         </Suspense>

         {/* Exam Table */}
         <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <ExamTableWrapper promise={thesisPromise} lecturerId={id} />
         </Suspense>

         {/* Calendar */}
         <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <CalendarWrapper promise={eventPromise} />
         </Suspense>
      </div>
   );
}
