"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarClock } from "lucide-react";

interface ScheduleEventDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   eventType: "Seminar Proposal" | "Seminar Hasil" | "Ujian Akhir";
   onSubmit?: (data: {
      datetime: string;
      location: string;
      notes?: string;
   }) => void;
}

export function ScheduleEventDialog({
   open,
   onOpenChange,
   eventType,
   onSubmit
}: ScheduleEventDialogProps) {
   const [datetime, setDatetime] = useState("");
   const [location, setLocation] = useState("");
   const [notes, setNotes] = useState("");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (datetime && location) {
         onSubmit?.({
            datetime,
            location,
            notes: notes || undefined
         });
         // Reset form
         setDatetime("");
         setLocation("");
         setNotes("");
         onOpenChange(false);
      }
   };

   const handleCancel = () => {
      setDatetime("");
      setLocation("");
      setNotes("");
      onOpenChange(false);
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  Jadwalkan {eventType}
               </DialogTitle>
               <DialogDescription>
                  Tentukan jadwal untuk {eventType.toLowerCase()} Anda
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
                     />
                  </div>
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                     Batal
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                     Jadwalkan {eventType}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
