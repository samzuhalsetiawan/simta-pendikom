"use client"

import { motion } from "framer-motion"
import { History, MessageSquare, CheckCircle, Timer, XCircle, AlertCircle, Calendar, User } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import type { Consultation } from "@/lib/dal/consultation"
import Link from "next/link"

interface Props {
    consultations: Consultation[]
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    requested: { icon: Timer, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Menunggu Jadwal' },
    scheduled: { icon: Timer, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Menunggu Konfirmasi' },
    reschedule_requested: { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', label: 'Jadwal Ulang' },
    approved: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Disetujui' },
    completed: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Selesai' },
    rejected: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Ditolak' },
    missed: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Tidak Hadir' },
}

function timeAgo(date: string | Date | null): string {
    if (!date) return "";
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 0) return "Dalam waktu dekat"; // for scheduled future dates
    if (diffInSeconds < 60) return "Baru saja";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} hari yang lalu`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} bulan yang lalu`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} tahun yang lalu`;
}

export default function ConsultationHistoryWidget({ consultations }: Props) {
    const sortedConsultations = [...consultations].sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return dateB - dateA;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6"
        >
            <GradientCard className="flex flex-col" variant="konsultasi">
                <GradientCardHeader variant="konsultasi">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <History className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Riwayat Konsultasi</GradientCardTitle>
                            <GradientCardDescription>Catatan bimbingan Anda sebelumnya.</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
            
                <div className="p-5 space-y-4">
                    {sortedConsultations.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4">Belum ada riwayat konsultasi.</p>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {sortedConsultations.slice(0, 5).map((c) => {
                                const config = STATUS_CONFIG[c.status] || STATUS_CONFIG.requested;
                                const StatusIcon = config.icon;
                                const relevantDate = c.updated_at || c.created_at || null;
                                
                                return (
                                    <Link key={c.id} href={`/konsultasi/${c.id}`} className="block group py-3 first:pt-0 last:pb-0">
                                        <div className="hover:bg-muted/30 transition-colors flex items-center gap-3 rounded-lg -mx-2 px-2 py-1.5">
                                            <Avatar className="h-10 w-10 border-2 border-muted/50 shrink-0">
                                                <AvatarImage src={c.lecturer_image || "/default_user_photo.png"} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold">{c.lecturer_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                                            {c.lecturer_name}
                                                        </p>
                                                    </div>
                                                    {relevantDate && (
                                                        <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">
                                                            {timeAgo(relevantDate)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`flex items-center gap-1 text-[10px] font-medium ${config.color}`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {config.label}
                                                        </div>
                                                        {c.consultation_date && (
                                                            <>
                                                                <span className="text-[10px] text-muted-foreground">•</span>
                                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(c.consultation_date).toLocaleDateString('id-ID', {
                                                                        day: 'numeric', month: 'short'
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {relevantDate && (
                                                        <span className="text-[10px] text-muted-foreground shrink-0 sm:hidden">
                                                            {timeAgo(relevantDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </GradientCard>
        </motion.div>
    )
}
