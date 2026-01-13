"use client"

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationMenuLink, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import React from "react";
import { useNavbarScroll } from "@/components/provider/navbar-scroll/navbar-scroll-hook";

interface TopNavbarMenuLinkProps extends React.ComponentProps<typeof NavigationMenuPrimitive.Link> { }

export function TopNavbarMenuLink({ children, className, ...props }: TopNavbarMenuLinkProps) {

   const { isScrolled } = useNavbarScroll();
   const pathName = usePathname();
   const triggerClass = cn(
      "bg-transparent transition-colors duration-300",
      !isScrolled ? "dark:text-background dark:hover:text-foreground" : "text-foreground",
      pathName !== '/' && "dark:text-foreground dark:hover:text-background",
      className
   );

   return (
      <NavigationMenuLink {...props} className={navigationMenuTriggerStyle({ className: triggerClass })}>
         {children}
      </NavigationMenuLink>
   )
}

interface TopNavbarMenuTriggerProps extends React.ComponentProps<typeof NavigationMenuPrimitive.Trigger> { }

export function TopNavbarMenuTrigger({
   children,
   className,
   ...props
}: TopNavbarMenuTriggerProps) {

   const { isScrolled } = useNavbarScroll();
   const pathName = usePathname();
   const triggerClass = cn(
      "bg-transparent transition-colors duration-300",
      !isScrolled ? "dark:text-background dark:hover:text-foreground" : "text-foreground",
      pathName !== '/' && "dark:text-foreground dark:hover:text-background",
      className
   );

   return (
      <NavigationMenuTrigger {...props} className={triggerClass}>{children}</NavigationMenuTrigger>
   )
}
