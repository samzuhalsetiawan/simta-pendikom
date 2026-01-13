import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
   return (
      <div className="container mx-auto p-4 space-y-8 max-w-7xl font-sans pt-(--navbar-height)">
         {/* Top Stats Section */}
         <section className="flex flex-col gap-2 items-center lg:items-stretch">
            <div className="flex flex-col gap-3 lg:flex-row lg:justify-center w-full">
               {/* Profile Card Skeleton */}
               <Card className="md:col-span-4 lg:col-span-3 border-none shadow-sm w-full lg:w-1/3">
                  <CardContent className="p-4 flex items-center gap-4">
                     <Skeleton className="h-12 w-12 rounded-full" />
                     <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                     </div>
                  </CardContent>
               </Card>

               {/* Stat 1 Skeleton */}
               <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm w-full lg:w-1/3">
                  <CardContent className="p-4 flex items-center justify-between h-full">
                     <div className="flex items-center gap-4 w-full">
                        <Skeleton className="h-10 w-16" />
                        <div className="flex flex-col space-y-2 w-full">
                           <Skeleton className="h-3 w-32" />
                           <Skeleton className="h-3 w-24" />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Stat 2 Skeleton */}
               <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm w-full lg:w-1/3">
                  <CardContent className="p-4 flex items-center justify-between h-full">
                     <div className="flex items-center gap-4 w-full">
                        <Skeleton className="h-10 w-16" />
                        <div className="flex flex-col space-y-2 w-full">
                           <Skeleton className="h-3 w-32" />
                           <Skeleton className="h-3 w-24" />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </section>

         {/* Important Section Skeleton */}
         <section>
            <div className="space-y-4">
               <Skeleton className="h-6 w-32" />
               <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                     <Card key={i} className="border-l-4 border-l-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                           <div className="flex flex-col gap-2">
                              <Skeleton className="h-4 w-64" />
                              <Skeleton className="h-3 w-48" />
                           </div>
                           <Skeleton className="h-8 w-24" />
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         </section>

         {/* Mentoring Table Skeleton */}
         <section className="space-y-4">
            <div className="flex items-center justify-between">
               <Skeleton className="h-6 w-48" />
               <Skeleton className="h-9 w-24" />
            </div>
            <Card>
               <CardContent className="p-0">
                  <div className="p-4 space-y-4">
                     {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </section>

         {/* Exam Table Skeleton */}
         <section className="space-y-4">
            <div className="flex items-center justify-between">
               <Skeleton className="h-6 w-48" />
               <Skeleton className="h-9 w-24" />
            </div>
            <Card>
               <CardContent className="p-0">
                  <div className="p-4 space-y-4">
                     {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </section>

         {/* Calendar Skeleton */}
         <section className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
               ))}
            </div>
         </section>
      </div>
   );
}
