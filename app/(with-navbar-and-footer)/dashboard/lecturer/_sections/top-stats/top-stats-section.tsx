import { Lecturer } from "@/types/user/lecturer";
import { LecturerProfileCard } from "./components/lecturer-proile-card";
import { SupervisedStudentsProgressCard } from "./components/supervised-students-progress-card";
import { ExaminedStudentsProgressCard } from "./components/examined-students-progress-card";
import { Thesis } from "@/types/thesis";

type TopStatsSectionProps = {
  lecturer: Lecturer;
  supervisedStudentsThesisPromise: Promise<Thesis[]>;
  examinedStudentsThesisPromise: Promise<Thesis[]>;
}

export async function TopStatsSection({
  lecturer,
  supervisedStudentsThesisPromise,
  examinedStudentsThesisPromise
}: TopStatsSectionProps) {

  const supervisedStudentsThesis = await supervisedStudentsThesisPromise
  const examinedStudentsThesis = await examinedStudentsThesisPromise
  
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
