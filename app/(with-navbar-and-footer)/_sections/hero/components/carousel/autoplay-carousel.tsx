"use client"

import { Carousel } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"

export function AutoplayCarousel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Carousel>) {

   const plugin = useRef(
        Autoplay({ delay: 4500, stopOnInteraction: false })
    )

   return (
      <Carousel plugins={[plugin.current]} className={cn("w-screen overflow-x-hidden", className)} {...props}>
         {children}
      </Carousel>
   )
}