"use client"

import { motion } from "framer-motion"
import { Activity, User, History, ArrowRight } from "lucide-react"
import Link from "next/link"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import type { InactiveStudent } from "@/lib/dal/lecturer"
import { Button } from "@/components/base/button"

interface Props {
    students: InactiveStudent[]
    title?: string
    description?: string
    maxItems?: number
    viewAllHref?: string
}

export default function EarlyWarningWidget({ 
    students, 
    title = "Keaktifan Mahasiswa", 
    description = "Pantau skor keaktifan mahasiswa.",
    maxItems,
    viewAllHref
}: Props) {
    if (students.length === 0) return null

    const displayStudents = maxItems ? students.slice(0, maxItems) : students;
    const hasMore = maxItems ? students.length > maxItems : false;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <GradientCard className="flex flex-col h-full">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>{title}</GradientCardTitle>
                            <GradientCardDescription>{description}</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>

                <div className="divide-y divide-border/50">
                    {displayStudents.map((student, i) => {
                        const isUrgent = student.score <= 20
                        return (
                            <motion.div
                                key={student.nim}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * i }}
                                className="px-5 py-4 flex gap-3 hover:bg-muted/30 transition-colors"
                            >
                                {student.student_image ? (
                                    <img src={student.student_image} alt={student.student_name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-semibold">
                                        {student.student_name.charAt(0)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                        <p className="text-sm font-semibold truncate">{student.student_name}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <History className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {student.last_activity || "Belum ada aktivitas"} 
                                            {student.days_inactive > 0 ? ` (${student.days_inactive} hari berlalu)` : ' (Hari ini)'}
                                        </p>
                                    </div>
                                    {student.supervisors && student.supervisors.length > 0 && (
                                        <div className="flex items-center gap-3 mt-0.5 mb-1 w-full min-w-0">
                                            {student.supervisors.map(s => (
                                                <div key={s.nip} className="flex items-center gap-1.5 min-w-0" title={`Pembimbing ${s.position}`}>
                                                    {s.image ? (
                                                        <img src={s.image} alt={s.name} className="w-4 h-4 rounded-full object-cover shrink-0 shadow-sm" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px] shrink-0 shadow-sm">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-[11px] text-muted-foreground truncate">{s.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`
                                        w-fit flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold mt-1
                                        ${student.score > 80
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                            : student.score <= 20
                                                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                        }
                                    `}>
                                        Poin Keaktifan: {student.score}/100
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
                
                {viewAllHref && hasMore && (
                    <div className="p-4 border-t border-border/50">
                        <Link href={viewAllHref} className="block w-full">
                            <Button variant="outline" className="w-full text-xs h-9">
                                Lihat Semua Mahasiswa
                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                )}
            </GradientCard>
        </motion.div>
    )
}
