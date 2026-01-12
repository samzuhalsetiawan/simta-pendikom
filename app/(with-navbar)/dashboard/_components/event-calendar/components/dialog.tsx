import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getEventStyle } from "./body";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";

type CalendarEventDialogProps = {
   isDetailOpen: boolean;
   date: Date;
   events: Event[];
   setIsDetailOpen: (open: boolean) => void;
}

export function CalendarEventDialog({
   isDetailOpen,
   date,
   events,
   setIsDetailOpen
}: CalendarEventDialogProps) {
   return (
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Agenda Details</DialogTitle>
                  <DialogDescription>
                     {format(date, "EEEE, d MMMM yyyy")}
                  </DialogDescription>
               </DialogHeader>
               <div className="py-4">
                  {events && events.length > 0 ? (
                     <div className="space-y-3">
                        {events.map(event => (
                           <div key={event.id} className={cn("p-3 rounded-md border text-sm", getEventStyle(event.type))}>
                              <div className="font-semibold flex justify-between">
                                 <span>{event.type}</span>
                                 <span className="opacity-75">{format(event.date, "HH:mm")}</span>
                              </div>
                              <div className="mt-1 text-xs opacity-90">
                                 Type: <span className="uppercase">{event.type}</span>
                              </div>
                              <div className="mt-2 text-xs opacity-80 border-t border-black/10 pt-2">
                                 Notes: {event.thesis.title || 'No additional notes.'}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center text-muted-foreground py-8">
                        No events scheduled for this time slot.
                        <Button variant="link" className="mt-2 text-green-600 block mx-auto">
                           + Add New Event
                        </Button>
                     </div>
                  )}
               </div>
            </DialogContent>
         </Dialog>
   )
}