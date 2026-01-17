"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types/event/event";
import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";
import { use, useState } from "react";

type ImportantSectionProps = {
  needApprovalsPromise: Promise<Event[]>;
};

export function ImportantSection({
  needApprovalsPromise,
}: ImportantSectionProps) {
  const needApprovals = use(needApprovalsPromise);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Penting</h2>
          <Badge
            variant="destructive"
            className="rounded-full px-2 py-0.5 text-xs"
          >
            {needApprovals.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 rounded-full"
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {needApprovals.map((pendingApproval) => (
            <ApprovalCard key={pendingApproval.id} event={pendingApproval} />
          ))}
        </div>
      )}
    </section>
  );
}

// Separate component for each card to handle state independently
import { respondConsultationAction } from "@/actions/respond-consultation";
import { toast } from "sonner";
import { useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

function ApprovalCard({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isConfirmAcceptOpen, setIsConfirmAcceptOpen] = useState(false);

  const handleRespond = (response: "accepted" | "rejected", note?: string) => {
    startTransition(async () => {
      // Assuming event type 'konsultasi' maps to a consultation table ID
      // Currently getLecturerNeedApproval maps consultations to Event type with type='konsultasi'
      // We need to ensure we're passing the correct ID. 
      // For 'konsultasi', event.id is consultation.id.
      const result = await respondConsultationAction(undefined, {
        consultationId: event.id,
        response,
        note
      });

      if (result.success) {
        toast.success(result.message);
        setIsRejectDialogOpen(false);
        setIsConfirmAcceptOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Only handle consultations for now as requested
  if (event.type !== 'konsultasi') {
    return null; // Or render generic card without actions if needed, but important section implies actionable
  }

  return (
    <Card
      className="border-none shadow-sm bg-white dark:bg-zinc-900"
    >
      <CardContent>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage
              src={event.thesis.student.image}
              alt={event.thesis.student.name}
            />
            <AvatarFallback>
              {event.thesis.student.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 flex-1">
            <h3 className="font-semibold text-sm">
              {event.thesis.student.name}
            </h3>
            <p
              className="text-xs font-medium text-muted-foreground line-clamp-1"
              title={event.thesis.title}
            >
              {event.thesis.title}
            </p>
            <div className="flex flex-col gap-1 lg:gap-1.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(event.date, "dd MMMM yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(event.date, "HH:mm")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
              {event.topic && (
                <span className="flex items-start gap-1 mt-1 font-medium text-xs text-foreground bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded">
                  Note: {event.topic}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col self-stretch justify-center gap-2">
            <Dialog open={isConfirmAcceptOpen} onOpenChange={setIsConfirmAcceptOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs px-4"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Terima"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terima Konsultasi?</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin menerima permintaan konsultasi ini?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmAcceptOpen(false)}>Batal</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleRespond("accepted")}>
                    Ya, Terima
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tolak"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tolak Konsultasi</DialogTitle>
                  <DialogDescription>
                    Berikan alasan penolakan (opsional) untuk mahasiswa.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Contoh: Maaf saya ada rapat mendadak di jam tersebut."
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
                  <Button variant="destructive" onClick={() => handleRespond("rejected", rejectNote)}>
                    Tolak Permintaan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
