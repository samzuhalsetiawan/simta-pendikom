import { getStudentGenerations } from "@/data/student/get-student-generations";
import { AdminListSection } from "./_section/admin-list/admin-list-section";
import { LecturerListSection } from "./_section/lecturer-list/lecturer-list-section";
import { StudentListSection } from "./_section/student-list/student-list-section";
import { getStudentsByGeneration } from "@/data/student/get-students-by-generation";
import { getLecturers } from "@/data/lecturer/get-lecturers";

interface PageProps {
   searchParams: Promise<{ gen?: string }>;
}

export default async function page({ searchParams }: PageProps) {
   const { gen } = await searchParams;
   const generations = await getStudentGenerations();
   const selectedGeneration = (Number(gen) || undefined) || generations[0] || new Date().getFullYear()
   const students = await getStudentsByGeneration(selectedGeneration);
   const lecturers = await getLecturers();

   return (
      <main className="min-h-screen">
         <AdminListSection />
         <LecturerListSection 
            lecturers={lecturers}
            students={students}
         />
         <StudentListSection
            generations={generations}
            selectedGeneration={selectedGeneration}
            lecturers={lecturers}
            students={students}
         />
      </main>
   )
}
