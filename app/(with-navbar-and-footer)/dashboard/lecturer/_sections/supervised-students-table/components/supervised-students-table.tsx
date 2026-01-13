"use client";

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
import { Thesis, ThesisStatus } from "@/types/thesis";
import { useMemo, useState } from "react";

const getStatusColor = (status: ThesisStatus) => {
  switch (status) {
    case "lulus":
    case "pendadaran":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100/80";
    case "seminar_hasil":
    case "penelitian":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/80";
    case "seminar_proposal":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100/80";
    case "pengajuan_proposal":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

type SortOption = "name" | "title" | "status" | "consultations" | "update";
type SortDirection = "asc" | "desc";

const statusWeights: Record<ThesisStatus, number> = {
  pengajuan_proposal: 1,
  seminar_proposal: 2,
  penelitian: 3,
  seminar_hasil: 4,
  pendadaran: 5,
  lulus: 6,
};

interface SupervisedStudentsTableProps {
  studentsThesis: Thesis[];
}

export function SupervisedStudentsTable({
  studentsThesis,
}: SupervisedStudentsTableProps) {
  const [sortOption, setSorOption] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedStudentsThesis = useMemo(() => {
    return [...studentsThesis].sort((a, b) => {
      switch (sortOption) {
        case "name":
          if (sortDirection === "asc") {
            return a.student.name.localeCompare(b.student.name);
          } else {
            return b.student.name.localeCompare(a.student.name);
          }
        case "title":
          if (!a.title && b.title) {
            return sortDirection === "asc" ? -1 : 1;
          } else if (!b.title && a.title) {
            return sortDirection === "asc" ? 1 : -1;
          } else if (!a.title && !b.title) {
            return 0;
          } else if (sortDirection === "asc") {
            return a.title!.localeCompare(b.title!);
          } else {
            return b.title!.localeCompare(a.title!);
          }
        case "consultations":
          return 0; // Placeholder, as consultations data is not available

        case "status":
          if (sortDirection === "asc") {
            return statusWeights[a.progress] - statusWeights[b.progress];
          } else {
            return statusWeights[b.progress] - statusWeights[a.progress];
          }

        case "update":
          return 0; // Placeholder, as update data is not available
      }
    });
  }, [sortOption, sortDirection, studentsThesis]);

  const getSortIcon = (key: SortOption) => {
    if (sortOption !== key)
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-2 w-2 opacity-30" />
          <ChevronDown className="h-2 w-2 opacity-30" />
        </div>
      );
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mahasiswa Bimbingan</h2>
      <div className="rounded-md bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead
                className="w-[250px]"
                onClick={() => {
                  setSorOption("name");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1 cursor-pointer select-none group">
                  Nama Mahasiswa {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="w-[300px]"
                onClick={() => {
                  setSorOption("title");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1 cursor-pointer select-none group">
                  Judul {getSortIcon("title")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => {
                  setSorOption("status");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1 cursor-pointer select-none group">
                  Progress {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => {
                  setSorOption("consultations");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1 cursor-pointer select-none group">
                  Konsultasi {getSortIcon("consultations")}
                </div>
              </TableHead>
              <TableHead
                className="text-right"
                onClick={() => {
                  setSorOption("update");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center justify-end gap-1 cursor-pointer select-none group">
                  Update {getSortIcon("update")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudentsThesis.map((studentThesis) => (
              <TableRow
                key={studentThesis.id}
                className="border-b border-border/50 hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={studentThesis.student.image}
                        alt={studentThesis.student.name}
                      />
                      <AvatarFallback>
                        {studentThesis.student.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {studentThesis.student.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className="max-w-[300px] truncate text-muted-foreground text-xs"
                  title={
                    studentThesis.title === null
                      ? undefined
                      : studentThesis.title
                  }
                >
                  {studentThesis.title}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-medium border-0",
                      getStatusColor(studentThesis.progress)
                    )}
                  >
                    {studentThesis.progress.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {0 /* Placeholder, as consultations data is not available */}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {"-" /* Placeholder, as update data is not available */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
