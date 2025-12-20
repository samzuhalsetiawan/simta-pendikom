"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { NavbarScrollProvider } from "@/components/navbar-scroll-context"

export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <SessionProvider>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
         >
            <NavbarScrollProvider>
               {children}
            </NavbarScrollProvider>
         </ThemeProvider>
      </SessionProvider>
   )
}
