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

type WithType<T extends EventType> = { type: T };


export type Event =
  | Konsultasi & WithType<"konsultasi">
  | SeminarProposal & WithType<"seminar_proposal">
  | SeminarHasil & WithType<"seminar_hasil">
  | Pendadaran & WithType<"pendadaran">;