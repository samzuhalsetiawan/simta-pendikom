"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Calendar, MapPin, Clock, Loader2, CheckCircle2, XCircle, X } from "lucide-react"
import { Button } from "@/components/base/button"
import { Input } from "@/components/base/input"
import { Label } from "@/components/base/label"
import { approveSeminarRequest, rejectSeminarRequest, approvePendadaranFinalDocument } from "@/lib/actions/staff-seminar"
import { respondToSeminarRequest } from "@/lib/actions/approval"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ApprovalActionButtons } from "../shared/approval-action-buttons"
import { ApproveDocumentModal } from "../shared/approve-document-modal"
import { RejectDocumentModal } from "../shared/reject-document-modal"
import { ScheduleSeminarModal } from "@/components/Modal/schedule-seminar-modal"

interface SeminarActionControllerProps {
    id: string;
    type: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';
    jenisName: string;
    status: string;
    isStaff?: boolean;
    lecturerApprovalId?: number;
    hasSignature?: boolean;
}

export function SeminarActionController({
    id,
    type,
    jenisName,
    status,
    isStaff = false,
    lecturerApprovalId,
    hasSignature = false
}: SeminarActionControllerProps) {
    const router = useRouter();
    
    // Schedule state
    const [scheduleDate, setScheduleDate] = useState("");
    const [venue, setVenue] = useState("");
    
    // Loading states
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [loadingApproveFinal, setLoadingApproveFinal] = useState(false);
    
    // Modal open states
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isLecturerApproveOpen, setIsLecturerApproveOpen] = useState(false);

    const handleSchedule = async (selectedDate: string, selectedVenue?: string) => {
        setLoadingSchedule(true);
        const res = await approveSeminarRequest(id, type, selectedDate, (selectedVenue || "").trim());
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Seminar berhasil dijadwalkan!");
            setIsScheduleOpen(false);
            router.refresh();
        }
        setLoadingSchedule(false);
    };

    const handleApproveFinalDoc = async () => {
        setLoadingApproveFinal(true);
        const res = await approvePendadaranFinalDocument(id);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Verifikasi akhir sidang skripsi berhasil disetujui!");
            router.refresh();
        }
        setLoadingApproveFinal(false);
    };

    const handleReject = async (reason: string) => {
        let res;
        if (lecturerApprovalId) {
            res = await respondToSeminarRequest(lecturerApprovalId, type, 'rejected', reason);
        } else if (isStaff) {
            res = await rejectSeminarRequest(id, type, reason);
        } else {
            return;
        }

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Permohonan telah ditolak");
            setIsRejectOpen(false);
            router.refresh();
        }
    };

    const handleLecturerApproveSubmit = async (useSignature: boolean) => {
        if (!lecturerApprovalId) return;
        const res = await respondToSeminarRequest(lecturerApprovalId, type, 'approved', undefined, useSignature);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Permohonan telah disetujui");
            setIsLecturerApproveOpen(false);
            router.refresh();
        }
    };

    return (
        <>
            {/* Actions (if pending & isStaff) */}
            {status === 'pending_schedule' && isStaff && (
                <div className="flex gap-3 pb-6">
                    <Button 
                        onClick={() => setIsScheduleOpen(true)}
                        className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Jadwalkan
                    </Button>
                    <Button 
                        onClick={() => setIsRejectOpen(true)}
                        variant="outline"
                        className="flex-1 h-10 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold rounded-xl gap-2"
                    >
                        <XCircle className="h-4 w-4" /> Tolak
                    </Button>
                </div>
            )}

            {status === 'pending_staff_approval' && isStaff && (
                <div className="flex gap-3 pb-6">
                    <Button 
                        onClick={handleApproveFinalDoc}
                        disabled={loadingApproveFinal}
                        className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-2"
                    >
                        {loadingApproveFinal ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Setujui Sidang Skripsi</>}
                    </Button>
                    <Button 
                        onClick={() => setIsRejectOpen(true)}
                        disabled={loadingApproveFinal}
                        variant="outline"
                        className="flex-1 h-10 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold rounded-xl gap-2"
                    >
                        <XCircle className="h-4 w-4" /> Tolak
                    </Button>
                </div>
            )}

            {/* Actions (if pending & lecturerApproval exists) */}
            {lecturerApprovalId && (
                <div className="pb-6">
                    <ApprovalActionButtons 
                        onApproveClick={() => setIsLecturerApproveOpen(true)}
                        onRejectClick={() => setIsRejectOpen(true)}
                    />
                </div>
            )}

            {/* Schedule Modal */}
            <ScheduleSeminarModal
                open={isScheduleOpen}
                onOpenChange={setIsScheduleOpen}
                jenisName={jenisName}
                onSchedule={handleSchedule}
                loading={loadingSchedule}
            />

            {/* Shared Modals */}
            <RejectDocumentModal 
                isOpen={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                onReject={handleReject}
                documentName={jenisName}
            />

            <ApproveDocumentModal 
                isOpen={isLecturerApproveOpen}
                onOpenChange={setIsLecturerApproveOpen}
                onApprove={handleLecturerApproveSubmit}
                hasSignature={hasSignature}
                documentName={`Surat Persetujuan ${jenisName}`}
            />
        </>
    )
}
