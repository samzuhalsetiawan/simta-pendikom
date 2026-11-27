"use client"

import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/base/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function Forbidden403() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] items-center justify-center text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md"
            >
                <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="h-12 w-12 text-rose-500" />
                </div>
                <h1 className="text-4xl font-heading font-extrabold mb-3">403 Forbidden</h1>
                <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                    Maaf, Anda tidak memiliki akses ke halaman ini. Halaman ini memerlukan perizinan peran khusus.
                </p>
                <Button asChild size="lg" className="rounded-full shadow-md">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                </Button>
            </motion.div>
        </div>
    )
}
