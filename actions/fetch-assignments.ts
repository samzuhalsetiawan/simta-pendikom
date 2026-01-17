"use server";

import { getAssignmentsByStudent } from "@/data/thesis/get-assignments-by-student";
import { getAssignmentsByLecturer } from "@/data/thesis/get-assignments-by-lecturer";

export async function fetchAssignmentsByStudent(studentId: number) {
   return await getAssignmentsByStudent(studentId);
}

export async function fetchAssignmentsByLecturer(lecturerId: number) {
   return await getAssignmentsByLecturer(lecturerId);
}
