"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar, MapPin, User, BookOpen, MessageSquare } from "lucide-react";
import { Konsultasi } from "@/types/event/konsultasi";

type KonsultasiEventDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   event: Konsultasi | null;
};

export function KonsultasiEventDialog({
   open,
   onOpenChange,
   event
}: KonsultasiEventDialogProps) {
   if (!event) return null;

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[500px] bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <DialogHeader>
               <DialogTitle className="text-orange-900 dark:text-orange-100">
                  Konsultasi Details
               </DialogTitle>
               <DialogDescription className="text-orange-700 dark:text-orange-300">
                  Consultation session information
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               {/* Date & Time */}
               <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-800 dark:text-orange-200">
                     {format(event.date, "EEEE, d MMMM yyyy 'at' HH:mm")}
                  </span>
               </div>

               {/* Location */}
               <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-800 dark:text-orange-200">{event.location}</span>
               </div>

               {/* Lecturer */}
               <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-800 dark:text-orange-200">
                     {event.lecturer.name}
                  </span>
               </div>

               {/* Topic */}
               {event.topic && (
                  <div className="flex items-start gap-3 text-sm">
                     <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                     <span className="text-orange-800 dark:text-orange-200">{event.topic}</span>
                  </div>
               )}

               {/* Thesis Title */}
               <div className="flex items-start gap-3 text-sm border-t border-orange-200 dark:border-orange-800 pt-4">
                  <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                     <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Thesis Title</p>
                     <p className="text-orange-800 dark:text-orange-200">
                        {event.thesis.title || "Untitled Thesis"}
                     </p>
                  </div>
               </div>

               {/* Status */}
               <div className="flex items-center gap-3 text-sm">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${event.status === "accepted"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : event.status === "rejected"
                           ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                           : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                     }`}>
                     {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
               </div>

               {/* Lecturer Note */}
               {event.lecturerNote && (
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-md text-sm">
                     <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Lecturer Note</p>
                     <p className="text-orange-800 dark:text-orange-200">{event.lecturerNote}</p>
                  </div>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
}
