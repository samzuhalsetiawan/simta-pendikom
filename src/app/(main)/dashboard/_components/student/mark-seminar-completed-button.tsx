"use client";

import { useState } from "react";
import { Button } from "@/components/base/button";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { markSeminarCompleted } from "@/lib/actions/seminar";
import { MarkSeminarCompletedModal } from "@/components/Modal/mark-seminar-completed-modal";

interface Props {
    seminarId: string;
    type: 'proposal' | 'hasil' | 'pendadaran';
    title?: string;
    className?: string;
    scheduledDate?: string | Date | null;
    canOverride?: boolean;
}

export function MarkSeminarCompletedButton({ 
    seminarId, 
    type, 
    title, 
    className, 
    scheduledDate, 
    canOverride = false 
}: Props) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const isFuture = scheduledDate ? new Date(scheduledDate).getTime() > Date.now() : false;
    const isDisabled = isFuture && !canOverride;

    const formattedSchedule = scheduledDate
        ? new Date(scheduledDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : null;

    const handleComplete = async () => {
        setLoading(true);
        try {
            const res = await markSeminarCompleted(seminarId, type);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(
                    res.status === 'pass' 
                        ? `Selamat! ${type === 'pendadaran' ? 'Sidang Skripsi' : 'Seminar'} dinyatakan LULUS dengan skor ${res.score || '-'}.`
                        : `${type === 'pendadaran' ? 'Sidang Skripsi' : 'Seminar'} selesai. Skor akumulasi (${res.score || 0}) belum memenuhi kriteria kelulusan.`
                );
                setOpen(false);
            }
        } catch (err: any) {
            toast.error(err.message || "Terjadi kesalahan saat menyelesaikan seminar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-1.5 w-full">
            <Button
                onClick={() => setOpen(true)}
                disabled={isDisabled}
                className={`font-bold rounded-xl h-10 px-4 gap-2 shadow-sm transition-all ${
                    isDisabled 
                        ? 'bg-muted text-muted-foreground border border-border/80 cursor-not-allowed opacity-75' 
                        : canOverride && isFuture
                            ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer hover:shadow-md'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
                } ${className || ''}`}
            >
                {isDisabled ? (
                    <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                ) : canOverride && isFuture ? (
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                <span>
                    {isDisabled 
                        ? "Belum Dapat Ditandai Selesai" 
                        : canOverride && isFuture 
                            ? "Tandai Selesai (Staff Override)" 
                            : "Tandai Selesai"}
                </span>
            </Button>

            {isDisabled && formattedSchedule && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 leading-snug px-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>Dapat diselesaikan setelah pelaksanaan: <strong>{formattedSchedule} WITA</strong></span>
                </p>
            )}

            <MarkSeminarCompletedModal
                open={open}
                onOpenChange={setOpen}
                type={type}
                onConfirm={handleComplete}
                loading={loading}
            />
        </div>
    );
}

