"use client"

import { useEffect, useRef } from "react";
import { useNavbarScroll } from "./navbar-scroll-hook";

export function ScrollAwareSection({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
   const { setIsScrolled } = useNavbarScroll()
   const ref = useRef<HTMLElement>(null)

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            // If less than 50% of the hero is visible, we consider it scrolled
            setIsScrolled(!entry.isIntersecting)
         },
         { threshold: 0.5 }
      )

      if (ref.current) {
         observer.observe(ref.current)
      }

      return () => observer.disconnect()
   }, [setIsScrolled])

   return (
      <section ref={ref} className={className} {...props}>
         {children}
      </section>
   )
}
