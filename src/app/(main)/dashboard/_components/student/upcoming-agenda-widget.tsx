"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, ArrowRight, Presentation, User } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import type { Consultation } from "@/lib/dal/consultation"
import type { SeminarProposalStatus, SeminarHasilStatus, PendadaranStatus, SpectatingSeminar } from "@/lib/dal/seminar"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { cva } from "class-variance-authority"
import { DashboardActionItem } from "../shared/dashboard-action-tracker"

const badgeVariants = cva(
    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-wide uppercase",
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

const iconBgVariants = cva(
    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
    {
        variants: {
            eventType: {
                consultation: "bg-konsultasi/10 text-konsultasi border-konsultasi/20",
                seminar_proposal: "bg-seminar-proposal/10 text-seminar-proposal border-seminar-proposal/20",
                seminar_hasil: "bg-seminar-hasil/10 text-seminar-hasil border-seminar-hasil/20",
                pendadaran: "bg-sidang-skripsi/10 text-sidang-skripsi border-sidang-skripsi/20",
            }
        },
        defaultVariants: { eventType: "consultation" }
    }
);

type EventType = "consultation" | "seminar_proposal" | "seminar_hasil" | "pendadaran";

interface Props {
    consultations: Consultation[]
    seminarProposal: SeminarProposalStatus
    seminarHasil: SeminarHasilStatus
    pendadaran: PendadaranStatus
    spectatingSeminars?: SpectatingSeminar[]
}

export default function UpcomingAgendaWidget({ consultations, seminarProposal, seminarHasil, pendadaran, spectatingSeminars = [] }: Props) {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const agendas: any[] = []

    // 1. Consultations
    consultations.forEach(c => {
        if (c.status === 'approved' && c.consultation_date && new Date(c.consultation_date).getTime() >= startOfToday) {
            agendas.push({
                id: `consultation-${c.id}`,
                eventType: 'consultation',
                type: 'Konsultasi',
                title: c.lecturer_name || 'Dosen',
                date: new Date(c.consultation_date),
                venue: c.venue || 'Belum ditentukan',
                href: `/konsultasi/${c.id}`,
                lecturer_name: c.lecturer_name,
                lecturer_image: c.lecturer_image
            })
        }
    })

    // 2. Seminar Proposal
    if (seminarProposal?.scheduled_date && seminarProposal.status === 'approved') {
        const date = new Date(seminarProposal.scheduled_date)
        if (date.getTime() >= startOfToday) {
            agendas.push({
                id: `sempro-${seminarProposal.id}`,
                eventType: 'seminar_proposal',
                type: 'Seminar Proposal',
                title: `Ujian Seminar Proposal`,
                date: date,
                venue: seminarProposal.venue || 'Belum ditentukan',
                href: `/seminar-proposal/${seminarProposal.id}`
            })
        }
    }

    // 3. Seminar Hasil
    if (seminarHasil?.scheduled_date && seminarHasil.status === 'approved') {
        const date = new Date(seminarHasil.scheduled_date)
        if (date.getTime() >= startOfToday) {
            agendas.push({
                id: `semhas-${seminarHasil.id}`,
                eventType: 'seminar_hasil',
                type: 'Seminar Hasil',
                title: `Ujian Seminar Hasil`,
                date: date,
                venue: seminarHasil.venue || 'Belum ditentukan',
                href: `/seminar-hasil/${seminarHasil.id}`
            })
        }
    }

    // 4. Pendadaran
    if (pendadaran?.scheduled_date && pendadaran.status === 'approved') {
        const date = new Date(pendadaran.scheduled_date)
        if (date.getTime() >= startOfToday) {
            agendas.push({
                id: `pendadaran-${pendadaran.id}`,
                eventType: 'pendadaran',
                type: 'Sidang Skripsi',
                title: `Sidang Skripsi`,
                date: date,
                venue: pendadaran.venue || 'Belum ditentukan',
                href: `/sidang-skripsi/${pendadaran.id}`
            })
        }
    }

    // 5. Spectating Seminars
    spectatingSeminars.forEach(s => {
        const date = new Date(s.scheduled_date)
        if (date.getTime() >= startOfToday) {
            agendas.push({
                id: `spectator-${s.seminar_id}`,
                eventType: s.seminar_type === 'proposal' ? 'seminar_proposal' : 'seminar_hasil',
                type: s.seminar_type === 'proposal' ? 'Seminar Proposal' : 'Seminar Hasil',
                title: `${s.student_name} - ${s.title || 'Tanpa Judul'}`,
                date: date,
                venue: s.venue || 'Belum ditentukan',
                href: s.seminar_type === 'proposal' ? `/seminar-proposal/${s.seminar_id}` : `/seminar-hasil/${s.seminar_id}`,
                lecturer_name: s.student_name, // Using lecturer_name to trick the UI into using the Avatar
                lecturer_image: `/api/avatar/${s.student_nim}` // Tricking UI to show student's avatar
            })
        }
    })

    if (agendas.length === 0) return null

    // Sort by nearest date
    agendas.sort((a, b) => a.date.getTime() - b.date.getTime())

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
        >
            <GradientCard className="flex flex-col">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Upcoming Agenda</GradientCardTitle>
                            <GradientCardDescription>Jadwal terdekat yang akan datang.</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
            
                <div className="p-2 space-y-1 pb-4">
                    {agendas.map((agenda, index) => {
                        const eventType = agenda.eventType as EventType;
                        
                        // Calculate days from today
                        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const startOfAgenda = new Date(agenda.date.getFullYear(), agenda.date.getMonth(), agenda.date.getDate());
                        const diffTime = startOfAgenda.getTime() - startOfToday.getTime();
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        
                        const isToday = diffDays === 0;
                        
                        return (
                            <DashboardActionItem id={agenda.id} isActive={isToday} key={agenda.id}>
                                {index !== 0 && <div className="h-px w-[90%] mx-auto bg-border/40 my-1" />}
                                <Link href={agenda.href} className="block group p-3 hover:bg-muted/50 rounded-xl transition-colors">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={badgeVariants({ eventType })}>
                                                    {agenda.type}
                                                </span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                                    diffDays === 0 
                                                        ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400'
                                                        : diffDays === 1
                                                        ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400'
                                                        : 'bg-muted border-border text-muted-foreground'
                                                }`}>
                                                    {diffDays === 0 ? "Hari ini" : diffDays === 1 ? "Besok" : `${diffDays} hari lagi`}
                                                </span>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                        
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="relative shrink-0 mt-0.5">
                                                {agenda.lecturer_image ? (
                                                    <Avatar className="h-8 w-8 border border-border">
                                                        <AvatarImage src={agenda.lecturer_image || ''} />
                                                        <AvatarFallback className="text-[10px]">{agenda.lecturer_name?.charAt(0) || 'D'}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className={iconBgVariants({ eventType })}>
                                                        <Presentation className="h-4 w-4" />
                                                    </div>
                                                )}
                                                {isToday && (
                                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-10">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <p className="text-sm font-semibold truncate text-foreground">{agenda.title}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <p className="text-xs text-muted-foreground">
                                                        {agenda.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {agenda.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <p className="text-xs text-muted-foreground truncate">{agenda.venue}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </DashboardActionItem>
                        )
                    })}
                </div>
            </GradientCard>
        </motion.div>
    )
}
