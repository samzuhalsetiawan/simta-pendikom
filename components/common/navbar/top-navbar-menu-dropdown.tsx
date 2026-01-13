"use client"

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { NavigationData } from "./navbar-data";
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { TopNavbarMenuTrigger } from "./top-navbar-menu";

interface TopNavbarMenuDropdownProps extends React.ComponentProps<typeof NavigationMenuItem> {
   item: NavigationData;
}

export function TopNavbarMenuDropdown({ item, ...props }: TopNavbarMenuDropdownProps) {
   if (item.type !== "dropdown") {
      return null;
   }
   return (
      <NavigationMenuItem {...props}>
         <TopNavbarMenuTrigger>{item.title}</TopNavbarMenuTrigger>
         <NavigationMenuContent className="right-0 left-auto">
            <ul className="flex flex-col items-end gap-2 p-4 min-w-[250px] max-h-[70vh] overflow-y-auto">
               {item.data.map((subItem, index) => (
                  <ContentItem key={index} item={subItem} />
               ))}
            </ul>
         </NavigationMenuContent>
      </NavigationMenuItem>
   );
}

interface ContentItemProps extends React.HTMLAttributes<HTMLLIElement> {
   item: NavigationData;
}

function ContentItem({
   item,
   className,
   ...props
}: ContentItemProps) {
   const [isOpen, setIsOpen] = useState(false);

   if (item.type === "dropdown") {
      return (
         <li {...props} className={cn("flex flex-col items-end w-full", className)}>
            <button
               onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(!isOpen);
               }}
               className="flex items-center justify-end gap-2 mb-2 text-sm font-semibold text-foreground text-right w-full cursor-pointer hover:text-accent-foreground/80 transition-colors"
            >
               <span>{item.title}</span>
               <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")}
               />
            </button>
            {isOpen && (
               <ul className="flex flex-col gap-2 pr-2 border-r border-border/50 items-end w-full animate-in slide-in-from-top-1 fade-in duration-200">
                  {item.data.map((subItem, index) => (
                     <ContentItem key={index} item={subItem} />
                  ))}
               </ul>
            )}
         </li>
      )
   }
   return (
      <ListItem href={item.href} title={item.title}>
         {item.description}
      </ListItem>
   );
}

function ListItem({
   title,
   children,
   href,
   ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
   return (
      <li {...props} className="w-full">
         <NavigationMenuLink className="flex-col items-end text-right w-full" asChild>
            <Link href={href}>
               <div className="text-sm leading-none font-medium text-right w-full">{title}</div>
               <p className="text-muted-foreground line-clamp-2 text-sm leading-snug text-right w-full">
                  {children}
               </p>
            </Link>
         </NavigationMenuLink>
      </li>
   )
}