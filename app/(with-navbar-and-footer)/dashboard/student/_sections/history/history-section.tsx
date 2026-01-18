import { getStudentConsultations } from "@/data/student/get-student-consultations";
import { getStudentHistory } from "@/data/student/get-student-history";
import { ConsultationHistory, ExamHistory, HistoryTabs, SeminarHistory } from "./components/history-tabs";
import { thesisStatus } from "@/types/thesis";

type HistorySectionProps = {
   studentId: number;
}

// Map thesis status to readable format
const statusLabels: Record<string, string> = {
   pengajuan_proposal: "Pengajuan Proposal",
   seminar_proposal: "Seminar Proposal",
   penelitian: "Penelitian",
   seminar_hasil: "Seminar Hasil",
   pendadaran: "Pendadaran",
   lulus: "Lulus",
};

export async function HistorySection({ studentId }: HistorySectionProps) {
   const [consultations, events] = await Promise.all([
      getStudentConsultations(studentId),
      getStudentHistory(studentId),
   ]);

   // Map consultations to history format
   const consultationHistory: ConsultationHistory[] = consultations.map((c) => ({
      id: c.id,
      date: c.date,
      location: c.location,
      lecturer: c.lecturer.name,
      progress: statusLabels[c.thesis.progress] ?? c.thesis.progress,
      topic: c.topic,
      status: c.status,
      lecturerNote: c.lecturerNote,
   }));

   // Separate events by type
   const seminarProposals: SeminarHistory[] = events
      .filter((e) => e.type === "seminar_proposal")
      .map((e) => ({
         id: e.id,
         type: "proposal" as const,
         date: e.date,
         location: e.location,
         supervisors: e.thesis.lecturers.filter((l) => l.role === "pembimbing").map((l) => l.name),
         examiners: e.thesis.lecturers.filter((l) => l.role === "penguji").map((l) => l.name),
         attendees: [],
         attendeeCount: (e as any).attendeeCount ?? 0,
         requestStatus: (e as any).requestStatus ?? "requested",
         passStatus: (e as any).passStatus ?? "pending",
      }));

   const seminarHasils: SeminarHistory[] = events
      .filter((e) => e.type === "seminar_hasil")
      .map((e) => ({
         id: e.id,
         type: "hasil" as const,
         date: e.date,
         location: e.location,
         supervisors: e.thesis.lecturers.filter((l) => l.role === "pembimbing").map((l) => l.name),
         examiners: e.thesis.lecturers.filter((l) => l.role === "penguji").map((l) => l.name),
         attendees: [],
         attendeeCount: (e as any).attendeeCount ?? 0,
         requestStatus: (e as any).requestStatus ?? "requested",
         passStatus: (e as any).passStatus ?? "pending",
      }));

   const exams: ExamHistory[] = events
      .filter((e) => e.type === "pendadaran")
      .map((e) => ({
         id: e.id,
         date: e.date,
         location: e.location,
         supervisors: e.thesis.lecturers.filter((l) => l.role === "pembimbing").map((l) => l.name),
         examiners: e.thesis.lecturers.filter((l) => l.role === "penguji").map((l) => l.name),
         requestStatus: (e as any).requestStatus ?? "requested",
         passStatus: (e as any).passStatus ?? "pending",
      }));

   return (
      <section className="mb-4">
         <HistoryTabs
            consultations={consultationHistory}
            seminarProposals={seminarProposals}
            seminarHasils={seminarHasils}
            exams={exams}
         />
      </section>
   )
}