"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface RequestConsultationDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   supervisors: { id: number; name: string }[];
   onSubmit?: (data: {
      topic: string;
      datetime: string;
      location: string;
      supervisorId: number;
   }) => void;
}

export function RequestConsultationDialog({
   open,
   onOpenChange,
   supervisors,
   onSubmit
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
         // Reset form
         setTopic("");
         setDatetime("");
         setLocation("");
         setSupervisorId("");
         onOpenChange(false);
      }
   };

   const handleCancel = () => {
      setTopic("");
      setDatetime("");
      setLocation("");
      setSupervisorId("");
      onOpenChange(false);
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Request Konsultasi
               </DialogTitle>
               <DialogDescription>
                  Ajukan permintaan konsultasi dengan dosen pembimbing Anda
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="space-y-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="supervisor">Dosen Pembimbing <span className="text-red-500">*</span></Label>
                     <Select value={supervisorId} onValueChange={setSupervisorId} required>
                        <SelectTrigger id="supervisor">
                           <SelectValue placeholder="Pilih dosen pembimbing" />
                        </SelectTrigger>
                        <SelectContent>
                           {supervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                 {supervisor.name}
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
                     />
                  </div>
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                     Batal
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                     Kirim Request
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
