"use client"

import { motion } from "framer-motion";
import { ActionButton } from "./action-button";

export function Branding() {
   return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6 max-w-2xl mx-auto lg:mx-0 py-12 lg:py-24 relative z-10"
      >
         <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-foreground leading-[1.15]"
         >
            Sistem Informasi Manajemen Tugas Akhir <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Pendidikan Komputer</span>
         </motion.h1>

         <ActionButton />
         
         {/* Subtle background glow effect */}
         <div className="absolute -z-10 -top-20 -left-20 w-72 h-72 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
         <div className="absolute -z-10 bottom-0 right-20 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>
   )
}