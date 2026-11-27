"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import { X, PanelRightClose } from "lucide-react"
import { Button } from "@/components/base/button"

interface Props {
    children: React.ReactNode
    triggerButton: React.ReactNode
    title?: string
}

export default function MobileSidebarDrawer({ children, triggerButton, title }: Props) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {triggerButton}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden" />
                <AnimatePresence>
                    <Dialog.Content asChild forceMount aria-describedby={undefined}>
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className="fixed right-0 top-0 bottom-0 z-[110] w-full max-w-sm bg-background shadow-2xl border-l border-border overflow-y-auto focus:outline-none lg:hidden"
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-5 py-4 flex items-center justify-between">
                                <Dialog.Title className="text-sm font-heading font-bold flex items-center gap-2">
                                    <PanelRightClose className="h-4 w-4 text-primary" />
                                    {title || "Aksi & Informasi"}
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </Dialog.Close>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-5">
                                {children}
                            </div>
                        </motion.div>
                    </Dialog.Content>
                </AnimatePresence>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
