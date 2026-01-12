import { Thesis } from "@/types/thesis";

export type SeminarHasil = {
   id: number;
   thesis: Thesis;
   date: Date;
   location: string;
}