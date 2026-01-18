"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarClock, Loader2 } from "lucide-react";
import { EventType } from "@/types/event/event";

const eventLabels: Record<Exclude<EventType, "konsultasi">, string> = {
   seminar_proposal: "Seminar Proposal",
   seminar_hasil: "Seminar Hasil",
   pendadaran: "Pendadaran",
};

interface ScheduleEventDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   eventType: Exclude<EventType, "konsultasi">;
   onSubmit?: (data: {
      datetime: string;
      location: string;
      notes?: string;
   }) => void;
   isLoading?: boolean;
}

export function ScheduleEventDialog({
   open,
   onOpenChange,
   eventType,
   onSubmit,
   isLoading = false
}: ScheduleEventDialogProps) {
   const [datetime, setDatetime] = useState("");
   const [location, setLocation] = useState("");
   const [notes, setNotes] = useState("");

   const eventLabel = eventLabels[eventType];

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (datetime && location) {
         onSubmit?.({
            datetime,
            location,
            notes: notes || undefined
         });
         // Don't reset here, wait for success
      }
   };

   const handleCancel = () => {
      setDatetime("");
      setLocation("");
      setNotes("");
      onOpenChange(false);
   };

   return (
      <Dialog open={open} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  Jadwalkan {eventLabel}
               </DialogTitle>
               <DialogDescription>
                  Tentukan jadwal untuk {eventLabel.toLowerCase()} Anda
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="space-y-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="event-datetime">Waktu <span className="text-red-500">*</span></Label>
                     <Input
                        id="event-datetime"
                        type="datetime-local"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                        required
                        disabled={isLoading}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="event-location">Tempat <span className="text-red-500">*</span></Label>
                     <Input
                        id="event-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ruang Seminar, Aula, dll."
                        required
                        disabled={isLoading}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="event-notes">Catatan Tambahan</Label>
                     <Textarea
                        id="event-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tambahkan catatan jika diperlukan..."
                        className="min-h-[100px]"
                        disabled={isLoading}
                     />
                  </div>
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                     Batal
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Jadwalkan {eventLabel}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

