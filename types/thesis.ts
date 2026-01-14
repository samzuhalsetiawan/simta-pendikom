import { Examiner, Supervisor } from "./user/lecturer";
import { Student } from "./user/student";

export const thesisStatus = [
  "pengajuan_proposal",
  "seminar_proposal",
  "penelitian",
  "seminar_hasil",
  "pendadaran",
  "lulus",
] as const;

export type ThesisStatus = (typeof thesisStatus)[number];

export interface Thesis {
  id: number;
  title?: string;
  progress: ThesisStatus;
  student: Student;
  lecturers: (Supervisor | Examiner)[];
}
