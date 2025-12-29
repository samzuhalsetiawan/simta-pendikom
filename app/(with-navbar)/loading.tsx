import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
   return (
      <div className="w-full h-screen">
         {/* Carousel Skeleton */}
         <div className="w-screen aspect-square md:aspect-video relative">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
               <Skeleton className="h-12 w-3/4 max-w-lg" />
               <Skeleton className="h-6 w-1/2 max-w-md" />
               <Skeleton className="h-12 w-40 rounded-md" />
            </div>
         </div>
      </div>
   );
}
