"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Avatar, AvatarFallback } from "@/components/base/avatar";
import type { Consultation } from "@/lib/dal/consultation";
import { Loader2, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";
import { DashboardActionItem } from "../shared/dashboard-action-tracker";

type Props = {
    consultations: Consultation[];
};

export default function ConsultationManager({ consultations }: Props) {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const pending = consultations.filter(c => c.status === 'requested' || c.status === 'reschedule_requested');
    const hasActive = pending.length > 0;

    if (pending.length === 0) {
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
                            <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Undangan Konsultasi</GradientCardTitle>
                            <GradientCardDescription>Tinjau permintaan bimbingan dari mahasiswa.</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
                    <div className="p-8 text-center text-muted-foreground italic text-sm">
                        Tidak ada undangan konsultasi baru.
                    </div>
                </GradientCard>
            </motion.div>
        );
    }

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
                            <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Undangan Konsultasi</GradientCardTitle>
                            <GradientCardDescription>Tinjau permintaan bimbingan dari mahasiswa.</GradientCardDescription>
                        </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-none dark:bg-amber-900/30 dark:text-amber-400 font-bold text-xs">{pending.length} Baru</Badge>
                </GradientCardHeader>
            <div className="p-5">
                <div className="divide-y divide-border/40">
                    {pending.map((c) => (
                        <DashboardActionItem id={`consultation-${c.id}`} isActive={true} key={c.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">{c.student_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{c.student_name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {c.status === 'reschedule_requested' ? "Meminta penjadwalan ulang" : "Meminta jadwal bimbingan"}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground gap-1 rounded-xl"
                                asChild
                            >
                                <a href={`/konsultasi/${c.id}`}>
                                    Tinjau <ArrowRight className="h-3 w-3" />
                                </a>
                            </Button>
                        </DashboardActionItem>
                    ))}
                </div>
            </div>
            </GradientCard>
        </motion.div>
    );
}
