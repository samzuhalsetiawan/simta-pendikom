import { Thesis } from "@/types/thesis";
import { SupervisedStudentsTable } from "./components/supervised-students-table";

type SupervisedStudentsTableSectionProps = {
  studentsThesisPromise: Promise<Thesis[]>;
};

export async function SupervisedStudentsTableSection({
  studentsThesisPromise,
}: SupervisedStudentsTableSectionProps) {

  const studentsThesis = await studentsThesisPromise
  
  return (
    <section>
      <SupervisedStudentsTable studentsThesis={studentsThesis} />
    </section>
  );
}
