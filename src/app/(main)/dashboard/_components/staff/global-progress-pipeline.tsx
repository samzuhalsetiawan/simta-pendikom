"use client"

import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"
import type { PipelineStats } from "@/lib/dal/lecturer"

const STAGES = [
    { key: 'pengajuan_proposal', label: 'Pengajuan', shortLabel: 'Proposal', emoji: '📝' },
    { key: 'seminar_proposal', label: 'Sempro', shortLabel: 'Sempro', emoji: '🎤' },
    { key: 'penelitian', label: 'Penelitian', shortLabel: 'Riset', emoji: '🔬' },
    { key: 'seminar_hasil', label: 'Semhas', shortLabel: 'Semhas', emoji: '📊' },
    { key: 'pendadaran', label: 'Sidang Skripsi', shortLabel: 'Sidang', emoji: '🎓' },
    { key: 'lulus', label: 'Lulus', shortLabel: 'Lulus', emoji: '✅' },
] as const

interface Props {
    stats: PipelineStats
}

export default function GlobalProgressPipeline({ stats }: Props) {
    const total = Object.values(stats).reduce((a, b) => a + b, 0)

    if (total === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm"
        >
            <h3 className="text-base font-heading font-bold mb-1 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Pipeline Mahasiswa Aktif
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Sebaran seluruh mahasiswa aktif di setiap fase tugas akhir.</p>

            <div className="flex items-stretch gap-1">
                {STAGES.map((stage, i) => {
                    const count = stats[stage.key as keyof PipelineStats]
                    const isActive = count > 0

                    return (
                        <motion.div
                            key={stage.key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 * i }}
                            className="flex-1 flex flex-col items-center relative"
                        >
                            {/* Connector line */}
                            {i < STAGES.length - 1 && (
                                <div className="absolute top-8 left-[calc(50%+1rem)] right-[-50%] h-0.5 bg-border z-0 hidden md:block" />
                            )}

                            {/* Circle with count */}
                            <div className={`
                                relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center transition-all
                                ${isActive
                                    ? 'bg-primary/10 border-2 border-primary/30 shadow-sm'
                                    : 'bg-muted/50 border border-border/50'
                                }
                            `}>
                                <span className="text-sm md:text-base">{stage.emoji}</span>
                                <span className={`text-sm md:text-lg font-heading font-extrabold leading-none ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                    {count}
                                </span>
                            </div>

                            {/* Label */}
                            <span className={`mt-2 text-[10px] md:text-xs font-semibold text-center leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                                <span className="hidden md:inline">{stage.label}</span>
                                <span className="md:hidden">{stage.shortLabel}</span>
                            </span>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
