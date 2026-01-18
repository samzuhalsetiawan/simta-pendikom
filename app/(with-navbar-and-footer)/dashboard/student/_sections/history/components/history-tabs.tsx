"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, User, Users, FileText, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConsultationHistory {
   id: number;
   date: Date;
   location: string;
   lecturer: string;
   progress: string;
   topic?: string | null;
   status: "pending" | "accepted" | "rejected";
   lecturerNote?: string;
}

export interface SeminarHistory {
   id: number;
   type: "proposal" | "hasil";
   date: Date;
   location: string;
   supervisors: string[];
   examiners: string[];
   attendees?: string[];
   attendeeCount: number;
   requestStatus: "requested" | "approved" | "rejected";
   passStatus: "pending" | "pass" | "fail";
}

export interface ExamHistory {
   id: number;
   date: Date;
   location: string;
   supervisors: string[];
   examiners: string[];
   requestStatus: "requested" | "approved" | "rejected";
   passStatus: "pending" | "pass" | "fail";
}

interface HistoryTabsProps {
   consultations: ConsultationHistory[];
   seminarProposals: SeminarHistory[];
   seminarHasils: SeminarHistory[];
   exams: ExamHistory[];
}

export function HistoryTabs({ consultations, seminarProposals, seminarHasils, exams }: HistoryTabsProps) {
   const [selectedSeminar, setSelectedSeminar] = useState<SeminarHistory | null>(null);
   const [isDetailOpen, setIsDetailOpen] = useState(false);

   const handleSeminarClick = (seminar: SeminarHistory) => {
      setSelectedSeminar(seminar);
      setIsDetailOpen(true);
   };

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      }).format(date);
   };

   const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
         hour: '2-digit',
         minute: '2-digit'
      }).format(date);
   };

   return (
      <>
         <Card className="mb-8">
            <CardHeader>
               <CardTitle className="text-2xl">Riwayat</CardTitle>
               <CardDescription>Lihat riwayat konsultasi, seminar, dan ujian</CardDescription>
            </CardHeader>
            <CardContent>
               <Tabs defaultValue="consultation" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto">
                     <TabsTrigger value="consultation" className="text-xs md:text-sm">
                        Konsultasi
                        <Badge variant="secondary" className="ml-2">{consultations.length}</Badge>
                     </TabsTrigger>
                     <TabsTrigger value="proposal" className="text-xs md:text-sm">
                        Seminar Proposal
                        <Badge variant="secondary" className="ml-2">{seminarProposals.length}</Badge>
                     </TabsTrigger>
                     <TabsTrigger value="hasil" className="text-xs md:text-sm">
                        Seminar Hasil
                        <Badge variant="secondary" className="ml-2">{seminarHasils.length}</Badge>
                     </TabsTrigger>
                     <TabsTrigger value="exam" className="text-xs md:text-sm">
                        Ujian Akhir
                        <Badge variant="secondary" className="ml-2">{exams.length}</Badge>
                     </TabsTrigger>
                  </TabsList>

                  <TabsContent value="consultation" className="mt-4">
                     <ScrollArea className="h-[400px] pr-4">
                        {consultations.length === 0 ? (
                           <div className="text-center py-12 text-muted-foreground">
                              Belum ada riwayat konsultasi
                           </div>
                        ) : (
                           <div className="space-y-3">
                              {consultations.map((consultation) => (
                                 <div
                                    key={consultation.id}
                                    className="p-4 border rounded-lg hover:border-primary transition-colors bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20"
                                 >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                       <div className="space-y-2 flex-1">
                                          <div className="flex items-center gap-2 text-sm">
                                             <Calendar className="w-4 h-4 text-primary" />
                                             <span className="font-medium">{formatDate(consultation.date)}</span>
                                             <span className="text-muted-foreground">{formatTime(consultation.date)}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <MapPin className="w-4 h-4 text-orange-500" />
                                             <span>{consultation.location}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <User className="w-4 h-4 text-green-500" />
                                             <span>{consultation.lecturer}</span>
                                          </div>
                                          {consultation.topic && (
                                             <div className="flex items-start gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-purple-500 mt-0.5" />
                                                <span className="flex-1">{consultation.topic}</span>
                                             </div>
                                          )}
                                       </div>
                                       <Badge variant="outline" className="shrink-0">
                                          {consultation.progress}
                                       </Badge>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </ScrollArea>
                  </TabsContent>

                  <TabsContent value="proposal" className="mt-4">
                     <ScrollArea className="h-[400px] pr-4">
                        {seminarProposals.length === 0 ? (
                           <div className="text-center py-12 text-muted-foreground">
                              Belum ada riwayat seminar proposal
                           </div>
                        ) : (
                           <div className="space-y-3">
                              {seminarProposals.map((seminar) => (
                                 <div
                                    key={seminar.id}
                                    onClick={() => handleSeminarClick(seminar)}
                                    className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20"
                                 >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                       <div className="space-y-2 flex-1">
                                          <div className="flex items-center gap-2 text-sm">
                                             <Calendar className="w-4 h-4 text-primary" />
                                             <span className="font-medium">{formatDate(seminar.date)}</span>
                                             <span className="text-muted-foreground">{formatTime(seminar.date)}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <MapPin className="w-4 h-4 text-orange-500" />
                                             <span>{seminar.location}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <Users className="w-4 h-4 text-green-500" />
                                             <span>{seminar.attendeeCount} penonton</span>
                                          </div>
                                       </div>
                                       <div className="flex flex-col items-end gap-1">
                                          <Badge
                                             className={cn(
                                                "shrink-0",
                                                seminar.requestStatus === "approved" ? "bg-blue-600" :
                                                   seminar.requestStatus === "rejected" ? "bg-gray-500" :
                                                      "bg-yellow-500"
                                             )}
                                          >
                                             {seminar.requestStatus === "approved" ? "Disetujui" :
                                                seminar.requestStatus === "rejected" ? "Ditolak" : "Menunggu"}
                                          </Badge>
                                          {seminar.requestStatus === "approved" && (
                                             <Badge
                                                className={cn(
                                                   "shrink-0",
                                                   seminar.passStatus === "pass" ? "bg-green-600" :
                                                      seminar.passStatus === "fail" ? "bg-red-600" :
                                                         "bg-gray-400"
                                                )}
                                             >
                                                {seminar.passStatus === "pass" ? (
                                                   <><CheckCircle className="w-3 h-3 mr-1" /> Lulus</>
                                                ) : seminar.passStatus === "fail" ? (
                                                   <><XCircle className="w-3 h-3 mr-1" /> Gagal</>
                                                ) : "Menunggu Hasil"}
                                             </Badge>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </ScrollArea>
                  </TabsContent>

                  <TabsContent value="hasil" className="mt-4">
                     <ScrollArea className="h-[400px] pr-4">
                        {seminarHasils.length === 0 ? (
                           <div className="text-center py-12 text-muted-foreground">
                              Belum ada riwayat seminar hasil
                           </div>
                        ) : (
                           <div className="space-y-3">
                              {seminarHasils.map((seminar) => (
                                 <div
                                    key={seminar.id}
                                    onClick={() => handleSeminarClick(seminar)}
                                    className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20"
                                 >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                       <div className="space-y-2 flex-1">
                                          <div className="flex items-center gap-2 text-sm">
                                             <Calendar className="w-4 h-4 text-primary" />
                                             <span className="font-medium">{formatDate(seminar.date)}</span>
                                             <span className="text-muted-foreground">{formatTime(seminar.date)}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <MapPin className="w-4 h-4 text-orange-500" />
                                             <span>{seminar.location}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <Users className="w-4 h-4 text-green-500" />
                                             <span>{seminar.attendeeCount} penonton</span>
                                          </div>
                                       </div>
                                       <div className="flex flex-col items-end gap-1">
                                          <Badge
                                             className={cn(
                                                "shrink-0",
                                                seminar.requestStatus === "approved" ? "bg-blue-600" :
                                                   seminar.requestStatus === "rejected" ? "bg-gray-500" :
                                                      "bg-yellow-500"
                                             )}
                                          >
                                             {seminar.requestStatus === "approved" ? "Disetujui" :
                                                seminar.requestStatus === "rejected" ? "Ditolak" : "Menunggu"}
                                          </Badge>
                                          {seminar.requestStatus === "approved" && (
                                             <Badge
                                                className={cn(
                                                   "shrink-0",
                                                   seminar.passStatus === "pass" ? "bg-green-600" :
                                                      seminar.passStatus === "fail" ? "bg-red-600" :
                                                         "bg-gray-400"
                                                )}
                                             >
                                                {seminar.passStatus === "pass" ? (
                                                   <><CheckCircle className="w-3 h-3 mr-1" /> Lulus</>
                                                ) : seminar.passStatus === "fail" ? (
                                                   <><XCircle className="w-3 h-3 mr-1" /> Gagal</>
                                                ) : "Menunggu Hasil"}
                                             </Badge>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </ScrollArea>
                  </TabsContent>

                  <TabsContent value="exam" className="mt-4">
                     <ScrollArea className="h-[400px] pr-4">
                        {exams.length === 0 ? (
                           <div className="text-center py-12 text-muted-foreground">
                              Belum ada riwayat ujian akhir
                           </div>
                        ) : (
                           <div className="space-y-3">
                              {exams.map((exam) => (
                                 <div
                                    key={exam.id}
                                    className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-950/20"
                                 >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                       <div className="space-y-2 flex-1">
                                          <div className="flex items-center gap-2 text-sm">
                                             <Calendar className="w-4 h-4 text-primary" />
                                             <span className="font-medium">{formatDate(exam.date)}</span>
                                             <span className="text-muted-foreground">{formatTime(exam.date)}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                             <MapPin className="w-4 h-4 text-orange-500" />
                                             <span>{exam.location}</span>
                                          </div>
                                          <div className="space-y-1">
                                             <div className="text-xs font-semibold text-muted-foreground">Pembimbing:</div>
                                             <div className="text-sm">{exam.supervisors.join(", ")}</div>
                                          </div>
                                          <div className="space-y-1">
                                             <div className="text-xs font-semibold text-muted-foreground">Penguji:</div>
                                             <div className="text-sm">{exam.examiners.join(", ")}</div>
                                          </div>
                                       </div>
                                       <div className="flex flex-col items-end gap-1">
                                          <Badge
                                             className={cn(
                                                "shrink-0",
                                                exam.requestStatus === "approved" ? "bg-blue-600" :
                                                   exam.requestStatus === "rejected" ? "bg-gray-500" :
                                                      "bg-yellow-500"
                                             )}
                                          >
                                             {exam.requestStatus === "approved" ? "Disetujui" :
                                                exam.requestStatus === "rejected" ? "Ditolak" : "Menunggu"}
                                          </Badge>
                                          {exam.requestStatus === "approved" && (
                                             <Badge
                                                className={cn(
                                                   "shrink-0",
                                                   exam.passStatus === "pass" ? "bg-green-600" :
                                                      exam.passStatus === "fail" ? "bg-red-600" :
                                                         "bg-gray-400"
                                                )}
                                             >
                                                {exam.passStatus === "pass" ? (
                                                   <><CheckCircle className="w-3 h-3 mr-1" /> Lulus</>
                                                ) : exam.passStatus === "fail" ? (
                                                   <><XCircle className="w-3 h-3 mr-1" /> Gagal</>
                                                ) : "Menunggu Hasil"}
                                             </Badge>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </ScrollArea>
                  </TabsContent>
               </Tabs>
            </CardContent>
         </Card>

         {/* Seminar Detail Dialog */}
         <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-[600px]">
               <DialogHeader>
                  <DialogTitle>
                     Detail Seminar {selectedSeminar?.type === "proposal" ? "Proposal" : "Hasil"}
                  </DialogTitle>
                  <DialogDescription>
                     {selectedSeminar && formatDate(selectedSeminar.date)}
                  </DialogDescription>
               </DialogHeader>
               {selectedSeminar && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-sm font-semibold text-muted-foreground mb-1">Waktu</div>
                           <div className="text-sm">{formatTime(selectedSeminar.date)}</div>
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-muted-foreground mb-1">Tempat</div>
                           <div className="text-sm">{selectedSeminar.location}</div>
                        </div>
                     </div>

                     <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">Dosen Pembimbing</div>
                        <div className="flex flex-wrap gap-2">
                           {selectedSeminar.supervisors.map((supervisor, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30">
                                 {supervisor}
                              </Badge>
                           ))}
                        </div>
                     </div>

                     <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">Dosen Penguji</div>
                        <div className="flex flex-wrap gap-2">
                           {selectedSeminar.examiners.map((examiner, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30">
                                 {examiner}
                              </Badge>
                           ))}
                        </div>
                     </div>

                     <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">
                           Penonton ({selectedSeminar.attendeeCount})
                        </div>
                        <ScrollArea className="h-32 border rounded-md p-3">
                           <div className="space-y-1">
                              {selectedSeminar.attendees?.map((attendee, idx) => (
                                 <div key={idx} className="text-sm flex items-center gap-2">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                    {attendee}
                                 </div>
                              )) || <div className="text-sm text-muted-foreground">Tidak ada data penonton</div>}
                           </div>
                        </ScrollArea>
                     </div>

                     <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">Status</div>
                        <Badge
                           className={cn(
                              "text-base px-4 py-1",
                              selectedSeminar.status === "lulus"
                                 ? "bg-green-600 hover:bg-green-700 text-white"
                                 : "bg-red-600 hover:bg-red-700 text-white"
                           )}
                        >
                           {selectedSeminar.status === "lulus" ? (
                              <><CheckCircle className="w-4 h-4 mr-2" /> Lulus</>
                           ) : (
                              <><XCircle className="w-4 h-4 mr-2" /> Gagal</>
                           )}
                        </Badge>
                     </div>
                  </div>
               )}
            </DialogContent>
         </Dialog>
      </>
   );
}
