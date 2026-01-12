export type Lecturer = {
   id: number;
   nip: string;
   name: string;
   email?: string;
   image?: string;
   isAdmin: boolean;
}

export type Supervisor = Lecturer & {
   role: typeof LECTURER_ROLE_LABELS[typeof LECTURER_ROLES.SUPERVISOR];
}

export type Examiner = Lecturer & {
   role: typeof LECTURER_ROLE_LABELS[typeof LECTURER_ROLES.EXAMINER];
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