"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useState } from "react";
import { RequestConsultationDialog } from "./request-consultation-dialog";
import { Supervisor } from "@/types/lecturer";

const DUMMY_SUPERVISORS: Supervisor[] = [
   { id: 1, name: "Dr. Ahmad Fauzi, M.Kom", nip: "198505152010121001", role: "Pembimbing" as const, image: "/avatars/default.png" },
   { id: 2, name: "Dr. Siti Rahmawati, M.T", nip: "198703202012122002", role: "Pembimbing" as const },
];

export function ConsultationButton() {
   const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);

   const handleConsultationSubmit = (data: any) => {
      console.log("Consultation request:", data);
      // In real implementation, this would call an API
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
            supervisors={DUMMY_SUPERVISORS}
            onSubmit={handleConsultationSubmit}
         />
      </>
   )
}