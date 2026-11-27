"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, GraduationCap, ChevronDown, ChevronUp, TrendingUp, Plus, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/button"
import { useRouter } from "next/navigation"
import type { LecturerWithStudents } from "@/lib/dal/staff"

const PROGRESS_CONFIG: Record<string, { label: string; color: string; badgeBg: string }> = {
    pengajuan_proposal: { label: 'Pengajuan Proposal', color: 'text-yellow-600 dark:text-yellow-400', badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
    seminar_proposal: { label: 'Seminar Proposal', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    penelitian: { label: 'Penelitian', color: 'text-orange-600 dark:text-orange-400', badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    seminar_hasil: { label: 'Seminar Hasil', color: 'text-red-600 dark:text-red-400', badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    pendadaran: { label: 'Sidang Skripsi', color: 'text-purple-600 dark:text-purple-400', badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    lulus: { label: 'Lulus', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
}

function getProgressBarColor(avg: number) {
    if (avg >= 80) return 'bg-emerald-500'
    if (avg >= 50) return 'bg-primary'
    if (avg >= 30) return 'bg-amber-500'
    return 'bg-rose-500'
}

interface Props {
    workloads: LecturerWithStudents[]
}

import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"

export default function LecturerWorkloadWidget({ workloads }: Props) {
    const router = useRouter()
    const [isNavigating, startTransition] = useTransition()
    const [expandedNip, setExpandedNip] = useState<string | null>(null)

    const toggleExpand = (nip: string) => {
        setExpandedNip(prev => prev === nip ? null : nip)
    }

    const handleAssign = () => {
        startTransition(() => {
            router.push("/dashboard/thesis-assignment")
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <GradientCard className="flex flex-col h-full">
                <GradientCardHeader className="flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-3 sm:space-y-0">
                            <div>
                                <GradientCardTitle>Dosen dan Bimbingan</GradientCardTitle>
                                <GradientCardDescription>Daftar dosen beserta mahasiswa bimbingannya</GradientCardDescription>
                            </div>
                            <div className="sm:hidden">
                                <Button
                                    size="sm"
                                    disabled={isNavigating}
                                    onClick={handleAssign}
                                    className="h-8 text-xs px-4 font-semibold rounded-xl cursor-pointer"
                                >
                                    {isNavigating ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                            Memuat...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                                            Tugaskan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        disabled={isNavigating}
                        onClick={handleAssign}
                        className="hidden sm:inline-flex ml-auto shrink-0 h-8 text-xs px-4 font-semibold rounded-xl cursor-pointer"
                    >
                        {isNavigating ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                Memuat...
                            </>
                        ) : (
                            <>
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Tugaskan
                            </>
                        )}
                    </Button>
                </GradientCardHeader>

            {/* Lecturer List */}
            <div className="divide-y divide-border/30">
                {workloads.filter(w => w.total_students > 0).map((lecturer, i) => {
                    const isExpanded = expandedNip === lecturer.nip
                    const barColor = getProgressBarColor(lecturer.avg_progress)

                    return (
                        <div key={lecturer.nip} className="group">
                            {/* Lecturer Row (clickable) */}
                            <button
                                onClick={() => toggleExpand(lecturer.nip)}
                                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                            >
                                <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                                    <AvatarImage src={lecturer.image || "/default_user_photo.png"} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {lecturer.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{lecturer.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">{lecturer.nip}</p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Student avatar stack */}
                                    <div className="hidden sm:flex items-center">
                                        <div className="flex items-center -space-x-2">
                                            {lecturer.students.slice(0, 6).map((student, si) => (
                                                <Avatar
                                                    key={student.nim}
                                                    className="h-7 w-7 border-2 border-card ring-0 shrink-0"
                                                    style={{ zIndex: 6 - si }}
                                                >
                                                    <AvatarImage src={student.student_image || "/default_user_photo.png"} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[8px]">
                                                        {student.student_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {lecturer.total_students > 6 && (
                                                <div
                                                    className="h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center shrink-0"
                                                    style={{ zIndex: 0 }}
                                                >
                                                    <span className="text-[9px] font-bold text-muted-foreground">
                                                        +{lecturer.total_students - 6}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress pill */}
                                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] font-bold">
                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                        <span>{lecturer.avg_progress}%</span>
                                    </div>

                                    {/* Progress bar mini */}
                                    <div className="w-16 h-1.5 bg-muted/50 rounded-full overflow-hidden hidden sm:block">
                                        <motion.div
                                            className={`h-full rounded-full ${barColor}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Number(lecturer.avg_progress) || 0}%` }}
                                            transition={{ duration: 1, delay: 0.1 * i }}
                                        />
                                    </div>

                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </button>

                            {/* Students Panel (expandable) */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-4 pt-1">
                                            {/* Mobile stats */}
                                            <div className="flex sm:hidden items-center gap-2 mb-3">
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] font-bold">
                                                    <Users className="h-3 w-3 text-muted-foreground" />
                                                    <span>{lecturer.total_students} Bimbingan</span>
                                                </div>
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] font-bold">
                                                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                    <span>Rata-rata {lecturer.avg_progress}%</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {lecturer.students.map((student, si) => {
                                                    const progressInfo = PROGRESS_CONFIG[student.progress]

                                                    return (
                                                        <motion.div
                                                            key={student.nim}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.04 * si }}
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30"
                                                        >
                                                            <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                                                                <AvatarImage src={student.student_image || "/default_user_photo.png"} className="object-cover" />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                                                    {student.student_name[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold truncate">{student.student_name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-medium">
                                                                    {student.nim} • Angkatan {student.generation_year}
                                                                </p>
                                                            </div>
                                                            {progressInfo && (
                                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-bold shrink-0 border-none ${progressInfo.badgeBg}`}>
                                                                    {progressInfo.label}
                                                                </Badge>
                                                            )}
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}

                {workloads.filter(w => w.total_students > 0).length === 0 && (
                    <div className="px-5 py-8 text-center">
                        <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Belum ada data bimbingan aktif.</p>
                    </div>
                )}
            </div>
            </GradientCard>
        </motion.div>
    )
}
