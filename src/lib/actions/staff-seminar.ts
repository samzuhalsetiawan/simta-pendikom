"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLecturerStudentDetail } from "@/lib/dal/lecturer";
import { parseIndoDateTime, toMySQLDateTime } from "@/lib/utils/datetime";

type SeminarType = 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';

const TABLE_MAP: Record<SeminarType, string> = {
    seminar_proposal: 'seminar_proposal',
    seminar_hasil: 'seminar_hasil',
    pendadaran: 'pendadaran',
};

async function validateStaff() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) {
        throw new Error("Unauthorized");
    }

    const [staffRows] = await db.execute(
        "SELECT role FROM staff WHERE nip = ?",
        [session.user.username]
    ) as any[];

    if (staffRows.length === 0) {
        throw new Error("Anda tidak memiliki izin untuk mengelola jadwal seminar.");
    }

    return session.user.username;
}

export async function approveSeminarRequest(
    seminarId: string,
    type: SeminarType,
    scheduledDate: string,
    venue?: string
) {
    try {
        const staffUsername = await validateStaff();
        const table = TABLE_MAP[type];

        const [existing] = await db.execute(
            `SELECT BIN_TO_UUID(thesis_id) as thesis_id, status FROM ${table} WHERE id = UUID_TO_BIN(?)`,
            [seminarId]
        ) as any[];

        if (existing.length === 0) {
            return { error: "Permohonan seminar tidak ditemukan." };
        }

        if (existing[0].status !== 'pending_schedule') {
            return { error: "Permohonan ini sudah diproses sebelumnya." };
        }

        const thesisId = existing[0].thesis_id;
        const studentDetail = await getLecturerStudentDetail(thesisId);
        
        if (!studentDetail) {
             return { error: "Data mahasiswa tidak ditemukan." };
        }

        const parsedDate = parseIndoDateTime(scheduledDate);
        const mysqlDate = parsedDate ? toMySQLDateTime(parsedDate) : scheduledDate;

        await db.execute(
            `UPDATE ${table} SET status = 'pending_approval', scheduled_date = ?, venue = ?, scheduled_by = ? WHERE id = UUID_TO_BIN(?)`,
            [mysqlDate, venue || null, staffUsername, seminarId]
        );

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Approve seminar request error:", error);
        return { error: error.message || "Gagal menyetujui permohonan seminar." };
    }
}

export async function rejectSeminarRequest(
    seminarId: string,
    type: SeminarType,
    reason: string
) {
    try {
        const staffUsername = await validateStaff();
        const table = TABLE_MAP[type];

        if (!reason.trim()) {
            return { error: "Alasan penolakan harus diisi." };
        }

        const [existing] = await db.execute(
            `SELECT BIN_TO_UUID(id) as id, status FROM ${table} WHERE id = UUID_TO_BIN(?)`,
            [seminarId]
        ) as any[];

        if (existing.length === 0) {
            return { error: "Permohonan seminar tidak ditemukan." };
        }

        if (existing[0].status !== 'pending_schedule' && existing[0].status !== 'pending_staff_approval') {
            return { error: "Permohonan ini sudah diproses sebelumnya." };
        }

        await db.execute(
            `UPDATE ${table} SET status = 'rejected', rejection_reason = ?, scheduled_by = ? WHERE id = UUID_TO_BIN(?)`,
            [reason, staffUsername, seminarId]
        );

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Reject seminar request error:", error);
        return { error: error.message || "Gagal menolak permohonan seminar." };
    }
}

export async function approvePendadaranFinalDocument(seminarId: string) {
    try {
        const staffUsername = await validateStaff();

        const [existing] = await db.execute(
            `SELECT BIN_TO_UUID(id) as id, status FROM pendadaran WHERE id = UUID_TO_BIN(?)`,
            [seminarId]
        ) as any[];

        if (existing.length === 0) {
            return { error: "Permohonan sidang skripsi tidak ditemukan." };
        }

        if (existing[0].status !== 'pending_staff_approval') {
            return { error: "Permohonan ini tidak dalam status verifikasi akhir dokumen." };
        }

        await db.execute(
            `UPDATE pendadaran SET status = 'approved', scheduled_by = ? WHERE id = UUID_TO_BIN(?)`,
            [staffUsername, seminarId]
        );

        revalidatePath("/dashboard");
        revalidatePath(`/persetujuan-sidang-skripsi/${seminarId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Approve final document error:", error);
        return { error: error.message || "Gagal menyetujui dokumen akhir sidang skripsi." };
    }
}
