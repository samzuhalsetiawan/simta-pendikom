import { Card, CardContent } from "@/components/ui/card";
import { Thesis } from "@/types/thesis";
import { calculateProgress } from "../utils/calculate-progress";
import { Calendar } from "lucide-react";

type SupervisedStudentsProgressCardProps = {
  studentsThesis: Thesis[];
};

export function SupervisedStudentsProgressCard({
  studentsThesis,
}: SupervisedStudentsProgressCardProps) {
  const studentsProgress = calculateProgress(studentsThesis);

  return (
    <Card className="md:col-span-4 lg:col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900">
      <CardContent className="p-4 flex items-center justify-between h-full">
        <div className="flex items-center gap-4 w-full">
          <span className="text-4xl font-normal text-green-500">
            {studentsProgress}%
          </span>
          <div className="flex flex-col space-y-1 w-full">
            <span className="text-xs font-semibold">
              Progress Mahasiswa Bimbingan
            </span>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{studentsThesis.length} Mahasiswa</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Recent
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
