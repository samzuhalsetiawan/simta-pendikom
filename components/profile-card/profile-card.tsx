import { Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student } from "@/types/student";
import { Lecturer } from "@/types/user/lecturer";
import { cn } from "@/lib/utils";

type UserProfileProps = React.ComponentProps<"div"> & {
   user: Student | Lecturer
}

export function ProfileCard({
   user,
   className,
   ...props
}: UserProfileProps) {
   return (
      <Card {...props} className={cn(className)}>
         <CardContent className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
               <AvatarImage src={user.image === null ? undefined : user.image} alt={user.name} />
               <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
               <h3 className="font-semibold text-sm">{user.name}</h3>
               <p className="text-xs text-muted-foreground">{'nip' in user ? "NIP. " + user.nip : "NIM. " + user.nim}</p>
               <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                     <Users className="w-3 h-3 mr-1" />
                     {'nip' in user ? 'Dosen' : 'Mahasiswa'}
                  </span>
               </div>
            </div>
         </CardContent>
      </Card>
   )
}