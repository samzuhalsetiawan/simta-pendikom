"use server";

import { assignLecturerRole, AssignmentRole } from "@/data/thesis/assign-role";
import { revalidatePath } from "next/cache";

export type AssignThesisState = {
   success?: boolean;
   message?: string;
};

export async function assignThesisAction(
   prevState: AssignThesisState | undefined,
   formData: {
      lecturerId: number;
      studentId: number;
      role: AssignmentRole;
      isMain: boolean;
   }[]
): Promise<AssignThesisState> {
   try {
      for (const assignment of formData) {
         await assignLecturerRole(
            assignment.lecturerId,
            assignment.studentId,
            assignment.role,
            assignment.isMain
         );
      }

      revalidatePath("/admin");
      return { success: true, message: "Assignments saved successfully" };
   } catch (error) {
      console.error("Failed to assign thesis role:", error);
      return {
         success: false,
         message: error instanceof Error ? error.message : "An unexpected error occurred"
      };
   }
}
