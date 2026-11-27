"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/button"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import { Badge } from "@/components/base/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Presentation, ChevronDown, ChevronUp, FileText, User, BookOpen } from "lucide-react"
import { DashboardActionItem } from "../shared/dashboard-action-tracker"

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
    seminar_proposal: { 
        label: "Seminar Proposal", 
        badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-transparent font-bold"
    },
    seminar_hasil: { 
        label: "Seminar Hasil", 
        badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-transparent font-bold"
    },
    pendadaran: { 
        label: "Sidang Skripsi", 
        badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border-transparent font-bold"
    },
};

interface ApprovalTask {
    approval_id: number;
    type: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';
    seminar_id: number;
    created_at: string;
    student_name: string;
    student_nim: string;
    thesis_title: string;
}

export default function SeminarApprovalManager({ tasks }: { tasks: ApprovalTask[] }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const formatType = (type: string) => {
        if (type === 'seminar_proposal') return "Seminar Proposal";
        if (type === 'seminar_hasil') return "Seminar Hasil";
        if (type === 'pendadaran') return "Sidang Skripsi";
        return type;
    };

    if (tasks.length === 0) return null;

    return (
        <GradientCard className="">
            <div 
                className="border-y border-emerald-500/15 bg-gradient-to-r from-transparent from-50% to-emerald-500/15 p-5 flex flex-row items-center justify-between cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-xl shrink-0 mt-0.5">
                        <Presentation className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-heading font-bold">
                            Persetujuan Seminar
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                            Tinjau permohonan seminar dari mahasiswa bimbingan Anda.
                        </p>
                    </div>
                </div>
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
            </div>

            {isExpanded && (
                <div className="p-5">
                    <div className="divide-y divide-border/40">
                        {tasks.map(task => {
                            const config = TYPE_CONFIG[task.type] || {
                                label: task.type,
                                badgeClass: "bg-primary/10 text-primary border-transparent font-bold"
                            };

                            return (
                                <DashboardActionItem id={`seminar-approval-${task.approval_id}`} isActive={true} key={task.approval_id} className="relative py-5 first:pt-0 last:pb-0 hover:bg-muted/10 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                            <div className="relative shrink-0 mt-0.5">
                                                <Avatar className="h-11 w-11 border border-border/50 shadow-sm rounded-xl">
                                                    <AvatarImage src="" alt={task.student_name} className="object-cover rounded-xl" />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold rounded-xl">
                                                        {task.student_name?.charAt(0) || "M"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${config.badgeClass}`}>
                                                            {config.label}
                                                        </Badge>
                                                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-none font-bold text-[10px]">
                                                            Menunggu Persetujuan
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground ml-auto">
                                                            {new Date(task.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground flex-wrap">
                                                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <span>{task.student_name}</span>
                                                            <span className="text-muted-foreground font-normal text-xs">({task.student_nim})</span>
                                                        </div>
                                                        <div className="flex items-start gap-1.5">
                                                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                                {task.thesis_title || "Judul skripsi belum ditentukan"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-1 justify-start">
                                                    <Link href={task.type === 'pendadaran' ? `/persetujuan-sidang-skripsi/${task.seminar_id}` : `/persetujuan-${task.type.replace('_', '-')}/${task.seminar_id}`}>
                                                        <Button 
                                                            size="sm"
                                                            className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5 cursor-pointer transition-all shadow-sm"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Lihat Permohonan
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardActionItem>
                            );
                        })}
                    </div>
                </div>
            )}
        </GradientCard>
    );
}
