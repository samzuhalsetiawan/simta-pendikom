import { Lecturer } from "./lecturer";
import { Student } from "./student";

interface UserRoleMap {
  student: Student;
  lecturer: Lecturer;
}

export type UserRole = keyof UserRoleMap;

export type User = {
   [K in UserRole]: UserRoleMap[K] & { role: K }
}[UserRole]