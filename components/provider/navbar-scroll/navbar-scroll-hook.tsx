"use client"

import { use } from "react"
import { NavbarScrollContext } from "./navbar-scroll-context"

export function useNavbarScroll() {
   const context = use(NavbarScrollContext)
   if (context === undefined) {
      throw new Error("useNavbarScroll must be used within a NavbarScrollProvider")
   }
   return context
}