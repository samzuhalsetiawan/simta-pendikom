"use client"

import React, { createContext, useContext, useState } from "react"

type NavbarScrollContextType = {
   isScrolled: boolean
   setIsScrolled: (isScrolled: boolean) => void
}

const NavbarScrollContext = createContext<NavbarScrollContextType | undefined>(undefined)

export function NavbarScrollProvider({ children }: { children: React.ReactNode }) {
   const [isScrolled, setIsScrolled] = useState(false)

   return (
      <NavbarScrollContext.Provider value={{ isScrolled, setIsScrolled }}>
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
