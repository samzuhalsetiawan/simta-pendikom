"use client"

import { useNavbarScroll } from "@/components/provider/navbar-scroll/navbar-scroll-hook";
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function NavbarBrandDescription() {

   const { isScrolled } = useNavbarScroll();
   const pathName = usePathname();

   return (
      <div className="ml-2 lg:ml-4">
         <h3 className={cn(
            "text-xs lg:text-lg font-bold transition-colors duration-300",
            !isScrolled && pathName == "/" && "lg:dark:text-background"
         )}>Pendidikan Komputer</h3>
         <p className={cn("text-[0.6em] lg:text-sm transition-colors duration-300", !isScrolled && pathName == "/" && "lg:dark:text-background")}>Fakultas Keguruan dan Ilmu Pendidikan</p>
      </div>
   )
}