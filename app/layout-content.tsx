"use client"

import { usePathname } from "next/navigation"
import { MainNavbar } from "@/components/main-navbar/main-navbar"
import { Session } from "next-auth"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner";

export function LayoutContent({
   children,
   session
}: {
   children: React.ReactNode;
   session: Session | null;
}) {
   const pathname = usePathname()
   const isHomePage = pathname === "/"
   const hideNavbar = pathname === "/login"

   return (
      <>
         {!hideNavbar && <MainNavbar user={session?.user} />}
         <div className={cn(!hideNavbar && !isHomePage && "pt-(--navbar-height)")}>
            {children}
            <Toaster richColors position="top-right" />
         </div>
      </>
   )
}
