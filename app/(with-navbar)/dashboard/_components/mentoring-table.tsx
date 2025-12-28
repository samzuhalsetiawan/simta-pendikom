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

type StudentStatus =
   | "Selesai"
   | "Ujian Akhir"
   | "Seminar Hasil"
   | "Penelitian"
   | "Seminar Proposal"
   | "Pengajuan Judul";

type Student = {
   id: string;
   name: string;
   avatar: string;
   title: string;
   status: StudentStatus;
   consultations: string;
   update: string;
};

const students: Student[] = [
   {
      id: "1",
      name: "Aditya Pratama",
      avatar: "/avatars/student1.png",
      title: "Analisis Pengaruh Literasi Keuangan dan Peng...",
      status: "Selesai",
      consultations: "48 Kali",
      update: "30/01/2025",
   },
   {
      id: "2",
      name: "Bunga Citra Lestari",
      avatar: "/avatars/student2.png",
      title: "Implementasi Algoritma Convolutional Neural...",
      status: "Ujian Akhir",
      consultations: "20 Kali",
      update: "1/10/2025",
   },
   {
      id: "3",
      name: "Dwi Cahyono",
      avatar: "/avatars/student1.png",
      title: "Hubungan Antara Self-Esteem dengan Intensi...",
      status: "Seminar Hasil",
      consultations: "23 Kali",
      update: "12/10/2025",
   },
   {
      id: "4",
      name: "Fajri Ramadhan",
      avatar: "/avatars/student1.png",
      title: "Tinjauan Yuridis Penegakan Hukum Terhadap ...",
      status: "Penelitian",
      consultations: "24 Kali",
      update: "1/10/2025",
   },
   {
      id: "5",
      name: "Gita Permata",
      avatar: "/avatars/student2.png",
      title: "Pengaruh Penambahan Serbuk Abu Ampas Te...",
      status: "Seminar Proposal",
      consultations: "18 Kali",
      update: "12/10/2025",
   },
   {
      id: "6",
      name: "Hendra Wijaya",
      avatar: "/avatars/student1.png",
      title: "Strategi Komunikasi Pemasaran Digital UMKM...",
      status: "Pengajuan Judul",
      consultations: "12 Kali",
      update: "1/10/2025",
   },
];

const getStatusColor = (status: StudentStatus) => {
   switch (status) {
      case "Selesai":
      case "Ujian Akhir":
         return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100/80";
      case "Seminar Hasil":
      case "Penelitian":
         return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/80";
      case "Seminar Proposal":
         return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100/80";
      case "Pengajuan Judul":
         return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80";
      default:
         return "bg-gray-100 text-gray-700";
   }
};

export function MentoringTable() {
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
         <h2 className="text-xl font-semibold">Mahasiswa Bimbingan</h2>
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
                     <TableHead onClick={() => requestSort("consultations")}>
                        <div className="flex items-center gap-1 cursor-pointer select-none group">
                           Konsultasi {getSortIcon("consultations")}
                        </div>
                     </TableHead>
                     <TableHead className="text-right" onClick={() => requestSort("update")}>
                        <div className="flex items-center justify-end gap-1 cursor-pointer select-none group">
                           Update {getSortIcon("update")}
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
                        <TableCell className="text-sm">{student.consultations}</TableCell>
                        <TableCell className="text-right text-sm">{student.update}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
