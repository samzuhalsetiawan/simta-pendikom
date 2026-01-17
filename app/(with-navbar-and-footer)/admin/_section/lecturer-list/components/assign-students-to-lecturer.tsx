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

interface AssignStudentsToLecturerDialogProps {
   students: Student[];
   lecturers: Lecturer[];
}

export function AssignStudentsToLecturerDialog({
   students,
   lecturers,
}: AssignStudentsToLecturerDialogProps) {
   const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
   const [listOfSupervised, setListOfSupervised] = useState<Student[]>([]);
   const [listOfExamined, setListOfExamined] = useState<Student[]>([]);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);

   const handleAddSupervised = (student: Student) => {
      if (listOfSupervised.find((supervised) => supervised.id === student.id)) return;
      setListOfSupervised([...listOfSupervised, student]);
   };

   const handleAddExamined = (student: Student) => {
      if (listOfExamined.find((examined) => examined.id === student.id)) return;
      setListOfExamined([...listOfExamined, student]);
   };

   const handleSubmit = async () => {
      if (!selectedLecturer) {
         toast.error("Please select a lecturer");
         return;
      }

      setIsSubmitting(true);

      const assignments = [
         ...listOfSupervised.map((supervised, index) => ({
            lecturerId: selectedLecturer.id,
            studentId: supervised.id,
            role: "pembimbing" as const,
            isMain: index === 0
         })),
         ...listOfExamined.map((examined) => ({
            lecturerId: selectedLecturer.id,
            studentId: examined.id,
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
               Assign Students
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
                  <label className="block text-sm font-medium">Select Lecturer</label>
                  <UserSelectionDialog 
                     users={lecturers}
                     onUserSelected={(user) => {
                        if (!('nip' in user)) return;
                        setSelectedLecturer(user)
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
                                    {lecturerRole === "pembimbing" ? "Bimbingan" : "Diujikan"}
                                 </h4>
                                 {lecturerRole === "pembimbing" && listOfSupervised.length > 0 && <Badge>{listOfSupervised.length}</Badge>}
                                 {lecturerRole === "penguji" && listOfExamined.length > 0 && <Badge>{listOfExamined.length}</Badge>}
                              </div>
                              <UserSelectionDialog
                                 users={students}
                                 onUserSelected={(user) => {
                                    if (!('nim' in user)) return
                                    switch (lecturerRole) {
                                       case "pembimbing":
                                          return handleAddSupervised(user)
                                       case "penguji":
                                          return handleAddExamined(user)
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
                                 {lecturerRole === "pembimbing" ? (listOfSupervised.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No supervised added</p>
                                 ) : (
                                    listOfSupervised.map((supervised) => (
                                       <ProfileCard key={supervised.id} user={supervised} />
                                    ))
                                 )) : lecturerRole === "penguji" ? (listOfExamined.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No examined added</p>
                                 ) : (
                                    listOfExamined.map((examined) => (
                                       <ProfileCard key={examined.id} user={examined} />
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
