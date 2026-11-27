"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { 
    AlertCircle, 
    Check, 
    X, 
    MessageSquare, 
    Loader2,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardActionItem } from "../shared/dashboard-action-tracker";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";

interface PostEventTask {
    id: number | string;
    type: 'consultation';
    date: string;
    student_name: string;
    student_nim: string;
    thesis_title?: string;
}

interface Props {
    tasks: PostEventTask[];
}

export default function PostEventManager({ tasks }: Props) {
    const [loading, setLoading] = useState<string | null>(null);

    // Other handlers can be placed here in the future

    if (tasks.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <GradientCard className="">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Konfirmasi Bimbingan Selesai</GradientCardTitle>
                            <GradientCardDescription>Tandai riwayat bimbingan mahasiswa.</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
                <div className="p-5">
                    <div className="grid gap-3">
                {tasks.map((task) => (
                    <DashboardActionItem id={`post-event-${task.type}-${task.id}`} isActive={true} key={`${task.type}-${task.id}`}>
                        <GradientCard className="">
                        <div className="flex flex-col md:flex-row items-stretch">
                            <div className="flex-1 p-4 flex gap-3">
                                <div className="relative h-9 w-9 shrink-0 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            Bimbingan
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span className="text-[10px] font-bold text-primary">
                                            {new Date(task.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {task.student_name} <span className="text-muted-foreground font-medium text-xs">({task.student_nim})</span>
                                    </p>
                                    {task.thesis_title && (
                                        <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                                            &quot;{task.thesis_title}&quot;
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-muted/20 border-l border-border/50 flex flex-col justify-center gap-2 shrink-0 min-w-[140px]">
                                {task.type === 'consultation' ? (
                                    <Link 
                                        href={`/konsultasi/${task.id}`}
                                        className="inline-flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl h-9 px-4 transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span className="text-sm">Konfirmasi</span>
                                    </Link>
                                ) : (
                                    <span className="text-sm text-muted-foreground text-center">Tindakan lain</span>
                                )}
                            </div>
                        </div>
                        </GradientCard>
                    </DashboardActionItem>
                ))}
                    </div>
                </div>
            </GradientCard>
        </motion.div>
    );
}
