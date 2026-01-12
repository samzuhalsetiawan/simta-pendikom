"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const THESIS_STAGES = [
   { id: 1, name: "Pengajuan Judul", color: "from-blue-500 to-cyan-500" },
   { id: 2, name: "Seminar Proposal", color: "from-cyan-500 to-teal-500" },
   { id: 3, name: "Penelitian", color: "from-teal-500 to-green-500" },
   { id: 4, name: "Seminar Hasil", color: "from-green-500 to-lime-500" },
   { id: 5, name: "Ujian Akhir", color: "from-lime-500 to-yellow-500" },
   { id: 6, name: "Selesai", color: "from-yellow-500 to-orange-500" }
];

interface ProgressTrackerProps {
   currentStage: number; // 1-6
   className?: string;
}

export function ProgressTracker({ currentStage, className }: ProgressTrackerProps) {
   const progressPercentage = ((currentStage - 1) / (THESIS_STAGES.length - 1)) * 100;
   const completedStages = currentStage - 1;
   const remainingStages = THESIS_STAGES.length - currentStage;

   return (
      <Card className={cn(className)}>
         <CardHeader className="relative">
            <div className="flex items-start justify-between">
               <div>
                  <CardTitle className="text-2xl">Progress Skripsi</CardTitle>
                  <CardDescription className="mt-1">
                     Tahap {currentStage} dari {THESIS_STAGES.length}: <span className="font-semibold text-foreground">{THESIS_STAGES[currentStage - 1].name}</span>
                  </CardDescription>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                     {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                     {completedStages} selesai • {remainingStages} tersisa
                  </div>
               </div>
            </div>
         </CardHeader>
         <CardContent className="relative">
            {/* Desktop View */}
            <div className="hidden md:block">
               <div className="relative">
                  {/* Progress Bar Background */}
                  <div className="absolute top-7 left-10 right-10 h-2 bg-muted rounded-full" />
                  {/* Active Progress Bar */}
                  <div
                     className="absolute top-7 left-10 h-2 bg-green-400 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `calc(${progressPercentage}% - 3rem)` }}
                  />

                  {/* Stages */}
                  <div className="relative flex justify-between items-start">
                     {THESIS_STAGES.map((stage, index) => {
                        const stageNumber = index + 1;
                        const isCompleted = stageNumber < currentStage;
                        const isCurrent = stageNumber === currentStage;
                        const isUpcoming = stageNumber > currentStage;

                        return (
                           <div key={stage.id} className="flex flex-col items-center w-32">
                              {/* Circle Icon */}
                              <div
                                 className={cn(
                                    "relative z-10 rounded-full p-1 transition-all duration-300",
                                    isCompleted && "bg-emerald-500",
                                    isCurrent && "bg-orange-300",
                                    isUpcoming && "bg-muted"
                                 )}
                              >
                                 <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all",
                                    (isCompleted || isCurrent) && "text-white",
                                    isUpcoming && "bg-background text-muted-foreground"
                                 )}>
                                    {isCompleted ? (
                                       <CheckCircle2 className="w-6 h-6" />
                                    ) : isCurrent ? (
                                       <Clock className="w-6 h-6" />
                                    ) : (
                                       <Circle className="w-6 h-6" />
                                    )}
                                 </div>
                              </div>

                              {/* Stage Name */}
                              <p className={cn(
                                 "mt-3 text-xs font-medium text-center transition-all leading-tight",
                                 isCurrent && "text-foreground font-bold text-sm",
                                 isCompleted && "text-green-700 dark:text-green-400",
                                 isUpcoming && "text-muted-foreground"
                              )}>
                                 {stage.name}
                              </p>

                              {/* Status Badge */}
                              <span className={cn(
                                 "mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                 isCompleted && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                 isCurrent && "bg-primary/10 text-primary",
                                 isUpcoming && "bg-muted text-muted-foreground"
                              )}>
                                 {isCompleted ? "Selesai" : isCurrent ? "Sedang Berjalan" : "Belum Dimulai"}
                              </span>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
               {THESIS_STAGES.map((stage, index) => {
                  const stageNumber = index + 1;
                  const isCompleted = stageNumber < currentStage;
                  const isCurrent = stageNumber === currentStage;
                  const isUpcoming = stageNumber > currentStage;

                  return (
                     <div
                        key={stage.id}
                        className={cn(
                           "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                           isCompleted && "border-green-500 bg-green-50 dark:bg-green-950/20",
                           isCurrent && "border-primary bg-primary/5 shadow-md",
                           isUpcoming && "border-muted bg-muted/30"
                        )}
                     >
                        <div
                           className={cn(
                              "rounded-full p-1 shrink-0",
                              isCompleted && "bg-gradient-to-br from-green-400 to-emerald-600",
                              isCurrent && `bg-gradient-to-br ${stage.color}`,
                              isUpcoming && "bg-muted"
                           )}
                        >
                           <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              (isCompleted || isCurrent) && "text-white",
                              isUpcoming && "bg-background text-muted-foreground"
                           )}>
                              {isCompleted ? (
                                 <CheckCircle2 className="w-5 h-5" />
                              ) : isCurrent ? (
                                 <Clock className="w-5 h-5" />
                              ) : (
                                 <Circle className="w-5 h-5" />
                              )}
                           </div>
                        </div>

                        <div className="flex-1">
                           <p className={cn(
                              "font-medium text-sm",
                              isCurrent && "font-bold"
                           )}>
                              {stage.name}
                           </p>
                           <span className={cn(
                              "text-[10px] font-semibold",
                              isCompleted && "text-green-700 dark:text-green-400",
                              isCurrent && "text-primary",
                              isUpcoming && "text-muted-foreground"
                           )}>
                              {isCompleted ? "Selesai" : isCurrent ? "Sedang Berjalan" : "Belum Dimulai"}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </CardContent>
      </Card>
   );
}
