import { Thesis } from "@/types/thesis";
import { SupervisedStudentsTable } from "./components/supervised-students-table";

type SupervisedStudentsTableSectionProps = {
  studentsThesis: Thesis[];
};

export function SupervisedStudentsTableSection({
  studentsThesis,
}: SupervisedStudentsTableSectionProps) {
  return (
    <section>
      <SupervisedStudentsTable studentsThesis={studentsThesis} />
    </section>
  );
}
