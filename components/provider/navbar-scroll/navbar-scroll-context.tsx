"use client"

import { createContext } from "react"

type NavbarScrollContextType = {
   isScrolled: boolean
   setIsScrolled: (isScrolled: boolean) => void
   isVisible: boolean
   setIsVisible: (isVisible: boolean) => void
}

export const NavbarScrollContext = createContext<NavbarScrollContextType | undefined>(undefined)