import { Thesis } from "@/types/thesis";
import { Examiner, Supervisor } from "@/types/user/lecturer";

export type Konsultasi = {
   id: number;
   thesis: Thesis;
   date: Date;
   location: string;
   topic?: string;
   status: "pending" | "accepted" | "rejected";
   lecturerNote?: string;
   lecturer: Supervisor | Examiner;
}