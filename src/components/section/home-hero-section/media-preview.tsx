"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

const carouselImages = [
  "/carousel1.png",
  "/carousel2.png",
  "/carousel3.png",
]

export function MediaPreview() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="relative h-full lg:h-[28em] w-full overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={carouselImages[currentImageIndex]}
            alt="Mahasiswa mengerjakan skripsi"
            fill
            className="object-cover object-center lg:object-left"
            priority={true}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>
      {/* Subtle gradient to blend with background: full overlay on mobile, left-to-right fade on desktop */}
      <div className="absolute inset-0 bg-background/85 dark:bg-background/90 lg:bg-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/80 lg:via-30% lg:to-transparent w-full pointer-events-none" />
    </motion.div>
  )
}