"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme/theme-provider"
import { NavbarScrollProvider } from "@/components/provider/navbar-scroll/navbar-scroll-provider"
import { TopProgressBarProvider } from "./top-progress-bar/top-progress-bar-provider"

export function ClientProvider({ children }: { children: React.ReactNode }) {
   return (
      <SessionProvider>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
         >
            <TopProgressBarProvider>
               <NavbarScrollProvider>
                  {children}
               </NavbarScrollProvider>
            </TopProgressBarProvider>
         </ThemeProvider>
      </SessionProvider>
   )
}
