import { Thesis } from "@/types/thesis";

export type SeminarProposal = {
   id: number;
   thesis: Thesis;
   date: Date;
   location: string;
}