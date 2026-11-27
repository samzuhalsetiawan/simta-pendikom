"use client"

import { motion } from "framer-motion"
import { CalendarCheck, Clock, MapPin, MessageSquare, Presentation, Coffee, User } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import type { UpcomingAgendaGroup } from "@/lib/dal/lecturer"
import { cva } from "class-variance-authority"
import Link from "next/link"

const TYPE_CONFIG = {
    consultation: { label: 'Konsultasi', icon: MessageSquare, getHref: (id: string) => `/konsultasi/${id}` },
    seminar_proposal: { label: 'Seminar Proposal', icon: Presentation, getHref: (id: string) => `/seminar-proposal/${id}` },
    seminar_hasil: { label: 'Seminar Hasil', icon: Presentation, getHref: (id: string) => `/seminar-hasil/${id}` },
    pendadaran: { label: 'Sidang Skripsi', icon: Presentation, getHref: (id: string) => `/sidang-skripsi/${id}` },
} as const;

const agendaBadgeVariants = cva(
    "text-[10px] font-bold px-2 py-0.5 border rounded-md shrink-0 tracking-wide",
    {
        variants: {
            eventType: {
                consultation: "bg-konsultasi/10 border-konsultasi/20 text-konsultasi",
                seminar_proposal: "bg-seminar-proposal/10 border-seminar-proposal/20 text-seminar-proposal",
                seminar_hasil: "bg-seminar-hasil/10 border-seminar-hasil/20 text-seminar-hasil",
                pendadaran: "bg-sidang-skripsi/10 border-sidang-skripsi/20 text-sidang-skripsi",
            }
        },
        defaultVariants: { eventType: "consultation" }
    }
);

const agendaIconBgVariants = cva(
    "p-2 rounded-xl shrink-0 mt-0.5",
    {
        variants: {
            eventType: {
                consultation: "bg-konsultasi/10 text-konsultasi",
                seminar_proposal: "bg-seminar-proposal/10 text-seminar-proposal",
                seminar_hasil: "bg-seminar-hasil/10 text-seminar-hasil",
                pendadaran: "bg-sidang-skripsi/10 text-sidang-skripsi",
            }
        },
        defaultVariants: { eventType: "consultation" }
    }
);

interface Props {
    groups: UpcomingAgendaGroup[]
}

function getRelativeDayString(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dateStr.split('-');
    const targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Besok";
    return `${diffDays} hari lagi`;
}

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-');
    const targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function UpcomingAgendaWidget({ groups }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <GradientCard className="">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <CalendarCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Agenda Terdekat</GradientCardTitle>
                            <GradientCardDescription>
                                Jadwal Anda dalam waktu dekat
                            </GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>

            {groups.length === 0 ? (
                <div className="p-8 text-center">
                    <Coffee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Tidak ada agenda dalam waktu dekat</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    {groups.map((group, groupIdx) => (
                        <div key={group.dateStr} className="flex flex-col">
                            {/* Column Header */}
                            <div className="px-5 py-3 border-b border-border/50 bg-muted/20">
                                <p className="text-sm font-semibold text-foreground">
                                    {getRelativeDayString(group.dateStr)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {formatDate(group.dateStr)} ({group.items.length} agenda)
                                </p>
                            </div>
                            
                            {/* Column Items */}
                            <div className="divide-y divide-border/50 flex-1">
                                {group.items.map((item, i) => {
                                    const eventType = item.type as keyof typeof TYPE_CONFIG;
                                    const config = TYPE_CONFIG[eventType] || TYPE_CONFIG.consultation;
                                    const Icon = config.icon;
                                    const time = new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <motion.div
                                            key={`${item.type}-${item.id}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (groupIdx * 0.1) + (0.05 * i) }}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <Link
                                                href={config.getHref(item.id)}
                                                className="px-5 py-3 flex flex-col gap-3 w-full"
                                            >
                                                <div className="flex items-start gap-3 w-full">
                                                    {item.student_image ? (
                                                        <img src={item.student_image} alt={item.student_name} className="w-8 h-8 rounded-full shrink-0 mt-0.5 object-cover" />
                                                    ) : (
                                                        <div className={agendaIconBgVariants({ eventType })}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={agendaBadgeVariants({ eventType })}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <p className="text-sm font-semibold truncate">{item.student_name}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {time} WIB
                                                            </span>
                                                            {item.venue && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span className="truncate">{item.venue}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </GradientCard>
        </motion.div>
    )
}
