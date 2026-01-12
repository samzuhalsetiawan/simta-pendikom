import { ProfileCard } from "@/components/profile-card/profile-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Examiner, Supervisor } from "@/types/user/lecturer";

const DUMMY_SUPERVISORS: Supervisor[] = [
   { id: 1, name: "Dr. Ahmad Fauzi, M.Kom", nip: "198505152010121001", role: "Pembimbing" as const, image: "/avatars/default.png" },
   { id: 2, name: "Dr. Siti Rahmawati, M.T", nip: "198703202012122002", role: "Pembimbing" as const },
];

const DUMMY_EXAMINERS: Examiner[] = [
   { id: 3, name: "Prof. Dr. Budi Santoso, M.Sc", nip: "197812101998031001", role: "Penguji" as const },
   { id: 4, name: "Dr. Eng. Maya Kusuma, S.T., M.T", nip: "198209152008122001", role: "Penguji" as const },
];

export function SupervisorAndExaminerSection() {
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
                  {DUMMY_SUPERVISORS.map((supervisor) => (
                     <ProfileCard
                        key={supervisor.id}
                        user={supervisor}
                     />
                  ))}
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
                  {DUMMY_EXAMINERS.map((examiner) => (
                     <ProfileCard
                        key={examiner.id}
                        user={examiner}
                     />
                  ))}
               </CardContent>
            </Card>
         </div>
      </section>
   )
}