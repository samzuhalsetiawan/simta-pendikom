"use client";

import { CheckCircle2, Clock, FileUp, CalendarCheck, ShieldCheck, Award, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface Props {
    status: string | null | undefined;
    hasDocument?: boolean;
}

interface Step {
    id: number;
    key: string;
    title: string;
    description: string;
    icon: any;
}

const STEPS: Step[] = [
    { id: 1, key: "pengajuan", title: "Pengajuan", description: "Oleh Mahasiswa", icon: FileUp },
    { id: 2, key: "jadwal", title: "Penjadwalan", description: "Oleh Staff Prodi", icon: CalendarCheck },
    { id: 3, key: "approval", title: "Persetujuan", description: "Dosen Pembimbing & Penguji", icon: ShieldCheck },
    { id: 4, key: "surat", title: "Surat Ujian", description: "Upload Surat Akhir", icon: FileUp },
    { id: 5, key: "verifikasi", title: "Verifikasi Berkas", description: "Oleh Staff Prodi", icon: CheckCircle2 },
    { id: 6, key: "ujian", title: "Sidang & Yudisium", description: "Pelaksanaan & Nilai", icon: Award },
];

export function SidangSkripsiMiniStepper({ status, hasDocument = false }: Props) {
    if (!status) return null;

    // Determine current active step index (1-based)
    // 1: Pengajuan (initial)
    // 2: pending_schedule (waiting for schedule from staff)
    // 3: pending_approval (waiting for lecturer approval)
    // 4: pending_document (waiting for document upload from student)
    // 5: pending_staff_approval (waiting for staff document verification)
    // 6: approved (ready for exam / exam scheduled)
    // 7: pass (graduated)
    let currentStepIndex = 1;
    let isCompleted = false;
    let isFailed = false;

    if (status === 'pending_schedule') {
        currentStepIndex = 2; // Active step is Penjadwalan
    } else if (status === 'pending_approval') {
        currentStepIndex = 3; // Active step is Persetujuan Dosen
    } else if (status === 'pending_document') {
        currentStepIndex = 4; // Active step is Unggah Surat
    } else if (status === 'pending_staff_approval') {
        currentStepIndex = 5; // Active step is Verifikasi Staff
    } else if (status === 'approved') {
        currentStepIndex = 6; // Active step is Pelaksanaan Sidang
    } else if (status === 'pass') {
        currentStepIndex = 6;
        isCompleted = true;
    } else if (status === 'fail' || status === 'rejected') {
        isFailed = true;
    }

    return (
        <div className="w-full bg-background/80 dark:bg-card/40 rounded-2xl border border-border/60 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Alur Tahapan Sidang Skripsi
                </span>
                <span className="text-[11px] font-semibold text-primary">
                    {isCompleted ? "Seluruh Tahap Selesai (Lulus)" : isFailed ? "Permohonan Ditolak / Gagal" : `Langkah ${currentStepIndex} dari ${STEPS.length}`}
                </span>
            </div>

            {/* Stepper nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {STEPS.map((step) => {
                    const isStepPast = isCompleted || step.id < currentStepIndex;
                    const isStepCurrent = !isCompleted && !isFailed && step.id === currentStepIndex;
                    const StepIcon = step.icon;

                    return (
                        <div 
                            key={step.id}
                            className={cn(
                                "flex flex-col p-2.5 rounded-xl border transition-all text-left relative overflow-hidden",
                                isStepPast 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100" 
                                    : isStepCurrent 
                                        ? "bg-primary/10 border-primary ring-1 ring-primary/30 shadow-xs" 
                                        : "bg-muted/30 border-border/40 text-muted-foreground opacity-60"
                            )}
                        >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className={cn(
                                    "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black",
                                    isStepPast 
                                        ? "bg-emerald-600 text-white" 
                                        : isStepCurrent 
                                            ? "bg-primary text-primary-foreground animate-pulse" 
                                            : "bg-muted text-muted-foreground"
                                )}>
                                    {isStepPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                                </span>
                                <StepIcon className={cn(
                                    "w-3.5 h-3.5",
                                    isStepPast ? "text-emerald-600 dark:text-emerald-400" : isStepCurrent ? "text-primary" : "text-muted-foreground"
                                )} />
                            </div>

                            <span className={cn(
                                "text-xs font-bold leading-tight line-clamp-1",
                                isStepPast ? "text-emerald-800 dark:text-emerald-300" : isStepCurrent ? "text-foreground font-extrabold" : "text-muted-foreground"
                            )}>
                                {step.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
                                {step.description}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
