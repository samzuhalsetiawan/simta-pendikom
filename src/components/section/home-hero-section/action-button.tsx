"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/base/button"
import Link from "next/link"

export function ActionButton() {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.3 }}
         className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4"
      >
         <Button asChild size="lg" className="h-12 px-8 rounded-full text-base shadow-lg transition-all hover:scale-105 hover:shadow-primary/25 active:scale-95 group">
            <Link href="/dashboard" prefetch={false}>
               Pergi ke Dashboard
               <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
         </Button>
      </motion.div>
   )
}
