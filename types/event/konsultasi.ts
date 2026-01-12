import { Thesis } from "@/types/thesis";

export type Konsultasi = {
   id: number;
   thesis: Thesis;
   date: Date;
   location: string;
   topic?: string;
}