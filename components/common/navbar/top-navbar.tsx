import {
   NavigationMenu,
   NavigationMenuItem,
   NavigationMenuList,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navigationData, type NavigationData } from "./navbar-data";
import { UserNav } from "./user-nav";
import { TopNavbarMenuLink } from "./top-navbar-menu";
import { TopNavbarMenuDropdown } from "./top-navbar-menu-dropdown";

interface TopNavbarProps extends React.ComponentProps<typeof NavigationMenu> { }

export async function TopNavbar(
   { className, ...props }: TopNavbarProps
) {

   return (
      <div className={cn("flex items-center gap-4", className)}>
         <NavigationMenu viewport={false} {...props}>
            <NavigationMenuList className="flex-wrap">
               {navigationData.map((item, index) => (
                  <TopLevelItem key={index} item={item} />
               ))}
               <UserNav className="mr-3" />
            </NavigationMenuList>
         </NavigationMenu>
      </div>
   )
}

function TopLevelItem({ item }: { item: NavigationData }) {
   if (item.type === "action") {
      return (
         <NavigationMenuItem>
            <TopNavbarMenuLink asChild>
               <Link href={item.href}>
                  {item.title}
               </Link>
            </TopNavbarMenuLink>
         </NavigationMenuItem>
      );
   }

   return (
      <TopNavbarMenuDropdown item={item} />
   );
}

