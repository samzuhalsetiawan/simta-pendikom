"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { NavbarScrollProvider } from "@/components/navbar-scroll-context"
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
