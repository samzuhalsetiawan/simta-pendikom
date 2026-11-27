"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { GraduationCap, Mail, IdCard } from "lucide-react"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"

interface Props {
    name: string
    nip: string
    email: string | null
    image: string | null
    activeSupervised: number
    activeExamined: number
    totalGraduated: number
}

export default function LecturerInfoCard({ name, nip, email, image, activeSupervised, activeExamined, totalGraduated }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <GradientCard className="">
                <div className="p-5 flex items-center gap-5">
            <Avatar className="h-16 w-16 shrink-0 border-2 border-primary/20">
                <AvatarImage src={image || "/default_user_photo.png"} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {name[0]}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
                <div>
                    <h3 className="text-base font-heading font-bold truncate leading-tight">{name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <IdCard className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-[11px] text-muted-foreground font-medium">{nip}</span>
                    </div>
                    {email && !email.includes('@unverified') && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[11px] text-muted-foreground font-medium truncate">{email}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full">
                        <GraduationCap className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">{activeSupervised} bimbingan</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 rounded-full">
                        <span className="text-[10px] font-bold text-accent">{activeExamined} pengujian</span>
                    </div>
                    {totalGraduated > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 rounded-full">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{totalGraduated} alumni</span>
                        </div>
                    )}
                </div>
            </div>
            </div>
            </GradientCard>
        </motion.div>
    )
}
