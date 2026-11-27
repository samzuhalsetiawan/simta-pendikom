"use client"

import { motion } from "framer-motion"
import { TrendingUp, FileText, Search, ClipboardCheck, GraduationCap, CheckCircle2, Presentation } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"

interface Props {
    currentProgress: string | null
    overallPercentage: number
}

const STEPS = [
    { label: "Proposal", step: 'pengajuan_proposal', icon: FileText },
    { label: "Sempro", step: 'seminar_proposal', icon: Presentation },
    { label: "Penelitian", step: 'penelitian', icon: Search },
    { label: "Semhas", step: 'seminar_hasil', icon: ClipboardCheck },
    { label: "Sidang", step: 'pendadaran', icon: GraduationCap },
    { label: "Lulus", step: 'lulus', icon: CheckCircle2 },
]

export default function ProgressTimelineWidget({ currentProgress, overallPercentage }: Props) {
    const stepsIds = STEPS.map(s => s.step)
    const currentStepIndex = currentProgress ? stepsIds.indexOf(currentProgress) : -1

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <GradientCard className="shadow-sm">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Milestone Tugas Akhir</GradientCardTitle>
                            <GradientCardDescription>Lacak tahapan skripsi kamu hingga lulus.</GradientCardDescription>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <span className="text-2xl font-heading font-extrabold text-primary">{overallPercentage}%</span>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Selesai</p>
                    </div>
                </GradientCardHeader>
            
            <div className="p-6 pt-10 pb-8 overflow-x-auto">
                <div className="relative min-w-[500px]">
                    {/* Background Track */}
                    <div className="absolute top-5 left-0 w-full h-1.5 bg-muted rounded-full" />
                    
                    {/* Progress Fill */}
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, (Number(overallPercentage) || 0) - 5)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        className="absolute top-5 left-0 h-1.5 bg-primary rounded-full"
                    />

                    <div className="relative z-10 flex justify-between items-start">
                        {STEPS.map((s, i) => {
                            const thisStepIndex = i
                            const isCompleted = thisStepIndex < currentStepIndex || (currentProgress === 'lulus' && thisStepIndex <= currentStepIndex)
                            const isOngoing = thisStepIndex === currentStepIndex && currentProgress !== 'lulus'
                            const isPending = thisStepIndex > currentStepIndex
                            
                            return (
                                <div key={i} className="flex flex-col items-center gap-3 w-1/6">
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.4 + (i * 0.1) }}
                                        className={`h-11 w-11 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative
                                            ${isCompleted 
                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30' 
                                                : isOngoing 
                                                    ? 'bg-background border-primary text-primary shadow-lg shadow-primary/20 scale-110 z-20' 
                                                    : 'bg-muted border-background text-muted-foreground'
                                            }`}
                                    >
                                        {isOngoing && (
                                            <span className="absolute inset-0 rounded-full border border-primary animate-ping opacity-75" />
                                        )}
                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                                    </motion.div>
                                    
                                    <div className="text-center space-y-1.5 flex flex-col items-center">
                                        <p className={`text-[11px] font-bold ${isOngoing ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {s.label}
                                        </p>
                                        {isOngoing && (
                                            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Aktif</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            </GradientCard>
        </motion.div>
    )
}
