"use client"

import { useEffect, useRef, useState } from "react"
import { NavbarScrollContext } from "./navbar-scroll-context"



export function NavbarScrollProvider({ children }: { children: React.ReactNode }) {
   const [isScrolled, setIsScrolled] = useState(false)
   const [isVisible, setIsVisible] = useState(true)
   const lastScrollY = useRef(0)

   useEffect(() => {
      const handleScroll = () => {
         const currentScrollY = window.scrollY

         if (currentScrollY < 10) {
            setIsVisible(true)
         } else if (currentScrollY > lastScrollY.current) {
            setIsVisible(false) // Scrolling down -> Hide
         } else {
            setIsVisible(true)  // Scrolling up -> Show
         }

         lastScrollY.current = currentScrollY
      }

      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
   }, [])

   return (
      <NavbarScrollContext value={{ isScrolled, setIsScrolled, isVisible, setIsVisible }}>
         {children}
      </NavbarScrollContext>
   )
}
