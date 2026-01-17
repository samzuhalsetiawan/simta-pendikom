"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface StudentPaginationProps {
   generations: number[];
   currentGeneration: number;
}

export function StudentPagination({ generations, currentGeneration }: StudentPaginationProps) {
   return (
      <div className="flex flex-wrap items-center gap-2 mt-6">
         <span className="text-sm text-muted-foreground mr-2">Generations:</span>
         {generations.map((gen) => (
            <Link
               key={gen}
               href={`?gen=${gen}#student-directory`}
               className={cn(
                  buttonVariants({
                     variant: gen === currentGeneration ? "default" : "outline",
                     size: "sm",
                  }),
                  "min-w-12"
               )}
            >
               {gen}
            </Link>
         ))}
         <span className="text-sm text-muted-foreground ml-2">{">>>"}</span>
      </div>
   );
}
