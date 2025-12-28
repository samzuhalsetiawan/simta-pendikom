"use client"

import Image from "next/image";
import { SideNavigationSheet } from "./side-navigation-sheet";
import { TopNavigationBar } from "./top-navigation-bar";
import { cn } from "@/lib/utils";
import { ThemeToggleButton } from "./theme-toggle-button";
import { useNavbarScroll } from "@/components/navbar-scroll-context";
import { usePathname } from "next/navigation";

interface MainNavbarProps extends React.HTMLAttributes<HTMLElement> {
    user?: any | null;
}

export function MainNavbar(
    { className, user, ...props }: MainNavbarProps
) {
    const { isScrolled, isVisible } = useNavbarScroll();
    const pathName = usePathname();

    return (
        <nav className={cn(
            "fixed top-0 left-0 z-50 h-(--navbar-height) w-screen flex justify-between items-center",
            "px-4 md:px-16 lg:px-4 xl:px-16 transition-transform duration-300 ease-in-out backdrop-blur-md",
            !isScrolled && pathName == "/" && "lg:backdrop-blur-none",
            isVisible ? "translate-y-0" : "-translate-y-full",
            className
        )} {...props}>
            <div className="flex items-center">
                <div className="w-[2.5em] md:w-[4em] aspect-square">
                    <img src="/unmul-small.png" alt="Mulawarman University Icon" />
                </div>
                <div className="ml-2 lg:ml-4">
                    <h3 className={cn(
                        "text-xs lg:text-lg font-bold transition-colors duration-300",
                        !isScrolled && pathName == "/" && "lg:dark:text-background"
                    )}>Pendidikan Komputer</h3>
                    <p className={cn("text-[0.6em] lg:text-sm transition-colors duration-300", !isScrolled && pathName == "/" && "lg:dark:text-background")}>Fakultas Keguruan dan Ilmu Pendidikan</p>
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