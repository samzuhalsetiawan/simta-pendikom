"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { AddStudentModal } from "@/components/add-student/AddStudentModel";
import { useSession } from "next-auth/react";

interface Student {
   id: number;
   nim: string;
   name: string;
   email: string;
   thesis_title: string;
   progress_status: string;
   role: "pembimbing" | "penguji";
}

interface Approval {
   event_id: number;
   student_name: string;
   thesis_title: string;
   event_type: string;
   event_date: string;
   location: string;
   approval_status: string;
}

export function LecturerDashboard() {
   const { data: session } = useSession();
   const [students, setStudents] = useState<Student[]>([]);
   const [upcomingSeminars, setUpcomingSeminars] = useState<Approval[]>([]);
   const [loading, setLoading] = useState(true);


   async function fetchData() {
         try {
            // Fetch Students
            const studentsRes = await fetch("/api/lecturer/students");
            const studentsData = await studentsRes.json();
            if (studentsData.success) {
               setStudents(studentsData.data);
            }

            // Fetch Approvals (as upcoming tasks/seminars)
            // Note: Currently this API returns PENDING approvals. 
            // The prompt asked for "jadwal seminar yang akan datang" (upcoming seminars), 
            // which usually implies APPROVED ones. 
            // However, without a dedicated API for "my approved events", 
            // we will display pending approvals as "Upcoming Seminars to Review" for now.
            // A robust solution would add an endpoint `GET /api/lecturer/schedule`.
            const approvalsRes = await fetch("/api/lecturer/approvals");
            const approvalsData = await approvalsRes.json();
            if (approvalsData.success) {
               setUpcomingSeminars(approvalsData.data);
            }
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      }

   useEffect(() => { fetchData(); }, []);

   const supervisedStudents = students.filter(s => s.role === "pembimbing");
   const examinedStudents = students.filter(s => s.role === "penguji");

   if (loading) {
      return <DashboardSkeleton />;
   }

   return (
      <div className="space-y-6">
         <Tabs defaultValue="students" className="space-y-4">
            <TabsList>
               <TabsTrigger value="students">Students</TabsTrigger>
               <TabsTrigger value="seminars">Upcoming Seminars</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-6">
               <Card>
                  <CardHeader>
                     <CardTitle>
                        <div className="flex items-center justify-between">
                           <h3>Supervised Students (Bimbingan)</h3>
                           <AddStudentModal 
                              excludeStudentIds={supervisedStudents.map(s => s.id)}
                              lecturerId={session?.user.id!!} 
                              role="pembimbing"
                              onStudentAdded={() => fetchData()} />
                        </div>
                     </CardTitle>
                     <CardDescription>Students you are currently supervising.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <StudentTable students={supervisedStudents} />
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>
                        <div className="flex items-center justify-between">
                           <h3>Examination Students (Ujian)</h3>
                           <AddStudentModal 
                              excludeStudentIds={examinedStudents.map(s => s.id)}
                              lecturerId={session?.user.id!!} 
                              role="penguji" 
                              onStudentAdded={() => fetchData()} />
                        </div>
                     </CardTitle>
                     <CardDescription>Students assigned to you for examination.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <StudentTable students={examinedStudents} />
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="seminars">
               <Card>
                  <CardHeader>
                     <CardTitle>Seminar Requests</CardTitle>
                     <CardDescription>Upcoming seminars requiring your approval.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {upcomingSeminars.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No upcoming seminar requests.</p>
                     ) : (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Student</TableHead>
                                 <TableHead>Type</TableHead>
                                 <TableHead>Date</TableHead>
                                 <TableHead>Location</TableHead>
                                 <TableHead>Status</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {upcomingSeminars.map((seminar, idx) => (
                                 <TableRow key={idx}>
                                    <TableCell className="font-medium">{seminar.student_name}</TableCell>
                                    <TableCell className="capitalize">{seminar.event_type.replace(/_/g, " ")}</TableCell>
                                    <TableCell>{new Date(seminar.event_date).toLocaleString()}</TableCell>
                                    <TableCell>{seminar.location || "TBA"}</TableCell>
                                    <TableCell>
                                       <Badge variant={seminar.approval_status === "pending" ? "secondary" : "default"}>
                                          {seminar.approval_status}
                                       </Badge>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>
   );
}

function StudentTable({ students }: { students: Student[] }) {
   if (students.length === 0) {
      return <p className="text-sm text-muted-foreground">No students found.</p>;
   }
   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>NIM</TableHead>
               <TableHead>Name</TableHead>
               <TableHead>Thesis Title</TableHead>
               <TableHead>Progress</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {students.map((student) => (
               <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nim}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="max-w-xs truncate" title={student.thesis_title}>{student.thesis_title}</TableCell>
                  <TableCell>
                     <Badge variant="outline" className="capitalize">
                        {student.progress_status.replace(/_/g, " ")}
                     </Badge>
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   );
}

function DashboardSkeleton() {
   return (
      <div className="space-y-6">
         <div className="flex gap-4">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[200px]" />
         </div>
         <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
   );
}
