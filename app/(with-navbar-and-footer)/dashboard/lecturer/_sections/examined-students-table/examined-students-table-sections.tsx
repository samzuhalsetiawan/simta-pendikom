import { Thesis } from "@/types/thesis";
import { ExaminedStudentsTable } from "./components/examined-students-table";

type ExaminedStudentsTableSectionProps = {
  studentsThesisPromise: Promise<Thesis[]>;
};

export async function ExaminedStudentsTableSection({
  studentsThesisPromise,
}: ExaminedStudentsTableSectionProps) {

  const studentsThesis = await studentsThesisPromise 

  return (
    <section>
      <ExaminedStudentsTable studentsThesis={studentsThesis} />
    </section>
  );
}
