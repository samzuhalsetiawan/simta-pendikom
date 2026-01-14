export type Lecturer = {
   id: number;
   nip: string;
   name: string;
   email?: string;
   image?: string;
   isAdmin: boolean;
}

type WithRole<R extends LecturerRole> = { role: R }

export type Supervisor = Lecturer & WithRole<"pembimbing">;

export type Examiner = Lecturer & WithRole<"penguji">;

export const lecturerRoles = [
   "pembimbing",
   "penguji",
 ] as const;

export type LecturerRole = typeof lecturerRoles[number];