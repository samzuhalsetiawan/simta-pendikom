export interface Lecturer {
   id: number;
   nip: string;
   name: string;
   email: string | null;
   image: string | null;
}

export const LECTURER_ROLES = {
   SUPERVISOR: "pembimbing",
   EXAMINER: "penguji",
} as const;

export const LECTURER_ROLE_LABELS = {
   [LECTURER_ROLES.SUPERVISOR]: "Pembimbing",
   [LECTURER_ROLES.EXAMINER]: "Penguji",
} as const;

export type LecturerRoleRaw = typeof LECTURER_ROLES[keyof typeof LECTURER_ROLES];
export type LecturerRole = typeof LECTURER_ROLE_LABELS[keyof typeof LECTURER_ROLE_LABELS];