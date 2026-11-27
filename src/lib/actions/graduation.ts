"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateChecklistStatus } from "@/lib/dal/graduation";
import { revalidatePath } from "next/cache";

export async function toggleChecklistAction(itemId: string, isChecked: boolean) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const nim = session.user.username; // Assuming username is NIM

    await updateChecklistStatus(nim, itemId, isChecked);
    revalidatePath("/dashboard");
    
    return { success: true };
}
