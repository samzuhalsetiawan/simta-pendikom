"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useState, useTransition } from "react";
import { RequestConsultationDialog } from "./request-consultation-dialog";
import { Supervisor, Examiner } from "@/types/user/lecturer";
import { requestConsultationAction } from "@/actions/request-consultation";
import { toast } from "sonner";

interface ConsultationButtonProps {
   lecturers: (Supervisor | Examiner)[];
}

export function ConsultationButton({ lecturers }: ConsultationButtonProps) {
   const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
   const [isPending, startTransition] = useTransition();

   const handleConsultationSubmit = (data: {
      topic: string;
      datetime: string;
      location: string;
      supervisorId: number; // Keep name as supervisorId in dialog for compatibility, but it refers to any lecturer
   }) => {
      startTransition(async () => {
         const result = await requestConsultationAction(undefined, {
            lecturerId: data.supervisorId,
            datetime: data.datetime,
            location: data.location,
            topic: data.topic
         });

         if (result.success) {
            toast.success(result.message);
            setConsultationDialogOpen(false);
         } else {
            toast.error(result.message);
         }
      });
   };

   return (
      <>
         <Button
            size="lg"
            onClick={() => setConsultationDialogOpen(true)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
         >
            <MessageSquare className="w-5 h-5 mr-2" />
            Request Konsultasi
         </Button>

         {/* Dialogs */}
         <RequestConsultationDialog
            open={consultationDialogOpen}
            onOpenChange={setConsultationDialogOpen}
            supervisors={lecturers}
            onSubmit={handleConsultationSubmit}
            isLoading={isPending}
         />
      </>
   )
}