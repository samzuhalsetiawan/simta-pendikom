"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { IdCard, Mail, TrendingUp } from "lucide-react"

interface Props {
    name: string
    nim: string
    email: string | null
    image: string | null
    progressLabel: string
}

export default function StudentInfoCard({ name, nim, email, image, progressLabel }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border/50 rounded-2xl shadow-sm p-5 flex items-center gap-5"
        >
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
                        <span className="text-[11px] text-muted-foreground font-medium">{nim}</span>
                    </div>
                    {email && !email.includes('@unverified') && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[11px] text-muted-foreground font-medium truncate">{email}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full w-fit">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary">{progressLabel}</span>
                </div>
            </div>
        </motion.div>
    )
}
