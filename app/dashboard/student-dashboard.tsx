"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface Thesis {
   id: number;
   title: string;
   progress_status: string;
   lecturers: {
      id: number;
      name: string;
      email: string;
      role: string;
   }[];
}

export function StudentDashboard() {
   const [thesis, setThesis] = useState<Thesis | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      async function fetchThesis() {
         try {
            const res = await fetch("/api/student/thesis");
            const data = await res.json();
            if (data.success && data.data) {
               setThesis(data.data);
            }
         } catch (err) {
            setError("Failed to load thesis details");
         } finally {
            setLoading(false);
         }
      }

      fetchThesis();
   }, []);

   if (loading) {
      return <DashboardSkeleton />;
   }

   if (!thesis) {
      return (
         <Alert>
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertTitle>No Thesis Found</AlertTitle>
            <AlertDescription>
               You haven't registered a thesis yet. Please contact the administrator.
            </AlertDescription>
         </Alert>
      );
   }

   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle>Thesis Information</CardTitle>
               <CardDescription>Details of your current thesis work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <h3 className="font-semibold text-lg">Title</h3>
                  <p className="text-xl text-muted-foreground">{thesis.title}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-lg">Status</h3>
                  <Badge variant="outline" className="capitalize mt-1">
                     {thesis.progress_status.replace(/_/g, " ")}
                  </Badge>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Supervisors & Examiners</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {thesis.lecturers.map((lecturer) => (
                     <Card key={lecturer.id} className="border bg-muted/20">
                        <CardHeader className="pb-2">
                           <CardTitle className="text-base">{lecturer.name}</CardTitle>
                           <CardDescription className="capitalize">{lecturer.role}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

function DashboardSkeleton() {
   return (
      <div className="space-y-6">
         <Skeleton className="h-[200px] w-full rounded-xl" />
         <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-[150px] w-full rounded-xl" />
         </div>
      </div>
   );
}
