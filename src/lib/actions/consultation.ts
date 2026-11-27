"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logStudentActivity } from "./activity";
import { v7 as uuidv7 } from "uuid";

export async function requestConsultation(lecturerNip: string, studentNim: string) {
    const id = uuidv7();
    await db.execute(
        'INSERT INTO consultation (id, lecturer_nip, student_nim, consultation_date, status) VALUES (UUID_TO_BIN(?), ?, ?, NULL, ?)',
        [id, lecturerNip, studentNim, 'requested']
    );
    await logStudentActivity(studentNim, "KONSULTASI", "Mengajukan permohonan bimbingan");
    revalidatePath('/dashboard');
    return { success: true };
}

export async function scheduleConsultation(id: string, date: string, venue: string) {
    const shortSalt = crypto.randomUUID().split('-')[0];
    const combinedToken = `${id}-${shortSalt}`;

    await db.execute(
        'UPDATE consultation SET consultation_date = ?, venue = ?, status = ?, current_qr_token = ? WHERE id = UUID_TO_BIN(?)',
        [date, venue, 'approved', combinedToken, id]
    );
    revalidatePath('/dashboard');
    return { success: true };
}



export async function rejectConsultation(id: string, reason: string) {
    await db.execute(
        'UPDATE consultation SET status = ?, reject_reason = ? WHERE id = UUID_TO_BIN(?)',
        ['rejected', reason, id]
    );
    revalidatePath('/dashboard');
    return { success: true };
}

export async function updateStudentNotes(id: string, notes: string) {
    await db.execute(
        'UPDATE consultation SET student_notes = ? WHERE id = UUID_TO_BIN(?)',
        [notes, id]
    );
    revalidatePath(`/konsultasi/${id}`);
    return { success: true };
}


import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { publishRealtimeEvent } from "@/lib/realtime/event-bus";

export async function setConsultationQrToken(id: string, token: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "unauthorized" };
    const username = session.user.username;

    try {
        const [rows] = await db.execute(
            'SELECT student_nim, lecturer_nip FROM consultation WHERE id = UUID_TO_BIN(?)',
            [id]
        ) as any;
        if (!rows || rows.length === 0) return { error: "not_found" };
        if (rows[0].student_nim !== username && rows[0].lecturer_nip !== username) {
            return { error: "unauthorized" };
        }

        await db.execute(
            'UPDATE consultation SET current_qr_token = ? WHERE id = UUID_TO_BIN(?)',
            [token, id]
        );
        return { success: true };
    } catch (error) {
        console.error("Set consultation QR token error:", error);
        return { error: "Gagal mengatur token QR." };
    }
}

export async function getOrCreateConsultationQrToken(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "unauthorized" };
    const username = session.user.username;

    try {
        const [rows] = await db.execute(
            'SELECT student_nim, lecturer_nip, current_qr_token, status FROM consultation WHERE id = UUID_TO_BIN(?)',
            [id]
        ) as any;
        if (!rows || rows.length === 0) return { error: "not_found" };
        const cons = rows[0];
        if (cons.student_nim !== username && cons.lecturer_nip !== username) {
            return { error: "unauthorized" };
        }

        if (cons.current_qr_token) {
            return { success: true, token: cons.current_qr_token };
        }

        const shortSalt = crypto.randomUUID().split('-')[0];
        const combinedToken = `${id}-${shortSalt}`;
        await db.execute(
            'UPDATE consultation SET current_qr_token = ? WHERE id = UUID_TO_BIN(?)',
            [combinedToken, id]
        );
        return { success: true, token: combinedToken };
    } catch (error) {
        console.error("Get or create consultation QR token error:", error);
        return { error: "Gagal membuat token QR." };
    }
}

export async function verifyAndCompleteConsultation(token: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.role?.includes('lecturer')) {
        return { error: "unauthorized" };
    }
    const nip = session.user.username; // Lecturer's NIP

    try {
        const id = token.substring(0, 36);
        const [rows] = await db.execute(
            'SELECT student_nim, lecturer_nip, current_qr_token, status FROM consultation WHERE id = UUID_TO_BIN(?)',
            [id]
        ) as any;

        if (!rows || rows.length === 0) return { error: "not_found" };
        const consultation = rows[0];

        if (consultation.status === 'completed') return { error: "already_completed" };
        if (consultation.lecturer_nip !== nip) return { error: "unauthorized" };
        if (consultation.current_qr_token !== token) return { error: "invalid_token" };

        await db.execute(
            'UPDATE consultation SET status = ?, current_qr_token = NULL WHERE id = UUID_TO_BIN(?)',
            ['completed', id]
        );
        await logStudentActivity(consultation.student_nim, "KONSULTASI", "Menghadiri bimbingan");
        revalidatePath(`/konsultasi/${id}`);
        revalidatePath('/konsultasi');
        revalidatePath('/dashboard');
        
        // Dispatch realtime event to notify student's active tab instantly
        publishRealtimeEvent({
            type: "consultation:completed",
            target: {
                users: [consultation.student_nim, nip],
            },
            payload: {
                consultationId: id,
                studentNim: consultation.student_nim,
                status: "completed",
                completedAt: new Date().toISOString(),
            },
        });

        return { success: true, id, studentNim: consultation.student_nim };
    } catch (error) {
        console.error("Verify consultation QR error:", error);
        return { error: "invalid_token" };
    }
}
