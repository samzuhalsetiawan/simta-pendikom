"use client"

import { Button } from "@/components/ui/button"
import {
   Sheet,
   SheetClose,
   SheetContent,
   SheetDescription,
   SheetFooter,
   SheetHeader,
   SheetTitle,
   SheetTrigger,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Menu11Icon } from "@hugeicons/core-free-icons"
import { navigationData, type NavigationData } from "./navbar-data"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function SideNavigationSheet(
   { className, ...props }: React.ComponentProps<typeof SheetTrigger>
) {
   return (
      <Sheet>
         <SheetTrigger asChild className={className} {...props}>
            <Button variant="outline" size="icon">
               <HugeiconsIcon icon={Menu11Icon} />
            </Button>
         </SheetTrigger>
         <SheetContent className="overflow-y-auto p-4 md:p-8">
            <SheetHeader>
               <SheetTitle>Menu</SheetTitle>
               <SheetDescription>
                  Navigasi ke halaman lain
               </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-2 mt-4">
               {navigationData.map((item, index) => (
                  <SideNavItem key={index} item={item} />
               ))}
            </div>
            <SheetFooter className="mt-4">
               <SheetClose asChild>
                  <Button variant="outline">Close</Button>
               </SheetClose>
            </SheetFooter>
         </SheetContent>
      </Sheet>
   )
}

function SideNavItem({ item, level = 0 }: { item: NavigationData; level?: number }) {
   const [isOpen, setIsOpen] = useState(false);

   if (item.type === "action") {
      return (
         <SheetClose asChild>
            <Link
               href={item.href}
               className={cn(
                  "flex flex-col items-start w-full py-2 text-sm font-medium transition-colors hover:text-primary gap-1",
                  level > 0 && "pl-4 border-l border-border/50"
               )}
            >
               <span>{item.title}</span>
               {item.description && (
                  <span className="text-xs text-muted-foreground font-normal line-clamp-2">
                     {item.description}
                  </span>
               )}
            </Link>
         </SheetClose>
      )
   }

   return (
      <div className={cn("flex flex-col w-full", level > 0 && "pl-4 border-l border-border/50")}>
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full py-2 text-sm font-semibold transition-colors hover:text-primary text-left"
         >
            {item.title}
            <HugeiconsIcon
               icon={ArrowDown01Icon}
               className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")}
            />
         </button>
         {isOpen && (
            <div className="flex flex-col gap-1 w-full animate-in slide-in-from-top-1 fade-in duration-200">
               {item.data.map((subItem, index) => (
                  <SideNavItem key={index} item={subItem} level={level + 1} />
               ))}
            </div>
         )}
      </div>
   )
}
