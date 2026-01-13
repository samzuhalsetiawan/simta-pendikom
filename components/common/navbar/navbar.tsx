import { SideNavigationSheet } from "./side-navigation-sheet";
import { TopNavbar } from "./top-navbar";
import { ThemeToggleButton } from "../button/theme-toggle-button";
import { NavbarContainer } from "./navbar-container";
import { NavbarBrandDescription } from "./navbar-brand-description";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> { }

export function Navbar(
    { ...props }: NavbarProps
) {

    return (
        <NavbarContainer {...props}>
            <div className="flex items-center">
                <div className="w-[2.5em] md:w-[4em] aspect-square">
                    <img src="/unmul-small.png" alt="Mulawarman University Icon" />
                </div>
                <NavbarBrandDescription />
            </div>
            <div className="flex items-center xl:gap-2">
                <TopNavbar className="hidden lg:block" />
                <ThemeToggleButton />
                <SideNavigationSheet className="lg:hidden" />
            </div>
        </NavbarContainer>
    )
}