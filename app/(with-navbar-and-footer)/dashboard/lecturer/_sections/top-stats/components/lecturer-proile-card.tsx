import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Lecturer } from "@/types/user/lecturer";
import { Users } from "lucide-react";

type LecturerProfileCardProps = {
  lecturer: Lecturer;
};

export function LecturerProfileCard({ lecturer }: LecturerProfileCardProps) {
  return (
    <Card className="md:col-span-4 lg:col-span-3 border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
      <CardContent className="p-4 flex items-center gap-4 h-full">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage
            src={lecturer.image === null ? undefined : lecturer.image}
            alt={lecturer.name}
          />
          <AvatarFallback>{lecturer.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="font-semibold text-sm">{lecturer.name}</h3>
          <p className="text-xs text-muted-foreground">NIP. {lecturer.nip}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Users className="w-3 h-3 mr-1" />
              Dosen
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
