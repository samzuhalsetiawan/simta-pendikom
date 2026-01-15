import { Users } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "@/types/user/user";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type UserProfileProps = {
   user: User;
   className?: React.ReactNode;
   showAdminPageButton?: boolean;
}

export function ProfileCard({
   user,
   className,
   showAdminPageButton = false
}: UserProfileProps) {

   const getIdNumberText = () => {
      switch (user.role) {
         case "lecturer":
            return `NIP. ${user.nip}`
         case "student":
            return `NIM. ${user.nim}`
      }
   }

   const getRoleLabel = () => {
      switch (user.role) {
         case "lecturer":
            return "Lecturer"
         case "student":
            return "Student"
      }
   }

   return (
      <Card className={cn(className)}>
         <CardContent className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
               <AvatarImage src={user.image === null ? undefined : user.image} alt={user.name} />
               <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
               <h3 className="font-semibold text-sm">{user.name}</h3>
               <p className="text-xs text-muted-foreground">{getIdNumberText()}</p>
               <div className="flex items-center gap-1 mt-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                     <Users className="w-3 h-3 mr-1" />
                     {getRoleLabel()}
                  </span>
               </div>
               {showAdminPageButton ? <Button asChild className="mt-2 cursor-pointer" size={"sm"}>
                  <Link href={"/admin"}>
                     Administrator
                  </Link>
               </Button> : <></>}
            </div>
         </CardContent>
      </Card>
   )
}