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
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, Award } from "lucide-react";
import { use, useState } from "react";

type ImportantSectionProps = {
  needApprovalsPromise: Promise<Event[]>;
  passConfirmationsPromise: Promise<Event[]>;
};

export function ImportantSection({
  needApprovalsPromise,
  passConfirmationsPromise,
}: ImportantSectionProps) {
  const needApprovals = use(needApprovalsPromise);
  const passConfirmations = use(passConfirmationsPromise);
  const [isOpen, setIsOpen] = useState(true);

  const totalItems = needApprovals.length + passConfirmations.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Penting</h2>
          <Badge
            variant="destructive"
            className="rounded-full px-2 py-0.5 text-xs"
          >
            {totalItems}
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
        <div className="space-y-6">
          {/* Pass Confirmations - prioritized at top */}
          {passConfirmations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Konfirmasi Kelulusan
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {passConfirmations.map((event) => (
                  <PassConfirmationCard key={`pass-${event.id}`} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Approval Requests */}
          {needApprovals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Permintaan Persetujuan
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {needApprovals.map((pendingApproval) => (
                  <ApprovalCard key={`approval-${pendingApproval.id}`} event={pendingApproval} />
                ))}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada item yang perlu ditindaklanjuti
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Separate component for each card to handle state independently
import { respondConsultationAction } from "@/actions/respond-consultation";
import { respondEventAction } from "@/actions/respond-event";
import { toast } from "sonner";
import { useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const eventTypeLabels: Record<string, string> = {
  konsultasi: "Konsultasi",
  seminar_proposal: "Seminar Proposal",
  seminar_hasil: "Seminar Hasil",
  pendadaran: "Pendadaran",
};

function ApprovalCard({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isConfirmAcceptOpen, setIsConfirmAcceptOpen] = useState(false);

  const isConsultation = event.type === 'konsultasi';
  const eventLabel = eventTypeLabels[event.type] || event.type;

  const handleRespond = (response: "accepted" | "rejected" | "approved", note?: string) => {
    startTransition(async () => {
      if (isConsultation) {
        // Handle consultation approval
        const result = await respondConsultationAction(undefined, {
          consultationId: event.id,
          response: response === "approved" ? "accepted" : response as "accepted" | "rejected",
          note
        });

        if (result.success) {
          toast.success(result.message);
          setIsRejectDialogOpen(false);
          setIsConfirmAcceptOpen(false);
        } else {
          toast.error(result.message);
        }
      } else {
        // Handle event approval (seminar/pendadaran)
        const result = await respondEventAction(undefined, {
          eventId: event.id,
          response: response === "accepted" ? "approved" : response as "approved" | "rejected"
        });

        if (result.success) {
          toast.success(result.message);
          setIsRejectDialogOpen(false);
          setIsConfirmAcceptOpen(false);
        } else {
          toast.error(result.message);
        }
      }
    });
  };

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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">
                {event.thesis.student.name}
              </h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {eventLabel}
              </Badge>
            </div>
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
                  <DialogTitle>Terima {eventLabel}?</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin menerima permintaan {eventLabel.toLowerCase()} ini?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmAcceptOpen(false)}>Batal</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleRespond(isConsultation ? "accepted" : "approved")}>
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
                  <DialogTitle>Tolak {eventLabel}</DialogTitle>
                  <DialogDescription>
                    {isConsultation
                      ? "Berikan alasan penolakan (opsional) untuk mahasiswa."
                      : "Apakah Anda yakin ingin menolak jadwal ini?"}
                  </DialogDescription>
                </DialogHeader>
                {isConsultation && (
                  <div className="py-4">
                    <Textarea
                      placeholder="Contoh: Maaf saya ada rapat mendadak di jam tersebut."
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
                  <Button variant="destructive" onClick={() => handleRespond("rejected", isConsultation ? rejectNote : undefined)}>
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

// Pass Confirmation Card - for main supervisors to determine pass/fail
import { respondEventPassAction } from "@/actions/respond-event-pass";
import { CheckCircle, XCircle } from "lucide-react";

const passEventTypeLabels: Record<string, string> = {
  seminar_proposal: "Seminar Proposal",
  seminar_hasil: "Seminar Hasil",
  pendadaran: "Pendadaran",
};

function PassConfirmationCard({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [isPassDialogOpen, setIsPassDialogOpen] = useState(false);
  const [isFailDialogOpen, setIsFailDialogOpen] = useState(false);

  const eventLabel = passEventTypeLabels[event.type] || event.type;

  const handlePassFail = (response: "pass" | "fail") => {
    startTransition(async () => {
      const result = await respondEventPassAction(undefined, {
        eventId: event.id,
        response
      });

      if (result.success) {
        toast.success(result.message);
        setIsPassDialogOpen(false);
        setIsFailDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="border-none shadow-sm bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 dark:bg-zinc-900">
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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">
                {event.thesis.student.name}
              </h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-100 dark:bg-purple-900/30">
                {eventLabel}
              </Badge>
            </div>
            <p className="text-xs font-medium text-muted-foreground line-clamp-1" title={event.thesis.title}>
              {event.thesis.title}
            </p>
            <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
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
            </div>
          </div>
          <div className="flex flex-col self-stretch justify-center gap-2">
            <Dialog open={isPassDialogOpen} onOpenChange={setIsPassDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs px-4"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="h-3 w-3 mr-1" /> Lulus</>}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Kelulusan</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin mahasiswa <strong>{event.thesis.student.name}</strong> LULUS {eventLabel.toLowerCase()}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPassDialogOpen(false)}>Batal</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handlePassFail("pass")}>
                    Ya, Lulus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isFailDialogOpen} onOpenChange={setIsFailDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><XCircle className="h-3 w-3 mr-1" /> Gagal</>}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Tidak Lulus</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin mahasiswa <strong>{event.thesis.student.name}</strong> TIDAK LULUS {eventLabel.toLowerCase()}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFailDialogOpen(false)}>Batal</Button>
                  <Button variant="destructive" onClick={() => handlePassFail("fail")}>
                    Ya, Tidak Lulus
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

