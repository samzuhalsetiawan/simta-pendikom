"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/button"
import { GradientCard } from "@/components/shared/gradient-card"
import { Badge } from "@/components/base/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Presentation, GraduationCap, ChevronDown, ChevronUp, FileText, User, BookOpen } from "lucide-react"
import { DashboardActionItem } from "../shared/dashboard-action-tracker"
import type { PendingSeminarRequest } from "@/lib/dal/staff-seminar"

interface StaffSeminarRequestSectionProps {
    title: string;
    description: string;
    type: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';
    variant: 'seminar-proposal' | 'seminar-hasil' | 'sidang-skripsi';
    requests: PendingSeminarRequest[];
}

export default function StaffSeminarRequestSection({
    title,
    description,
    type,
    variant,
    requests
}: StaffSeminarRequestSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (requests.length === 0) return null;

    const getConfig = () => {
        switch (type) {
            case 'seminar_proposal':
                return {
                    icon: <Presentation className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                    iconBg: "bg-amber-500/10 dark:bg-amber-950/30",
                    headerGradient: "border-y border-seminar-proposal/15 bg-gradient-to-r from-transparent from-50% to-seminar-proposal/15",
                    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-none font-bold",
                    hrefPrefix: "/persetujuan-seminar-proposal"
                };
            case 'seminar_hasil':
                return {
                    icon: <Presentation className="h-4 w-4 text-red-600 dark:text-red-400" />,
                    iconBg: "bg-red-500/10 dark:bg-red-950/30",
                    headerGradient: "border-y border-seminar-hasil/15 bg-gradient-to-r from-transparent from-50% to-seminar-hasil/15",
                    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-none font-bold",
                    hrefPrefix: "/persetujuan-seminar-hasil"
                };
            case 'pendadaran':
                return {
                    icon: <GraduationCap className="h-4 w-4 text-violet-600 dark:text-violet-400" />,
                    iconBg: "bg-violet-500/10 dark:bg-violet-950/30",
                    headerGradient: "border-y border-sidang-skripsi/15 bg-gradient-to-r from-transparent from-50% to-sidang-skripsi/15",
                    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border-none font-bold",
                    hrefPrefix: "/persetujuan-sidang-skripsi"
                };
        }
    };

    const config = getConfig();

    return (
        <GradientCard variant={variant}>
            <div 
                className={`${config.headerGradient} p-5 flex flex-row items-center justify-between cursor-pointer select-none`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-3">
                    <div className={`p-1.5 ${config.iconBg} rounded-xl shrink-0 mt-0.5`}>
                        {config.icon}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-heading font-bold">
                            {title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                            {description}
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
                        {requests.map(task => {
                            const supervisors = typeof task.supervisors === 'string' 
                                ? JSON.parse(task.supervisors || '[]') 
                                : (task.supervisors || []);

                            return (
                                <DashboardActionItem 
                                    id={`seminar-request-${task.id}`} 
                                    isActive={true} 
                                    key={task.id} 
                                    className="relative py-5 first:pt-0 last:pb-0 hover:bg-muted/10 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                            <div className="relative shrink-0 mt-0.5">
                                                <Avatar className="h-11 w-11 border border-border/50 shadow-sm rounded-xl">
                                                    <AvatarImage 
                                                        src={task.student_image || `/api/avatar/${task.student_nim}`} 
                                                        alt={task.student_name} 
                                                        className="object-cover rounded-xl" 
                                                    />
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
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <div className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground flex-wrap">
                                                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <span>{task.student_name}</span>
                                                            <span className="text-muted-foreground font-normal text-xs">({task.student_nim})</span>
                                                        </div>
                                                        {task.status === 'pending_staff_approval' && (
                                                            <Badge variant="secondary" className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-bold px-1.5 py-0 leading-tight">
                                                                Verifikasi Surat
                                                            </Badge>
                                                        )}
                                                        {task.status === 'pending_schedule' && (
                                                            <Badge variant="secondary" className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold px-1.5 py-0 leading-tight">
                                                                Perlu Dijadwal
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start gap-1.5">
                                                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                            {task.thesis_title || "Judul skripsi belum ditentukan"}
                                                        </p>
                                                    </div>
                                                    {supervisors.length > 0 && (
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
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="shrink-0 pl-[58px] sm:pl-0 flex justify-start">
                                            <Link href={`${config.hrefPrefix}/${task.id}`}>
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
                            );
                        })}
                    </div>
                </div>
            )}
        </GradientCard>
    );
}
