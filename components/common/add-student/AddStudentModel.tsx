"use client";

import React, { useState, useEffect } from "react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loading03Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface Student {
   id: number;
   nim: string;
   name: string;
}

interface AddStudentModalProps {
   lecturerId: number;
   role: "pembimbing" | "penguji";
   excludeStudentIds?: number[];
   onStudentAdded?: () => void;
}

export function AddStudentModal({ lecturerId, role, excludeStudentIds, onStudentAdded }: AddStudentModalProps) {
   const [students, setStudents] = useState<Student[]>([]);
   const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isFetching, setIsFetching] = useState(true);
   const [open, setOpen] = React.useState(false)

   useEffect(() => {
      async function fetchAvailableStudents() {
         try {
            const response = await fetch("/api/students");
            const { data } = await response.json();
            setStudents(data.filter((student: Student) =>
               !excludeStudentIds || !excludeStudentIds.includes(student.id)
            ));
         } catch (error) {
            console.error("Gagal mengambil data mahasiswa:", error);
         } finally {
            setIsFetching(false);
         }
      }
      fetchAvailableStudents();
   }, [excludeStudentIds]);

   const handleAddStudent = async () => {
      if (!selectedStudentId) return;

      setIsLoading(true);
      const promise = fetch("/api/assign-lecturer", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            lecturerId: lecturerId,
            studentId: selectedStudentId,
            role: role,
         }),
      }).then(async (res) => {
         const data = await res.json();
         if (!res.ok) throw new Error(data.message || "Gagal menambahkan mahasiswa");
         return data;
      });

      toast.promise(promise, {
         loading: 'Sedang memproses penugasan...',
         success: () => {
            setOpen(false);
            setIsLoading(false);
            onStudentAdded && onStudentAdded();
            return "Mahasiswa berhasil ditambahkan!";
         },
         error: (err) => {
            setOpen(false);
            setIsLoading(false);
            return err.message;
         },
      });
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
               <HugeiconsIcon icon={PlusSignIcon} /> Tambah Mahasiswa
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Pilih Mahasiswa Bimbingan</DialogTitle>
            </DialogHeader>

            <div className="py-4">
               <ScrollArea className="h-[300px] border rounded-md p-2">
                  {isFetching ? (
                     <div className="flex justify-center p-4">
                        <HugeiconsIcon icon={Loading03Icon} />
                     </div>
                  ) : (
                     <div className="space-y-2">
                        {students.map((student) => (
                           <div
                              key={student.id}
                              onClick={() => setSelectedStudentId(student.id)}
                              className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedStudentId === student.id
                                    ? "bg-primary/10 border-primary ring-1 ring-primary"
                                    : "hover:bg-accent border-transparent"
                                 }`}
                           >
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.nim}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </ScrollArea>
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <DialogClose asChild>
                  <Button variant="ghost">Batal</Button>
               </DialogClose>
               <Button
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId || isLoading}
                  className="min-w-[120px]"
               >
                  {isLoading ? (
                     <HugeiconsIcon icon={Loading03Icon} />
                  ) : (
                     "Tambahkan"
                  )}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
}