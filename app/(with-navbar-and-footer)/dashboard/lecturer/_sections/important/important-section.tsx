"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types/event/event";
import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";
import { useState } from "react";

type ImportantSectionProps = {
  pendingEventsApprovals: Event[];
};

export function ImportantSection({
  pendingEventsApprovals,
}: ImportantSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Penting</h2>
          <Badge
            variant="destructive"
            className="rounded-full px-2 py-0.5 text-xs"
          >
            {pendingEventsApprovals.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 rounded-full"
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {pendingEventsApprovals.map((pendingApproval) => (
            <Card
              key={pendingApproval.id}
              className="border-none shadow-sm bg-white dark:bg-zinc-900"
            >
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage
                      src={pendingApproval.thesis.student.image}
                      alt={pendingApproval.thesis.student.name}
                    />
                    <AvatarFallback>
                      {pendingApproval.thesis.student.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-semibold text-sm">
                      {pendingApproval.thesis.student.name}
                    </h3>
                    <p
                      className="text-xs font-medium text-muted-foreground line-clamp-1"
                      title={pendingApproval.thesis.title}
                    >
                      {pendingApproval.thesis.title}
                    </p>
                    <div className="flex flex-col gap-1 lg:gap-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(pendingApproval.date, "dd MMMM yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(pendingApproval.date, "HH:mm")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pendingApproval.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col self-stretch justify-center gap-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs px-4"
                    >
                      Terima
                    </Button>
                    <div className="flex items-center rounded-md bg-red-500 hover:bg-red-600 text-white h-7">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-full text-xs px-3 hover:bg-red-600 hover:text-white rounded-r-none border-r border-red-400"
                      >
                        Tolak
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-full px-1 hover:bg-red-600 hover:text-white rounded-l-none"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="text-destructive"
                          align="end"
                        >
                          <DropdownMenuItem>Tanpa Pesan</DropdownMenuItem>
                          <DropdownMenuItem>Dengan Pesan</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
