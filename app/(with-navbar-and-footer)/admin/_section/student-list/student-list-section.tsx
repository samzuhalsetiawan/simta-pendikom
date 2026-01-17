import { getStudentGenerations } from "@/data/student/get-student-generations";
import { getLecturers } from "@/data/lecturer/get-lecturers";
import { StudentTable } from "./components/student-table";
import { StudentPagination } from "./components/student-pagination";
import { AssignLecturersToStudentDialog } from "./components/assign-lecturers-to-student-dialog";
import { getStudentsByGeneration } from "@/data/student/get-students-by-generation";
import { Lecturer } from "@/types/user/lecturer";
import { Student } from "@/types/user/student";

interface StudentListSectionProps {
   generations: number[];
   selectedGeneration: number;
   lecturers: Lecturer[];
   students: Student[];
}

export async function StudentListSection({ 
   generations,
   selectedGeneration,
   lecturers,
   students
 }: StudentListSectionProps) {

   return (
      <section id="student-directory" className="py-12 bg-muted/30">
         <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-bold tracking-tight">Student Directory</h2>
                  <p className="text-muted-foreground mt-1">Manage and view students by their enrollment year.</p>
               </div>
               <AssignLecturersToStudentDialog students={students} lecturers={lecturers} />
            </div>

            <StudentTable students={students} />

            {generations.length > 0 && (
               <StudentPagination
                  generations={generations}
                  currentGeneration={selectedGeneration}
               />
            )}
         </div>
      </section>
   )
}