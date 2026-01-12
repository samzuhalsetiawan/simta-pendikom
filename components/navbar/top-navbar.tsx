import {
   NavigationMenu,
   NavigationMenuContent,
   NavigationMenuItem,
   NavigationMenuLink,
   NavigationMenuList,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navigationData, type NavigationData } from "./navbar-data";
import { UserNav } from "./user-nav";
import { TopNavbarMenuLink } from "./top-navbar-menu";
import { TopNavbarMenuDropdown } from "./top-navbar-menu-dropdown";
import { requireAuthenticatedUser } from "@/data/user/require-authenticated-user";

interface TopNavbarProps extends React.ComponentProps<typeof NavigationMenu> { }

export async function TopNavbar(
   { className, ...props }: TopNavbarProps
) {
   const user = await requireAuthenticatedUser();

   // Filter out Login link if user is authenticated
   const filteredNavData = navigationData.filter(item => {
      if (item.type === "action" && item.href === "/login" && user) {
         return false;
      }
      return true;
   });

   return (
      <div className={cn("flex items-center gap-4", className)}>
         <NavigationMenu viewport={false} {...props}>
            <NavigationMenuList className="flex-wrap">
               {filteredNavData.map((item, index) => (
                  <TopLevelItem key={index} item={item} />
               ))}
               {user && <UserNav className="mr-3" user={user} />}
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

