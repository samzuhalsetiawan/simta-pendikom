"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { Examiner, Supervisor } from "@/types/user/lecturer";

interface RequestConsultationDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   supervisors: (Supervisor | Examiner)[]; // Using supervisors prop name but accepts any lecturer
   onSubmit?: (data: {
      topic: string;
      datetime: string;
      location: string;
      supervisorId: number;
   }) => void;
   isLoading?: boolean;
}

export function RequestConsultationDialog({
   open,
   onOpenChange,
   supervisors,
   onSubmit,
   isLoading = false
}: RequestConsultationDialogProps) {
   const [topic, setTopic] = useState("");
   const [datetime, setDatetime] = useState("");
   const [location, setLocation] = useState("");
   const [supervisorId, setSupervisorId] = useState<string>("");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (topic && datetime && location && supervisorId) {
         onSubmit?.({
            topic,
            datetime,
            location,
            supervisorId: parseInt(supervisorId)
         });
         // Don't reset form here, wait for success or close to reset
      }
   };

   const handleCancel = () => {
      // Reset only on cancel/close, not submit
      setTopic("");
      setDatetime("");
      setLocation("");
      setSupervisorId("");
      onOpenChange(false);
   };

   return (
      <Dialog open={open} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Request Konsultasi
               </DialogTitle>
               <DialogDescription>
                  Ajukan permintaan konsultasi dengan dosen Anda
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="space-y-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="supervisor">Dosen <span className="text-red-500">*</span></Label>
                     <Select value={supervisorId} onValueChange={setSupervisorId} required disabled={isLoading}>
                        <SelectTrigger id="supervisor">
                           <SelectValue placeholder="Pilih dosen" />
                        </SelectTrigger>
                        <SelectContent>
                           {supervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                 {supervisor.name} ({supervisor.role === 'pembimbing' ? 'Pembimbing' : 'Penguji'})
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="topic">Topik Konsultasi <span className="text-red-500">*</span></Label>
                     <Textarea
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Jelaskan topik yang ingin dikonsultasikan..."
                        className="min-h-[100px]"
                        required
                        disabled={isLoading}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="datetime">Waktu <span className="text-red-500">*</span></Label>
                     <Input
                        id="datetime"
                        type="datetime-local"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                        required
                        disabled={isLoading}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="location">Tempat <span className="text-red-500">*</span></Label>
                     <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ruang Lab, Zoom, dll."
                        required
                        disabled={isLoading}
                     />
                  </div>
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                     Batal
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Kirim Request
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
