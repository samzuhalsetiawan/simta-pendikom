"use client"

import { motion } from "framer-motion"
import { Download, UserPlus, ArrowRight, Zap, FileCheck } from "lucide-react"
import Link from "next/link"

import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"

export default function QuickActionsWidget() {
    const actions = [
        {
            href: "/dashboard/thesis-assignment",
            icon: FileCheck,
            label: "Penugasan Skripsi",
            description: "Tugaskan dosen pembimbing & penguji",
            iconBg: "bg-primary/10 text-primary",
        },
        {
            href: "#",
            icon: UserPlus,
            label: "Import User Batch",
            description: "Import data mahasiswa & dosen",
            iconBg: "bg-primary/10 text-primary",
        },
        {
            href: "#",
            icon: Download,
            label: "Generate Laporan TA",
            description: "Unduh laporan tugas akhir",
            iconBg: "bg-accent/10 text-accent",
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <GradientCard className="flex flex-col h-full" variant="pengajuan-proposal">
                <GradientCardHeader variant="pengajuan-proposal">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>Aksi Cepat</GradientCardTitle>
                            <GradientCardDescription>Shortcuts fitur admin</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>

                <div className="p-4 grid gap-3">
                    {actions.map((action, i) => (
                        <Link key={i} href={action.href} className="block outline-none group">
                            <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-sm rounded-xl transition-all cursor-pointer">
                                <div className={`p-1.5 rounded-lg group-hover:scale-110 transition-transform ${action.iconBg}`}>
                                    <action.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold block truncate">{action.label}</span>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                            </div>
                        </Link>
                    ))}
                </div>
            </GradientCard>
        </motion.div>
    )
}
