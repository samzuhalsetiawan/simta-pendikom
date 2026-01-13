import { Lecturer } from "@/types/user/lecturer";
import { LecturerProfileCard } from "./components/lecturer-proile-card";
import { SupervisedStudentsProgressCard } from "./components/supervised-students-progress-card";
import { ExaminedStudentsProgressCard } from "./components/examined-students-progress-card";
import { Thesis } from "@/types/thesis";

type TopStatsSectionProps = {
  lecturer: Lecturer;
  supervisedStudentsThesis: Thesis[];
  examinedStudentsThesis: Thesis[];
};

export function TopStatsSection({
  lecturer,
  supervisedStudentsThesis,
  examinedStudentsThesis,
}: TopStatsSectionProps) {
  return (
    <section className="flex flex-col gap-2 items-center lg:items-stretch">
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-center w-full">
        <LecturerProfileCard lecturer={lecturer} />
        <SupervisedStudentsProgressCard
          studentsThesis={supervisedStudentsThesis}
        />
        <ExaminedStudentsProgressCard studentsThesis={examinedStudentsThesis} />
      </div>
    </section>
  );
}
