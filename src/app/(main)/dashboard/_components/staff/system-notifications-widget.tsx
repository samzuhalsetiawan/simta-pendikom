"use client"

import { motion } from "framer-motion"
import { Bell, AlertCircle, Info, ShieldAlert } from "lucide-react"

interface Notification {
    type: 'warning' | 'error' | 'info'
    message: string
}

const NOTIFICATIONS: Notification[] = [
    {
        type: 'warning',
        message: 'Server maintenance akan dilakukan pada jam 23:00 WIB. Mohon backup data terlebih dahulu.',
    },
    {
        type: 'error',
        message: 'Error syncing with Siakad: 4 mahasiswa gagal diverifikasi datanya.',
    },
]

const TYPE_CONFIG = {
    warning: {
        icon: AlertCircle,
        border: 'border-l-amber-500',
        bg: 'bg-amber-50/50 dark:bg-amber-950/20',
        iconColor: 'text-amber-500',
    },
    error: {
        icon: ShieldAlert,
        border: 'border-l-rose-500',
        bg: 'bg-rose-50/50 dark:bg-rose-950/20',
        iconColor: 'text-rose-500',
    },
    info: {
        icon: Info,
        border: 'border-l-blue-500',
        bg: 'bg-blue-50/50 dark:bg-blue-950/20',
        iconColor: 'text-blue-500',
    },
}

export default function SystemNotificationsWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
        >
            <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-xl">
                    <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-heading font-bold">Pemberitahuan Sistem</h3>
                    <p className="text-[10px] text-muted-foreground">Notifikasi & alert terbaru</p>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {NOTIFICATIONS.map((notif, i) => {
                    const config = TYPE_CONFIG[notif.type]
                    const Icon = config.icon

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={`flex gap-3 items-start border-l-2 ${config.border} pl-3 ${config.bg} p-2.5 rounded-r-xl`}
                        >
                            <Icon className={`h-4 w-4 ${config.iconColor} mt-0.5 shrink-0`} />
                            <p className="text-xs leading-relaxed">{notif.message}</p>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
