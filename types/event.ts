import { Thesis } from "./thesis";

export const EVENT_TYPES = {
   CONSULTATION: "consultation",
   SEMINAR_PROPOSAL: "seminar_proposal",
   SEMINAR_HASIL: "seminar_hasil",
   UJIAN_AKHIR: "ujian_akhir",
} as const;

export const EVENT_TYPE_LABELS = {
   [EVENT_TYPES.CONSULTATION]: "Konsultasi",
   [EVENT_TYPES.SEMINAR_PROPOSAL]: "Seminar Proposal",
   [EVENT_TYPES.SEMINAR_HASIL]: "Seminar Hasil",
   [EVENT_TYPES.UJIAN_AKHIR]: "Ujian Akhir",
} as const;

export type EventTypeRaw = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
export type EventType = typeof EVENT_TYPE_LABELS[keyof typeof EVENT_TYPE_LABELS];

export interface BaseEvent {
   id: number;
   thesis: Thesis;
   date: Date;
   location: string;
}

export interface Consultation extends BaseEvent {
   type: typeof EVENT_TYPE_LABELS["consultation"];
   topic: string | null;
}

export interface SeminarProposal extends BaseEvent {
   type: typeof EVENT_TYPE_LABELS["seminar_proposal"];
}

export interface SeminarHasil extends BaseEvent {
   type: typeof EVENT_TYPE_LABELS["seminar_hasil"];
}

export interface UjianAkhir extends BaseEvent {
   type: typeof EVENT_TYPE_LABELS["ujian_akhir"];
}

export type Event =
   | Consultation
   | SeminarProposal
   | SeminarHasil
   | UjianAkhir;