"use client"

import Link from "next/link";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { User, BookOpen } from "lucide-react";
import { DashboardActionItem } from "../shared/dashboard-action-tracker";
import type { PendingSeminarRequest } from "@/lib/dal/staff-seminar";

export default function SeminarRequestManager({ requests }: { requests: PendingSeminarRequest[] }) {
    if (requests.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm min-h-[150px]">
                Tidak ada informasi penting saat ini.
            </div>
        );
    }

    return (
        <div className="divide-y divide-border/40">
            {requests.map((task) => (
                <DashboardActionItem id={`seminar-request-${task.id}`} isActive={true} key={task.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                            <Avatar className="h-10 w-10 border border-emerald-100 dark:border-emerald-800">
                                <AvatarImage src={`/api/avatar/${task.student_nim}`} />
                                <AvatarFallback className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                                    {task.student_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        </div>
                        <div className="min-w-0">
                            <div className="mb-1.5 flex gap-2 items-center flex-wrap">
                                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 leading-tight font-bold border ${
                                    task.type === 'seminar_proposal' ? 'bg-seminar-proposal/10 border-seminar-proposal/20 text-seminar-proposal hover:bg-seminar-proposal/20' :
                                    task.type === 'seminar_hasil' ? 'bg-seminar-hasil/10 border-seminar-hasil/20 text-seminar-hasil hover:bg-seminar-hasil/20' :
                                    'bg-sidang-skripsi/10 border-sidang-skripsi/20 text-sidang-skripsi hover:bg-sidang-skripsi/20'
                                }`}>
                                    {task.type === 'seminar_proposal' ? 'Seminar Proposal' : task.type === 'seminar_hasil' ? 'Seminar Hasil' : 'Sidang Skripsi'}
                                </Badge>
                                {task.status === 'pending_staff_approval' ? (
                                    <Badge variant="secondary" className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-bold px-1.5 py-0 leading-tight">
                                        Verifikasi Surat
                                    </Badge>
                                ) : task.status === 'pending_schedule' ? (
                                    <Badge variant="secondary" className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold px-1.5 py-0 leading-tight">
                                        Perlu Dijadwal
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="space-y-1.5 mt-2">
                                <p className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1 leading-none flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    {task.student_name}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                    <BookOpen className="h-3 w-3 shrink-0" />
                                    <span className="truncate" title={task.thesis_title}>{task.thesis_title}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                        <Link href={`/persetujuan-${task.type.replace('_', '-')}/${task.id}`}>
                            <Button 
                                size="sm" 
                                className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5 cursor-pointer transition-all shadow-sm"
                            >
                                Tinjau
                            </Button>
                        </Link>
                    </div>
                </DashboardActionItem>
            ))}
        </div>
    );
}
