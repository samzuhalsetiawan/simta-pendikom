import { getLecturers } from "@/data/lecturer/get-lecturers";
import { LecturerTable } from "./components/lecturer-table";
import { getStudentsByGeneration } from "@/data/student/get-students-by-generation";
import { AssignStudentsToLecturerDialog } from "./components/assign-students-to-lecturer";
import { Student } from "@/types/user/student";
import { Lecturer } from "@/types/user/lecturer";

type LecturerListSectionProps = {
   students: Student[];
   lecturers: Lecturer[];
}

export async function LecturerListSection({
   students,
   lecturers
}: LecturerListSectionProps) {

   return (
      <section className="py-12 border-b">
         <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-bold tracking-tight">Lecturer Directory</h2>
                  <p className="text-muted-foreground mt-1">All registered lecturers in the pendikom system.</p>
               </div>
               <AssignStudentsToLecturerDialog lecturers={lecturers} students={students} />
            </div>
            <LecturerTable lecturers={lecturers} />
         </div>
      </section>
   )
}