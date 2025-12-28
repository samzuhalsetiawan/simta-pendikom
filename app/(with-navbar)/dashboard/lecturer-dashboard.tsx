import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, ClipboardList } from "lucide-react";
import { ImportantSection } from "./_components/important-section";
import { MentoringTable } from "./_components/mentoring-table";
import { ExamTable } from "./_components/exam-table";
import { EventCalendar } from "./_components/event-calendar";

export async function LecturerDashboard() {
   return (
      <div className="container mx-auto p-4 space-y-8 max-w-7xl font-sans pt-(--navbar-height)">
         {/* Top Stats Section */}
         <section className="flex flex-col gap-2 items-center lg:items-stretch">
            <div className="flex flex-col gap-3 lg:flex-row lg:justify-center">
               {/* Profile Card */}
            <Card className="md:col-span-4 lg:col-span-3 border-none shadow-sm bg-white dark:bg-zinc-900">
               <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                     <AvatarImage src="/avatars/lecturer.png" alt="Dr. Irwan Hakim" />
                     <AvatarFallback>IH</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                     <h3 className="font-semibold text-sm">Dr. Irwan Hakim</h3>
                     <p className="text-xs text-muted-foreground">NIP. 198201012005011001</p>
                     <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                           <Users className="w-3 h-3 mr-1" />
                           Dosen
                        </span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Stat 1 */}
            <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900">
               <CardContent className="p-4 flex items-center justify-between h-full">
                  <div className="flex items-center gap-4 w-full">
                     <span className="text-4xl font-normal text-green-500">95%</span>
                     <div className="flex flex-col space-y-1 w-full">
                        <span className="text-xs font-semibold">Progress Mahasiswa Bimbingan</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                           <span>8 Mahasiswa</span>
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 14 Agustus 2025</span>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Stat 2 */}
            <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900">
               <CardContent className="p-4 flex items-center justify-between h-full">
                  <div className="flex items-center gap-4 w-full">
                     <span className="text-4xl font-normal text-orange-400">10%</span>
                     <div className="flex flex-col space-y-1 w-full">
                        <span className="text-xs font-semibold">Progress Mahasiswa yang Diuji</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                           <span>15 Mahasiswa</span>
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 14 Agustus 2025</span>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
            </div>
            <div className="md:col-span-12 flex justify-end">
               <a href="#" className="text-xs text-muted-foreground hover:text-primary">Lihat semua...</a>
            </div>
         </section>

         {/* Placeholder for other sections */}
         {/* Important Section */}
         <ImportantSection />

         {/* Mentoring Table */}
         <MentoringTable />

         {/* Exam Table */}
         <ExamTable />

         {/* Calendar */}
         <EventCalendar />
      </div>
   );
}

