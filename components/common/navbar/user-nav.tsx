"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, UserIcon, Login01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useNavbarScroll } from "@/components/provider/navbar-scroll/navbar-scroll-hook"
import { useUserDetail } from "@/hooks/data-fetcher/user"

interface UserNavProps {
   className?: string
}

export function UserNav({ className }: UserNavProps) {
   const { data: session } = useSession();
   const { user, isLoading } = useUserDetail();
   const { isScrolled } = useNavbarScroll();

   if (!session?.user) {
      return (
         <Link href="/login">
            <Button
               variant="ghost"
               aria-label="Login"
               className={cn(
                  "relative flex items-center gap-2 transition-colors duration-300",
                  !isScrolled
                     ? "border-background/20 bg-background/10 hover:bg-background/20 text-foreground dark:text-background"
                     : "border-border bg-muted/50 hover:bg-muted text-foreground",
                  className
               )}
            >
               <HugeiconsIcon icon={Login01Icon} className="h-4 w-4" />
               <span>Login</span>
            </Button>
         </Link>
      );
   }

   // Show skeleton while loading
   if (isLoading || !user) {
      return (
         <Skeleton
            className={cn(
               "h-10 w-10 rounded-full",
               className
            )}
         />
      );
   }

   const initials = user.name
   ? user.name
   .split(" ")
   .map((n) => n[0])
   .join("")
   .toUpperCase()
   .substring(0, 2)
   : "U"

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant="ghost"
               aria-label="Menu User"
               className={cn(
                  "relative h-10 w-10 rounded-full flex items-center justify-center border transition-colors duration-300",
                  !isScrolled
                     ? "border-background/20 bg-background/10 hover:bg-background/20 text-foreground dark:text-background"
                     : "border-border bg-muted/50 hover:bg-muted text-foreground",
                  className
               )}
            >
               {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-full w-full rounded-full object-cover" />
               ) : (
                  <span className="text-xs font-bold">{initials}</span>
               )}
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
               <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground uppercase">
                     {session.user.role === "lecturer" ? "Dosen" : session.user.role === "student" ? "Mahasiswa" : "Unknown"}
                  </p>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
               <HugeiconsIcon icon={UserIcon} className="mr-2 h-4 w-4" />
               <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               className="cursor-pointer text-red-600 focus:text-red-600"
               onClick={() => signOut()}
            >
               <HugeiconsIcon icon={Logout01Icon} className="mr-2 h-4 w-4" />
               <span>Log out</span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
