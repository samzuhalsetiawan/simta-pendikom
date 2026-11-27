"use client"

import { motion } from "framer-motion"
import { FileText, Search, ClipboardCheck, GraduationCap, CheckCircle2, Presentation, TrendingUp, Check } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription, variantIconStyles, type GradientCardVariant } from "@/components/shared/gradient-card"

interface Props {
    currentProgress?: string | null;
    overallPercentage?: number;
    title?: string;
    subtitle?: string;
}

const STEPS = [
    { label: "Pengajuan Proposal", step: 'pengajuan_proposal', icon: FileText },
    { label: "Seminar Proposal", step: 'seminar_proposal', icon: Presentation },
    { label: "Penelitian", step: 'penelitian', icon: Search },
    { label: "Seminar Hasil", step: 'seminar_hasil', icon: ClipboardCheck },
    { label: "Sidang Skripsi", step: 'pendadaran', icon: GraduationCap },
    { label: "Lulus", step: 'lulus', icon: CheckCircle2 },
]

const getStepColors = (stepId: string) => {
    switch (stepId) {
        case 'pengajuan_proposal': return { bg: 'bg-pengajuan-proposal', border: 'border-pengajuan-proposal', text: 'text-pengajuan-proposal', from: 'from-pengajuan-proposal', to: 'to-pengajuan-proposal' };
        case 'seminar_proposal': return { bg: 'bg-seminar-proposal', border: 'border-seminar-proposal', text: 'text-seminar-proposal', from: 'from-seminar-proposal', to: 'to-seminar-proposal' };
        case 'penelitian': return { bg: 'bg-penelitian', border: 'border-penelitian', text: 'text-penelitian', from: 'from-penelitian', to: 'to-penelitian' };
        case 'seminar_hasil': return { bg: 'bg-seminar-hasil', border: 'border-seminar-hasil', text: 'text-seminar-hasil', from: 'from-seminar-hasil', to: 'to-seminar-hasil' };
        case 'pendadaran': return { bg: 'bg-sidang-skripsi', border: 'border-sidang-skripsi', text: 'text-sidang-skripsi', from: 'from-sidang-skripsi', to: 'to-sidang-skripsi' };
        case 'lulus': return { bg: 'bg-lulus', border: 'border-lulus', text: 'text-lulus', from: 'from-lulus', to: 'to-lulus' };
        default: return { bg: 'bg-primary', border: 'border-primary', text: 'text-primary', from: 'from-primary', to: 'to-primary' };
    }
}

export default function StudentProgressPipeline({ 
    currentProgress, 
    title = "Progress Skripsi",
    subtitle = "Lacak tahapan skripsi kamu hingga lulus."
}: Props) {
    const HeaderIcon = TrendingUp;
    const stepsIds = STEPS.map(s => s.step);
    const currentStepIndex = currentProgress ? stepsIds.indexOf(currentProgress) : -1;

    // Hitung persentase secara dinamis: (Index Tahap Saat Ini + 1) / Total Tahap * 100
    const dynamicPercentage = currentStepIndex === -1 ? 0 : Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

    let activeVariant: GradientCardVariant = "primary";
    switch (currentProgress) {
        case 'pengajuan_proposal': activeVariant = 'pengajuan-proposal'; break;
        case 'seminar_proposal': activeVariant = 'seminar-proposal'; break;
        case 'penelitian': activeVariant = 'penelitian'; break;
        case 'seminar_hasil': activeVariant = 'seminar-hasil'; break;
        case 'pendadaran': activeVariant = 'sidang-skripsi'; break;
        case 'lulus': activeVariant = 'lulus'; break;
    }

    const activeColorClass = variantIconStyles[activeVariant];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <GradientCard variant={activeVariant} className="shadow-sm">
                <GradientCardHeader variant={activeVariant}>
                    <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 bg-current/10 ${activeColorClass}`}>
                            <HeaderIcon className={`h-4 w-4`} />
                        </div>
                        <div>
                            <GradientCardTitle>{title}</GradientCardTitle>
                            <GradientCardDescription>{subtitle}</GradientCardDescription>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <span className={`text-2xl font-heading font-extrabold ${activeColorClass}`}>{dynamicPercentage}%</span>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Selesai</p>
                    </div>
                </GradientCardHeader>
            
            <div className="px-2 py-6 sm:p-6 sm:pt-10 sm:pb-8 w-full">
                <div className="flex justify-between items-start w-full">
                    {STEPS.map((step, i) => {
                        const isDone = i < currentStepIndex || (currentProgress === 'lulus' && i <= currentStepIndex);
                        const isActive = i === currentStepIndex && currentProgress !== 'lulus';
                        const colors = getStepColors(step.step);
                        
                        return (
                            <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-3 flex-1 relative px-0.5">
                                {i < STEPS.length - 1 && (
                                    <div className="absolute top-2 sm:top-2.5 left-[50%] w-full flex items-center justify-center px-1 sm:px-4" style={{ transform: 'translateY(-50%)' }}>
                                        <div className={`w-full h-0.5 rounded-full ${isDone ? `bg-gradient-to-r ${colors.from} ${getStepColors(STEPS[i+1].step).to}` : 'bg-border'}`} />
                                    </div>
                                )}
                                {isDone ? (
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${colors.bg} flex items-center justify-center shrink-0 z-10`}>
                                        <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                ) : isActive ? (
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${colors.border} flex items-center justify-center shrink-0 z-10 bg-background`}>
                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colors.bg}`} />
                                    </div>
                                ) : (
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${colors.border} flex items-center justify-center shrink-0 z-10 bg-background opacity-30`} />
                                )}
                                <div className={`text-[9px] sm:text-[11px] font-bold text-center flex flex-col leading-tight break-words max-w-full ${colors.text} ${(!isDone && !isActive) ? 'opacity-40' : ''}`}>
                                    {step.label.split(' ').map((word, wIdx) => (
                                        <span key={wIdx} className="truncate sm:overflow-visible">{word}</span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            </GradientCard>
        </motion.div>
    )
}
