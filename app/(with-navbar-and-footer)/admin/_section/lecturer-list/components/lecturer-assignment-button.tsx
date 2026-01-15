"use client"

import { AddStudentModal } from "@/components/common/add-student/AddStudentModal";
import { Button } from "@/components/ui/button";

export function LecturerAssignmentButton() {
   return (
      <>
         <AddStudentModal
            lecturerId={1}
            role="pembimbing"
            excludeStudentIds={[]}
            onStudentAdded={() => {}}
         />
      </>
   )
}