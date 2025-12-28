"use client";

import * as React from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type ExamStatus = "Ujian Akhir" | "Seminar Hasil" | "Seminar Proposal";

type Student = {
   id: string;
   name: string;
   avatar: string;
   title: string;
   status: ExamStatus;
   upcomingAgenda: string;
};

const students: Student[] = [
   {
      id: "1",
      name: "Aditya Pratama",
      avatar: "/avatars/student1.png",
      title: "Analisis Pengaruh Literasi Keuangan dan Peng...",
      status: "Ujian Akhir",
      upcomingAgenda: "30/08/2025 10:00 - R Dosen",
   },
   {
      id: "2",
      name: "Bunga Citra Lestari",
      avatar: "/avatars/student2.png",
      title: "Implementasi Algoritma Convolutional Neural...",
      status: "Seminar Hasil",
      upcomingAgenda: "-",
   },
   {
      id: "3",
      name: "Dwi Cahyono",
      avatar: "/avatars/student1.png",
      title: "Hubungan Antara Self-Esteem dengan Intensi...",
      status: "Seminar Proposal",
      upcomingAgenda: "12/12/2025 15:00 - Laboratorium",
   },
];

const getStatusColor = (status: ExamStatus) => {
   switch (status) {
      case "Ujian Akhir":
         return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100/80";
      case "Seminar Hasil":
         return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/80";
      case "Seminar Proposal":
         return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100/80";
      default:
         return "bg-gray-100 text-gray-700";
   }
};

export function ExamTable() {
   const [sortConfig, setSortConfig] = React.useState<{
      key: keyof Student;
      direction: "asc" | "desc";
   } | null>(null);

   const sortedStudents = React.useMemo(() => {
      let sortableStudents = [...students];
      if (sortConfig !== null) {
         sortableStudents.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
               return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
               return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
         });
      }
      return sortableStudents;
   }, [sortConfig]);

   const requestSort = (key: keyof Student) => {
      let direction: "asc" | "desc" = "asc";
      if (
         sortConfig &&
         sortConfig.key === key &&
         sortConfig.direction === "asc"
      ) {
         direction = "desc";
      }
      setSortConfig({ key, direction });
   };

   const getSortIcon = (key: keyof Student) => {
      if (sortConfig?.key !== key) return <div className="flex flex-col"><ChevronUp className="h-2 w-2 opacity-30" /><ChevronDown className="h-2 w-2 opacity-30" /></div>;
      return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
   }

   return (
      <div className="space-y-4">
         <h2 className="text-xl font-semibold">Mahasiswa yang Diuji</h2>
         <div className="rounded-md bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-muted/50">
                  <TableRow>
                     <TableHead className="w-[250px]" onClick={() => requestSort("name")}>
                        <div className="flex items-center gap-1 cursor-pointer select-none group">
                           Nama Mahasiswa {getSortIcon("name")}
                        </div>
                     </TableHead>
                     <TableHead className="w-[300px]" onClick={() => requestSort("title")}>
                        <div className="flex items-center gap-1 cursor-pointer select-none group">
                           Judul {getSortIcon("title")}
                        </div>
                     </TableHead>
                     <TableHead onClick={() => requestSort("status")}>
                        <div className="flex items-center gap-1 cursor-pointer select-none group">
                           Progress {getSortIcon("status")}
                        </div>
                     </TableHead>
                     <TableHead className="text-right" onClick={() => requestSort("upcomingAgenda")}>
                        <div className="flex items-center justify-end gap-1 cursor-pointer select-none group">
                           Upcoming Agenda {getSortIcon("upcomingAgenda")}
                        </div>
                     </TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {sortedStudents.map((student) => (
                     <TableRow key={student.id} className="border-b border-border/50 hover:bg-muted/50">
                        <TableCell className="font-medium">
                           <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                 <AvatarImage src={student.avatar} alt={student.name} />
                                 <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{student.name}</span>
                           </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-muted-foreground text-xs" title={student.title}>
                           {student.title}
                        </TableCell>
                        <TableCell>
                           <Badge
                              variant="secondary"
                              className={cn("font-medium border-0", getStatusColor(student.status))}
                           >
                              {student.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{student.upcomingAgenda}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
