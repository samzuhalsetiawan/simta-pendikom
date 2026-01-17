"use client";

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/user/student";
import { Lecturer, lecturerRoles } from "@/types/user/lecturer";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { assignThesisAction } from "@/actions/assign-lecturer-to-student";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSelectionDialog } from "@/components/common/user-selection-dialog/user-selection-dialog";
import { ProfileCard } from "@/components/common/profile-card/profile-card";

interface AssignLecturersToStudentDialogProps {
   students: Student[];
   lecturers: Lecturer[];
}

export function AssignLecturersToStudentDialog({
   students,
   lecturers,
}: AssignLecturersToStudentDialogProps) {
   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
   const [listOfSupervisor, setListOfSupervisor] = useState<Lecturer[]>([]);
   const [listOfExaminer, setListOfExaminer] = useState<Lecturer[]>([]);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);

   const handleAddSupervisor = (lecturer: Lecturer) => {
      if (listOfSupervisor.find((supervisor) => supervisor.id === lecturer.id)) return;
      setListOfSupervisor([...listOfSupervisor, lecturer]);
   };

   const handleAddExaminer = (lecturer: Lecturer) => {
      if (listOfExaminer.find((examiner) => examiner.id === lecturer.id)) return;
      setListOfExaminer([...listOfExaminer, lecturer]);
   };

   const handleSubmit = async () => {
      if (!selectedStudent) {
         toast.error("Please select a student");
         return;
      }

      setIsSubmitting(true);

      const assignments = [
         ...listOfSupervisor.map((supervisor, index) => ({
            lecturerId: supervisor.id,
            studentId: selectedStudent.id,
            role: "pembimbing" as const,
            isMain: index === 0
         })),
         ...listOfExaminer.map((examiner) => ({
            lecturerId: examiner.id,
            studentId: selectedStudent.id,
            role: "penguji" as const,
            isMain: false
         })),
      ];

      const result = await assignThesisAction(undefined, assignments);

      if (result.success) {
         toast.success(result.message);
         setIsMainDialogOpen(false);
      } else {
         toast.error(result.message);
      }
      setIsSubmitting(false);
   };

   return (
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
         <DialogTrigger asChild>
            <Button variant="outline" size="sm">
               <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
               Assign Lecturers
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[700px] max-h-[calc(100%-3em)]">
            <DialogHeader>
               <DialogTitle>Thesis Assignment</DialogTitle>
               <DialogDescription>
                  Assign supervisors and examiners to a student for their thesis project.
               </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
               <div className="space-y-2">
                  <label className="block text-sm font-medium">Select Student</label>
                  <UserSelectionDialog 
                     users={students}
                     onUserSelected={(user) => {
                        if (!('nim' in user)) return;
                        setSelectedStudent(user)
                     }}
                  />
               </div>
               <div className="grid grid-cols-2 gap-6 border-t pt-4">
                  {lecturerRoles.map(lecturerRole => {
                     return (
                        <div key={lecturerRole} className="flex flex-col gap-2">
                           <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2">
                                 <h4 className="text-sm font-semibold">
                                    {lecturerRole === "pembimbing" ? "Pembimbing" : "Penguji"}
                                 </h4>
                                 {lecturerRole === "pembimbing" && listOfSupervisor.length > 0 && <Badge>{listOfSupervisor.length}</Badge>}
                                 {lecturerRole === "penguji" && listOfExaminer.length > 0 && <Badge>{listOfExaminer.length}</Badge>}
                              </div>
                              <UserSelectionDialog
                                 users={lecturers}
                                 onUserSelected={(user) => {
                                    if (!('nip' in user)) return
                                    switch (lecturerRole) {
                                       case "pembimbing":
                                          return handleAddSupervisor(user)
                                       case "penguji":
                                          return handleAddExaminer(user)
                                    }
                                 }}
                                 trigger={
                                    <Button variant="ghost" size="icon-xs" className="h-6 w-6 rounded-full border">
                                       <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3" />
                                    </Button>
                                 }
                              />
                           </div>
                           <ScrollArea className="max-h-[200px]">
                              <div className="flex flex-col p-1 gap-2">
                                 {lecturerRole === "pembimbing" ? (listOfSupervisor.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No superviser added</p>
                                 ) : (
                                    listOfSupervisor.map((supervisor) => (
                                       <ProfileCard key={supervisor.id} user={supervisor} />
                                    ))
                                 )) : lecturerRole === "penguji" ? (listOfExaminer.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No examiner added</p>
                                 ) : (
                                    listOfExaminer.map((examiner) => (
                                       <ProfileCard key={examiner.id} user={examiner} />
                                    ))
                                 )) : <></>}
                              </div>
                           </ScrollArea>
                        </div>
                     )
                  })}
               </div>
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={() => setIsMainDialogOpen(false)}>
                  Cancel
               </Button>
               <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Assign"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
