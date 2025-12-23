"use client"

import React, { createContext, useContext, useState } from "react"

type NavbarScrollContextType = {
   isScrolled: boolean
   setIsScrolled: (isScrolled: boolean) => void
   isVisible: boolean
   setIsVisible: (isVisible: boolean) => void
}

const NavbarScrollContext = createContext<NavbarScrollContextType | undefined>(undefined)

export function NavbarScrollProvider({ children }: { children: React.ReactNode }) {
   const [isScrolled, setIsScrolled] = useState(false)
   const [isVisible, setIsVisible] = useState(true)
   const lastScrollY = React.useRef(0)

   React.useEffect(() => {
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
      <NavbarScrollContext.Provider value={{ isScrolled, setIsScrolled, isVisible, setIsVisible }}>
         {children}
      </NavbarScrollContext.Provider>
   )
}

export function useNavbarScroll() {
   const context = useContext(NavbarScrollContext)
   if (context === undefined) {
      throw new Error("useNavbarScroll must be used within a NavbarScrollProvider")
   }
   return context
}
