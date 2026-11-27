"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/base/button"
import { Sparkles, ArrowRight, PlayCircle } from "lucide-react"

interface Props {
    studentName: string
    thesisProgressLabel: string | null
}

export default function StudentHero({ studentName, thesisProgressLabel }: Props) {
    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20"
        >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 w-fit"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                        <span className="text-xs font-bold tracking-wide text-white">Akademik Aktif</span>
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-tight">
                        Halo, {studentName.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-primary-foreground/90 max-w-md font-medium text-sm sm:text-base leading-relaxed">
                        {thesisProgressLabel ? (
                            <>Kamu sedang di tahap <strong className="text-orange-300">{thesisProgressLabel}</strong>. Yuk selesaikan tugas akhirmu selangkah demi selangkah!</>
                        ) : (
                            <>Kamu belum mengajukan judul Tugas Akhir. Segera hubungi koordinator untuk memulai perjalananmu!</>
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="bg-white text-primary hover:bg-neutral-100 rounded-xl font-bold shadow-lg shadow-black/10 transition-transform hover:scale-105 active:scale-95">
                        <PlayCircle className="mr-2 h-4 w-4 text-orange-500" />
                        Mulai Bimbingan
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white rounded-xl font-bold backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
                        Cek Riwayat
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/30 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
            
            <motion.div 
                animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute right-10 top-10 h-16 w-16 opacity-20 pointer-events-none hidden md:block"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </motion.div>
        </motion.section>
    )
}
