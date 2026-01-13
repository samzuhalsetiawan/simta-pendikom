import { Thesis } from "@/types/thesis";
import { ExaminedStudentsTable } from "./components/examined-students-table";

type ExaminedStudentsTableSectionProps = {
  studentsThesis: Thesis[];
};

export function ExaminedStudentsTableSection({
  studentsThesis,
}: ExaminedStudentsTableSectionProps) {
  return (
    <section>
      <ExaminedStudentsTable studentsThesis={studentsThesis} />
    </section>
  );
}
