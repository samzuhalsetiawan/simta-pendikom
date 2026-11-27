"use client"

import { motion } from "framer-motion"
import { BookOpen, Users } from "lucide-react"
import type { StudentThesisData } from "@/lib/dal/lecturer"

const PROGRESS_WEIGHT: Record<string, number> = {
    pengajuan_proposal: 0,
    seminar_proposal: 0.2,
    penelitian: 0.4,
    seminar_hasil: 0.6,
    pendadaran: 0.8,
    lulus: 1,
}

function getProgressColor(percentage: number): { stroke: string; text: string; badge: string } {
    if (percentage >= 80) return {
        stroke: '#22c55e',   // green-500
        text: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    }
    if (percentage >= 50) return {
        stroke: '#3b82f6',   // blue-500
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    }
    if (percentage >= 25) return {
        stroke: '#f59e0b',   // amber-500
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    }
    return {
        stroke: '#ef4444',   // red-500
        text: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    }
}

interface Props {
    type: 'supervised' | 'examined'
    activeStudents: StudentThesisData[]
    totalStudents: number
    graduatedCount: number
}

function CircularProgress({ percentage, color, size = 100, strokeWidth = 9 }: { percentage: number; color: string; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-muted/60"
                    strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className="text-xl font-heading font-extrabold tracking-tight"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    {Math.round(percentage)}%
                </motion.span>
            </div>
        </div>
    )
}

export default function ProgressOverview({ type, activeStudents, totalStudents, graduatedCount }: Props) {
    const Icon = type === 'supervised' ? BookOpen : Users
    const title = type === 'supervised' ? 'Progress Bimbingan' : 'Progress Pengujian'
    const activeLabel = type === 'supervised' ? 'mahasiswa bimbingan aktif' : 'mahasiswa yang diuji aktif'

    // Calculate overall percentage
    let percentage = 100
    if (activeStudents.length > 0) {
        const totalWeight = activeStudents.reduce((sum, s) => {
            return sum + (PROGRESS_WEIGHT[s.progress] ?? 0)
        }, 0)
        percentage = (totalWeight / activeStudents.length) * 100
    }

    const colors = getProgressColor(percentage)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border/50 rounded-2xl shadow-sm p-5 flex items-center gap-5"
        >
            <CircularProgress percentage={percentage} color={colors.stroke} />

            <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-xl">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-heading font-bold">{title}</h3>
                </div>

                <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-heading font-extrabold">{activeStudents.length}</span>
                        <span className="text-sm text-muted-foreground font-medium">/ {totalStudents}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{activeLabel}</p>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 rounded-full w-fit">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {graduatedCount} mahasiswa lulus
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
