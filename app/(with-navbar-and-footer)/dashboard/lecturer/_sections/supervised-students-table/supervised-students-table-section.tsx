import { Thesis } from "@/types/thesis";
import { SupervisedStudentsTable } from "./components/supervised-students-table";

type SupervisedStudentsTableSectionProps = {
  studentsThesisPromise: Promise<Thesis[]>;
  lecturerId: number;
};

export async function SupervisedStudentsTableSection({
  studentsThesisPromise,
  lecturerId,
}: SupervisedStudentsTableSectionProps) {

  const studentsThesis = await studentsThesisPromise

  return (
    <section>
      <SupervisedStudentsTable studentsThesis={studentsThesis} lecturerId={lecturerId} />
    </section>
  );
}

