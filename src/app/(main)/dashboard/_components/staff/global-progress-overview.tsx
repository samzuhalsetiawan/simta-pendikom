"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"
import type { StudentThesisData } from "@/lib/dal/lecturer"
import { cva } from "class-variance-authority"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"

const stepTextVariants = cva(
    "text-xl sm:text-3xl font-heading font-extrabold",
    {
        variants: {
            stepType: {
                pengajuan_proposal: "text-pengajuan-proposal",
                seminar_proposal: "text-seminar-proposal",
                penelitian: "text-penelitian",
                seminar_hasil: "text-seminar-hasil",
                pendadaran: "text-sidang-skripsi",
                lulus: "text-lulus",
                default: "text-muted-foreground"
            }
        },
        defaultVariants: { stepType: "default" }
    }
);

const stepLabelVariants = cva(
    "text-[9px] sm:text-[11px] font-medium text-center mt-1 sm:mt-2 leading-tight break-words",
    {
        variants: {
            stepType: {
                pengajuan_proposal: "text-pengajuan-proposal",
                seminar_proposal: "text-seminar-proposal",
                penelitian: "text-penelitian",
                seminar_hasil: "text-seminar-hasil",
                pendadaran: "text-sidang-skripsi",
                lulus: "text-lulus",
                default: "text-muted-foreground"
            }
        },
        defaultVariants: { stepType: "default" }
    }
);

const STEPS = [
    { label: "Pengajuan Proposal", step: 'pengajuan_proposal' },
    { label: "Seminar Proposal", step: 'seminar_proposal' },
    { label: "Penelitian", step: 'penelitian' },
    { label: "Seminar Hasil", step: 'seminar_hasil' },
    { label: "Sidang Skripsi", step: 'pendadaran' },
    { label: "Lulus", step: 'lulus' },
] as const;

interface Props {
    activeStudents: StudentThesisData[]
    totalStudents: number
    graduatedCount: number
}

export default function GlobalProgressOverview({ activeStudents, totalStudents, graduatedCount }: Props) {
    const stats: Record<string, number> = { lulus: graduatedCount };
    activeStudents.forEach(s => {
        if (s.progress) {
            stats[s.progress] = (stats[s.progress] || 0) + 1;
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <GradientCard className="shadow-sm">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Progress Skripsi Prodi</GradientCardTitle>
                            <GradientCardDescription>Pantau sebaran tahapan skripsi seluruh mahasiswa aktif.</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
                
                <div className="px-1 pb-5 pt-3 sm:px-5 w-full">
                    <div className="flex flex-row divide-x divide-emerald-500/15 w-full">
                        {STEPS.map((s, i) => {
                            const count = stats[s.step] || 0;
                            const stepType = s.step as keyof typeof stepTextVariants;
                            return (
                                <div key={i} className="flex flex-col items-center justify-start py-1 sm:py-2 px-0.5 sm:px-3 flex-1 min-w-0">
                                    <span className={stepTextVariants({ stepType })}>{count}</span>
                                    <span className={stepLabelVariants({ stepType })}>
                                        {s.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </GradientCard>
        </motion.div>
    )
}
