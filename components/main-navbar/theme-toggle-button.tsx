"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComputerIcon, MoonSlowWindIcon, SmartPhone01Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useIsMobile } from "@/lib/utils"

export function ThemeToggleButton() {
   const { setTheme } = useTheme()
   const isMobile = useIsMobile()

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
               <HugeiconsIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" icon={Sun03Icon} />
               <HugeiconsIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" icon={MoonSlowWindIcon} />
               <span className="sr-only">Toggle theme</span>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
               <HugeiconsIcon className="h-[1.2rem] w-[1.2rem]" icon={Sun03Icon} />
               Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
               <HugeiconsIcon className="h-[1.2rem] w-[1.2rem]" icon={MoonSlowWindIcon} />
               Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
               {isMobile ? (
                  <HugeiconsIcon className="h-[1.2rem] w-[1.2rem]" icon={SmartPhone01Icon} />
               ) : (
                  <HugeiconsIcon className="h-[1.2rem] w-[1.2rem]" icon={ComputerIcon} />
               )}
               System
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
