import { Lecturer, LecturerRole } from "./lecturer";
import { Student } from "./student";

export const THESIS_STATUS = {
   PRE_PROPOSAL: "pengajuan_judul",
   SEMINAR_PROPOSAL: "seminar_proposal",
   RESEARCH: "penelitian",
   SEMINAR_HASIL: "seminar_hasil",
   FINAL_EXAM: "ujian_akhir",
   COMPLETED: "selesai",
} as const;

export const THESIS_STATUS_LABELS = {
   [THESIS_STATUS.PRE_PROPOSAL]: "Pengajuan Judul",
   [THESIS_STATUS.SEMINAR_PROPOSAL]: "Seminar Proposal",
   [THESIS_STATUS.RESEARCH]: "Penelitian",
   [THESIS_STATUS.SEMINAR_HASIL]: "Seminar Hasil",
   [THESIS_STATUS.FINAL_EXAM]: "Sidang Akhir",
   [THESIS_STATUS.COMPLETED]: "Selesai",
} as const;

export type ThesisStatusRaw = typeof THESIS_STATUS[keyof typeof THESIS_STATUS];
export type ThesisStatus = typeof THESIS_STATUS_LABELS[keyof typeof THESIS_STATUS_LABELS];

export interface Thesis {
   id: number;
   title?: string;
   progress: ThesisStatus;
   student: Student;
   lecturers: (Lecturer & { role: LecturerRole })[];
}