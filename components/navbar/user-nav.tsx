"use client"

import { signOut } from "next-auth/react"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, Logout01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"

interface UserNavProps {
   user: User,
   isScrolled?: boolean,
   className?: string
}

export function UserNav({ user, isScrolled, className }: UserNavProps) {
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
                     {user.role === "lecturer" ? "Dosen" : user.role === "student" ? "Mahasiswa" : "Unknown"}
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
