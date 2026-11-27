"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, GraduationCap, ChevronRight, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/button"
import type { StudentThesisData } from "@/lib/dal/lecturer"

const PROGRESS_INFO: Record<string, { label: string; color: string }> = {
    pengajuan_proposal: { label: 'Pengajuan Proposal', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
    seminar_proposal: { label: 'Seminar Proposal', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    penelitian: { label: 'Penelitian', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    seminar_hasil: { label: 'Seminar Hasil', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    pendadaran: { label: 'Sidang Skripsi', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    lulus: { label: 'Lulus', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
}

interface Props {
    activeStudents: StudentThesisData[]
    graduatedStudents: StudentThesisData[]
}

import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"

export default function GlobalStudentList({ activeStudents, graduatedStudents }: Props) {
    const [showGraduated, setShowGraduated] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const displayStudents = showGraduated
        ? [...activeStudents, ...graduatedStudents]
        : activeStudents

    const filtered = searchQuery
        ? displayStudents.filter(s =>
            s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nim.includes(searchQuery) ||
            (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        : displayStudents

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <GradientCard className="flex flex-col h-full" variant="penelitian">
                <GradientCardHeader variant="penelitian" className="flex-col sm:flex-row gap-3">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Daftar Mahasiswa Skripsi</GradientCardTitle>
                            <GradientCardDescription>Seluruh mahasiswa aktif di program studi.</GradientCardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 pr-3 text-xs rounded-xl border border-border/50 bg-background focus:bg-background focus:border-primary/50 outline-none transition-colors w-full sm:w-48"
                            />
                        </div>
                    </div>
                </GradientCardHeader>

            {filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">
                        {searchQuery ? 'Tidak ditemukan.' : 'Tidak ada mahasiswa skripsi saat ini.'}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
                    {filtered.map((item, i) => {
                        const progressInfo = PROGRESS_INFO[item.progress] || { label: item.progress, color: 'bg-muted text-muted-foreground' }
                        return (
                            <motion.div
                                key={`${item.nim}-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.02 * i }}
                                className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-9 w-9 shrink-0">
                                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                            {item.student_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{item.student_name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{item.nim} • {item.title || "Judul belum diatur"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <Badge variant="outline" className={`hidden sm:inline-flex h-5 text-[10px] px-2 font-bold ${progressInfo.color}`}>
                                        {progressInfo.label}
                                    </Badge>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {graduatedStudents.length > 0 && (
                <div className="border-t border-border/50 px-5 py-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowGraduated(!showGraduated)}
                        className="w-full h-8 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors rounded-xl"
                    >
                        {showGraduated
                            ? `Sembunyikan ${graduatedStudents.length} alumni`
                            : `Tampilkan ${graduatedStudents.length} alumni yang sudah lulus`
                        }
                    </Button>
                </div>
            )}
            </GradientCard>
        </motion.div>
    )
}
