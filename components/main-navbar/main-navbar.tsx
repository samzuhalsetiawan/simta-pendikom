"use client"

import Image from "next/image";
import { SideNavigationSheet } from "./side-navigation-sheet";
import { TopNavigationBar } from "./top-navigation-bar";
import { cn } from "@/lib/utils";
import { ThemeToggleButton } from "./theme-toggle-button";
import { useNavbarScroll } from "@/components/navbar-scroll-context";

interface MainNavbarProps extends React.HTMLAttributes<HTMLElement> {
    user?: any | null;
}

export function MainNavbar(
    { className, user, ...props }: MainNavbarProps
) {
    const { isScrolled } = useNavbarScroll();

    return (
        <nav className={cn(
            "h-(--navbar-height) w-screen bg-background flex justify-between items-center pt-4 pb-4 pl-4 pr-4 md:pl-16 md:pr-16 lg:pl-4 lg:pr-4 xl:pl-16 xl:pr-16 transition-colors duration-300",
            !isScrolled ? "lg:bg-transparent" : "lg:bg-background lg:border-b",
            className
        )} {...props}>
            <div className="flex items-center">
                <div className="w-[2.5em] md:w-[4em] aspect-square">
                    <img src="/unmul-small.png" alt="Mulawarman University Icon" />
                </div>
                <div className="ml-2 lg:ml-4">
                    <h3 className={cn("text-xs lg:text-lg font-bold transition-colors duration-300", !isScrolled && "lg:dark:text-background")}>Pendidikan Komputer</h3>
                    <p className={cn("text-[0.6em] lg:text-sm transition-colors duration-300", !isScrolled && "lg:dark:text-background")}>Fakultas Keguruan dan Ilmu Pendidikan</p>
                </div>
            </div>
            <div className="flex items-center xl:gap-2">
                <TopNavigationBar className="hidden lg:block" user={user} />
                <ThemeToggleButton />
                <SideNavigationSheet className="lg:hidden" user={user} />
            </div>
        </nav>
    )
}