"use client"

import { cn } from "@/lib/utils"
import { useNavbarScroll } from "@/components/navbar-scroll-context";
import { usePathname } from "next/navigation";

interface NavbarContainerProps extends React.HTMLAttributes<HTMLElement> { }

export function NavbarContainer({ children, className, ...props }: NavbarContainerProps) {

   const { isScrolled, isVisible } = useNavbarScroll();
   const pathName = usePathname();

   return (
      <nav {...props} className={cn(
         pathName == "/" ? "fixed" : "sticky",
         "top-0 left-0 z-50 h-(--navbar-height) w-screen flex justify-between items-center",
         "px-4 md:px-16 lg:px-4 xl:px-16 transition-transform duration-300 ease-in-out backdrop-blur-md",
         !isScrolled && pathName == "/" && "lg:backdrop-blur-none",
         isVisible ? "translate-y-0" : "-translate-y-full",
         className
      )}>
         {children}
      </nav>
   )
}