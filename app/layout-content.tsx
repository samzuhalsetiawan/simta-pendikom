"use client"

import { usePathname } from "next/navigation"
import { MainNavbar } from "@/components/main-navbar/main-navbar"
import { Session } from "next-auth"

export function LayoutContent({
   children,
   session
}: {
   children: React.ReactNode;
   session: Session | null;
}) {
   const pathname = usePathname()
   const hideNavbar = pathname === "/login"

   return (
      <>
         {!hideNavbar && <MainNavbar className="lg:fixed lg:top-0 z-50" user={session?.user} />}
         {children}
      </>
   )
}
