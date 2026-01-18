"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, isBefore } from "date-fns";
import { Calendar, MapPin, User, BookOpen, Users, Loader2 } from "lucide-react";
import { Pendadaran } from "@/types/event/pendadaran";
import { useEventRegistration } from "@/hooks/data-fetcher/registration";
import { toast } from "sonner";

type PendadaranEventDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   event: Pendadaran | null;
   currentStudentId: number;
};

export function PendadaranEventDialog({
   open,
   onOpenChange,
   event,
   currentStudentId
}: PendadaranEventDialogProps) {
   const { isRegistered, isLoading: isCheckingRegistration, register, isRegistering } = useEventRegistration(event?.id ?? null);

   if (!event) return null;

   const isThesisOwner = event.thesis.student.id === currentStudentId;
   const isEventStarted = isBefore(event.date, new Date());
   const showRegisterButton = !isThesisOwner && !isEventStarted;

   const handleRegister = async () => {
      const result = await register();
      if (result.success) {
         toast.success(result.message);
      } else {
         toast.error(result.message);
      }
   };

   const supervisors = event.thesis.lecturers.filter(l => l.role === "pembimbing");
   const examiners = event.thesis.lecturers.filter(l => l.role === "penguji");

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[500px] bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800">
            <DialogHeader>
               <DialogTitle className="text-pink-900 dark:text-pink-100">
                  Pendadaran Details
               </DialogTitle>
               <DialogDescription className="text-pink-700 dark:text-pink-300">
                  Final defense event information
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               {/* Date & Time */}
               <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-pink-800 dark:text-pink-200">
                     {format(event.date, "EEEE, d MMMM yyyy 'at' HH:mm")}
                  </span>
               </div>

               {/* Location */}
               <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-pink-800 dark:text-pink-200">{event.location}</span>
               </div>

               {/* Student */}
               <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-pink-800 dark:text-pink-200">
                     {event.thesis.student.name} ({event.thesis.student.nim})
                  </span>
               </div>

               {/* Thesis Title */}
               <div className="flex items-start gap-3 text-sm border-t border-pink-200 dark:border-pink-800 pt-4">
                  <BookOpen className="h-4 w-4 text-pink-600 dark:text-pink-400 mt-0.5" />
                  <div>
                     <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">Thesis Title</p>
                     <p className="text-pink-800 dark:text-pink-200">
                        {event.thesis.title || "Untitled Thesis"}
                     </p>
                  </div>
               </div>

               {/* Supervisors */}
               {supervisors.length > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                     <Users className="h-4 w-4 text-pink-600 dark:text-pink-400 mt-0.5" />
                     <div>
                        <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">Supervisors</p>
                        <div className="space-y-1">
                           {supervisors.map(s => (
                              <p key={s.id} className="text-pink-800 dark:text-pink-200">
                                 {s.name} {s.isMain && <span className="text-xs text-pink-500">(Main)</span>}
                              </p>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* Examiners */}
               {examiners.length > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                     <Users className="h-4 w-4 text-pink-600 dark:text-pink-400 mt-0.5" />
                     <div>
                        <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">Examiners</p>
                        <div className="space-y-1">
                           {examiners.map(e => (
                              <p key={e.id} className="text-pink-800 dark:text-pink-200">{e.name}</p>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* Register Button */}
               {showRegisterButton && (
                  <div className="pt-4 border-t border-pink-200 dark:border-pink-800">
                     <Button
                        onClick={handleRegister}
                        disabled={isCheckingRegistration || isRegistering || isRegistered}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                     >
                        {isCheckingRegistration || isRegistering ? (
                           <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isRegistering ? "Registering..." : "Checking..."}
                           </>
                        ) : isRegistered ? (
                           "Registered for this event"
                        ) : (
                           "Register as Participant"
                        )}
                     </Button>
                  </div>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
}
