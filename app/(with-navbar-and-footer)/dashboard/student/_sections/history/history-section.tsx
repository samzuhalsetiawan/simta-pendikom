import { ConsultationHistory, ExamHistory, HistoryTabs, SeminarHistory } from "./components/history-tabs";

const DUMMY_CONSULTATIONS: ConsultationHistory[] = [
   {
      id: 1,
      date: new Date(2024, 11, 15, 10, 0),
      location: "Ruang Dosen Lt. 3",
      lecturer: "Dr. Ahmad Fauzi, M.Kom",
      progress: "Penelitian",
      topic: "Diskusi tentang hasil eksperimen machine learning dan analisis confusion matrix"
   },
   {
      id: 2,
      date: new Date(2024, 11, 8, 14, 30),
      location: "Zoom Meeting",
      lecturer: "Dr. Siti Rahmawati, M.T",
      progress: "Penelitian",
      topic: "Review dataset dan preprocessing data cuaca"
   },
   {
      id: 3,
      date: new Date(2024, 10, 25, 9, 0),
      location: "Lab Komputer",
      lecturer: "Dr. Ahmad Fauzi, M.Kom",
      progress: "Seminar Proposal",
      topic: null
   },
];

const DUMMY_SEMINAR_PROPOSALS: SeminarHistory[] = [
   {
      id: 1,
      type: "proposal",
      date: new Date(2024, 9, 20, 9, 0),
      location: "Ruang Seminar A",
      supervisors: ["Dr. Ahmad Fauzi, M.Kom", "Dr. Siti Rahmawati, M.T"],
      examiners: ["Prof. Dr. Budi Santoso, M.Sc", "Dr. Eng. Maya Kusuma, S.T., M.T"],
      attendees: [
         "Andi Wijaya (2005176041)",
         "Budi Prakoso (2005176042)",
         "Citra Dewi (2005176043)",
         "Dian Permata (2005176044)",
         "Eko Saputra (2005176045)",
         "Fitri Handayani (2005176046)",
         "Gita Purnama (2005176047)",
         "Hendra Gunawan (2005176048)",
      ],
      attendeeCount: 8,
      status: "lulus"
   },
];

const DUMMY_SEMINAR_HASILS: SeminarHistory[] = [];

const DUMMY_EXAMS: ExamHistory[] = [];

export function HistorySection() {
   return (
      <section className="mb-4">
         <HistoryTabs
            consultations={DUMMY_CONSULTATIONS}
            seminarProposals={DUMMY_SEMINAR_PROPOSALS}
            seminarHasils={DUMMY_SEMINAR_HASILS}
            exams={DUMMY_EXAMS}
         />
      </section>
   )
}