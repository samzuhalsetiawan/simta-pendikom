import { ProfileCard } from "@/components/common/profile-card/profile-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Examiner, Supervisor } from "@/types/user/lecturer";

type SupervisorAndExaminerSectionProps = {
   supervisors: (Supervisor | Examiner)[];
   examiners: (Supervisor | Examiner)[];
}

export function SupervisorAndExaminerSection({ supervisors, examiners }: SupervisorAndExaminerSectionProps) {
   return (
      <section className="mb-4">
         <div className="flex flex-col gap-4">
            {/* Supervisors */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     Dosen Pembimbing
                  </CardTitle>
                  <CardDescription>Tim pembimbing skripsi Anda</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-nowrap gap-4">
                  {supervisors.length === 0 ? (
                     <p className="text-muted-foreground">Belum ada dosen pembimbing yang ditugaskan</p>
                  ) : (
                     supervisors.map((supervisor) => (
                        <ProfileCard
                           key={supervisor.id}
                           user={supervisor}
                        />
                     ))
                  )}
               </CardContent>
            </Card>

            {/* Examiners */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     Dosen Penguji
                  </CardTitle>
                  <CardDescription>Tim penguji skripsi Anda</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-nowrap gap-4">
                  {examiners.length === 0 ? (
                     <p className="text-muted-foreground">Belum ada dosen penguji yang ditugaskan</p>
                  ) : (
                     examiners.map((examiner) => (
                        <ProfileCard
                           key={examiner.id}
                           user={examiner}
                        />
                     ))
                  )}
               </CardContent>
            </Card>
         </div>
      </section>
   )
}