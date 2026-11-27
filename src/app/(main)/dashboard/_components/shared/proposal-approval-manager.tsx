"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/button"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import { Badge } from "@/components/base/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { FileText, ChevronDown, ChevronUp, User, BookOpen } from "lucide-react"
import { DashboardActionItem } from "../shared/dashboard-action-tracker"

interface ProposalApprovalTask {
    approval_id: number;
    proposal_id: string;
    created_at: string;
    student_name: string;
    student_nim: string;
    student_image: string | null;
    title: string;
    research_type: string;
    supervisors?: string;
}

export default function ProposalApprovalManager({ tasks }: { tasks: ProposalApprovalTask[] }) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (tasks.length === 0) return null;

    return (
        <GradientCard className="">
            <div 
                className="border-y border-emerald-500/15 bg-gradient-to-r from-transparent from-50% to-emerald-500/15 p-5 flex flex-row items-center justify-between cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-xl shrink-0 mt-0.5">
                        <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-heading font-bold">
                            Persetujuan Proposal
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                            Tinjau permohonan persetujuan proposal.
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
                        {tasks.map(task => (
                            <DashboardActionItem id={`proposal-approval-${task.approval_id}`} isActive={true} key={task.approval_id} className="relative py-5 first:pt-0 last:pb-0 hover:bg-muted/10 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        <div className="relative shrink-0 mt-0.5">
                                            <Avatar className="h-11 w-11 border border-border/50 shadow-sm rounded-xl">
                                                <AvatarImage src={task.student_image || ""} alt={task.student_name} className="object-cover rounded-xl" />
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold rounded-xl">
                                                    {task.student_name?.charAt(0) || "M"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="space-y-1.5">
                                                <div className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground flex-wrap">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <span>{task.student_name}</span>
                                                    <span className="text-muted-foreground font-normal text-xs">({task.student_nim})</span>
                                                </div>
                                                <div className="flex items-start gap-1.5">
                                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                        {task.title || "Judul proposal belum ditentukan"}
                                                    </p>
                                                </div>
                                                {(() => {
                                                    const supervisors = typeof task.supervisors === 'string' 
                                                        ? JSON.parse(task.supervisors || '[]') 
                                                        : (task.supervisors || []);
                                                    if (supervisors.length > 0) {
                                                        return (
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                                                {supervisors.map((spv: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center gap-1.5">
                                                                        <Avatar className="h-4 w-4 shrink-0">
                                                                            <AvatarImage src={spv.image || ""} className="object-cover" />
                                                                            <AvatarFallback className="bg-muted text-muted-foreground font-bold text-[8px]">
                                                                                {spv.name?.charAt(0)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-xs text-muted-foreground truncate">{spv.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="shrink-0 pl-[58px] sm:pl-0 flex justify-start">
                                        <Link href={`/persetujuan-proposal/${task.proposal_id}`}>
                                            <Button 
                                                size="sm"
                                                className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5 cursor-pointer transition-all shadow-sm w-full sm:w-auto"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                Lihat Permohonan
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </DashboardActionItem>
                        ))}
                    </div>
                </div>
            )}
        </GradientCard>
    );
}
