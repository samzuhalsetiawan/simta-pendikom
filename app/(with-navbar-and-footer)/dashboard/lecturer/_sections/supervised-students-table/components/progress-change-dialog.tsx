"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";
import { ThesisStatus, thesisStatus } from "@/types/thesis";
import { useState, useTransition } from "react";
import { updateThesisProgressAction } from "@/actions/update-thesis-progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusLabels: Record<ThesisStatus, string> = {
   pengajuan_proposal: "Pengajuan Proposal",
   seminar_proposal: "Seminar Proposal",
   penelitian: "Penelitian",
   seminar_hasil: "Seminar Hasil",
   pendadaran: "Pendadaran",
   lulus: "Lulus",
};

const getStatusColor = (status: ThesisStatus) => {
   switch (status) {
      case "lulus":
      case "pendadaran":
         return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "seminar_hasil":
      case "penelitian":
         return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "seminar_proposal":
         return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "pengajuan_proposal":
         return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
         return "bg-gray-100 text-gray-700";
   }
};

interface ProgressChangeDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   thesisId: number;
   studentName: string;
   currentProgress: ThesisStatus;
}

export function ProgressChangeDialog({
   open,
   onOpenChange,
   thesisId,
   studentName,
   currentProgress,
}: ProgressChangeDialogProps) {
   const [isPending, startTransition] = useTransition();

   // Default to next step if available
   const currentIndex = thesisStatus.indexOf(currentProgress);
   const defaultNext = currentIndex < thesisStatus.length - 1
      ? thesisStatus[currentIndex + 1]
      : currentProgress;

   const [newProgress, setNewProgress] = useState<ThesisStatus>(defaultNext);

   const handleConfirm = () => {
      if (newProgress === currentProgress) {
         toast.error("Pilih progress yang berbeda");
         return;
      }

      startTransition(async () => {
         const result = await updateThesisProgressAction(undefined, {
            thesisId,
            newProgress
         });

         if (result.success) {
            toast.success(result.message);
            onOpenChange(false);
         } else {
            toast.error(result.message);
         }
      });
   };

   return (
      <Dialog open={open} onOpenChange={(open) => !isPending && onOpenChange(open)}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Ubah Progress Skripsi</DialogTitle>
               <DialogDescription>
                  Ubah progress skripsi untuk mahasiswa <strong>{studentName}</strong>
               </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-4 py-6">
               {/* Current Progress (Left) */}
               <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Progress Saat Ini</p>
                  <div className="flex justify-center">
                     <Badge
                        variant="secondary"
                        className={cn("text-sm px-4 py-2", getStatusColor(currentProgress))}
                     >
                        {statusLabels[currentProgress]}
                     </Badge>
                  </div>
               </div>

               {/* Arrow */}
               <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
               </div>

               {/* New Progress (Right) */}
               <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Progress Baru</p>
                  <Select
                     value={newProgress}
                     onValueChange={(value) => setNewProgress(value as ThesisStatus)}
                     disabled={isPending}
                  >
                     <SelectTrigger className="w-full">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {thesisStatus.map((status) => (
                           <SelectItem
                              key={status}
                              value={status}
                              disabled={status === currentProgress}
                           >
                              {statusLabels[status]}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                  Batal
               </Button>
               <Button onClick={handleConfirm} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Konfirmasi
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
