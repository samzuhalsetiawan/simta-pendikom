import { Konsultasi } from "./konsultasi";
import { Pendadaran } from "./pendadaran";
import { SeminarHasil } from "./seminar-hasil";
import { SeminarProposal } from "./seminar-proposal";

export const eventTypes = [
  "konsultasi",
  "seminar_proposal",
  "seminar_hasil",
  "pendadaran",
] as const;

export type EventType = typeof eventTypes[number];

/**
 * Mapping dari [@type {EventType}] ke definisi tipenya.
 */
type EventMap = {
  konsultasi: Konsultasi;
  seminar_proposal: SeminarProposal;
  seminar_hasil: SeminarHasil;
  pendadaran: Pendadaran;
};

// Akan terjadi error jika ada EventType yang tidak semuanya dimapping di EventMap
export type Event = {
  [K in EventType]: EventMap[K] & { type: K };
}[EventType];