"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLecturerStudentDetail } from "@/lib/dal/lecturer";

export async function respondToSeminarRequest(
    approvalId: number,
    seminarType: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran',
    status: 'approved' | 'rejected',
    reason?: string,
    useSignature: boolean = true
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");
    const nip = session.user.username;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const approvalTable = `${seminarType}_approval`;
        const idCol = `${seminarType}_id`;

        // Update approval
        await connection.execute(
            `UPDATE ${approvalTable} SET status = ?, rejection_reason = ?, use_signature = ?, responded_at = NOW() WHERE id = ? AND lecturer_nip = ?`,
            [status, reason || null, useSignature, approvalId, nip]
        );

        // Fetch seminarId from approval
        const [approvalRow] = await connection.execute(
            `SELECT BIN_TO_UUID(${idCol}) as seminar_id FROM ${approvalTable} WHERE id = ?`, [approvalId]
        ) as any[];

        if (approvalRow.length === 0) throw new Error("Approval not found");
        const seminarId = approvalRow[0].seminar_id;

        // Check overall status
        const [seminarRows] = await connection.execute(
            `SELECT BIN_TO_UUID(thesis_id) as thesis_id, scheduled_date FROM ${seminarType} WHERE id = UUID_TO_BIN(?)`, 
            [seminarId]
        ) as any[];

        if (seminarRows.length === 0) throw new Error("Seminar not found");
        const seminarInfo = seminarRows[0];

        if (status === 'rejected') {
            await connection.execute(
                `UPDATE ${seminarType} SET status = 'rejected' WHERE id = UUID_TO_BIN(?)`, [seminarId]
            );
        } else {
            // Check if any is rejected or pending
            const [allApprovals] = await connection.execute(
                `SELECT a.status FROM ${approvalTable} a WHERE a.${idCol} = UUID_TO_BIN(?)`, [seminarId]
            ) as any[];

            const hasRejected = allApprovals.some((a: any) => a.status === 'rejected');
            const hasPending = allApprovals.some((a: any) => a.status === 'pending');

            if (hasRejected) {
                await connection.execute(`UPDATE ${seminarType} SET status = 'rejected' WHERE id = UUID_TO_BIN(?)`, [seminarId]);
            } else if (!hasPending) {
                // All approved!
                const newStatus = seminarType === 'pendadaran' ? 'pending_document' : 'approved';
                await connection.execute(`UPDATE ${seminarType} SET status = ? WHERE id = UUID_TO_BIN(?)`, [newStatus, seminarId]);

                if (seminarType === 'seminar_proposal' || seminarType === 'seminar_hasil') {
                    const nextProgress = seminarType === 'seminar_proposal' ? 'seminar_proposal' : 'seminar_hasil';
                    await connection.execute(`UPDATE thesis SET progress = ? WHERE id = UUID_TO_BIN(?)`, [nextProgress, seminarInfo.thesis_id]);
                    await connection.execute(
                        `INSERT INTO thesis_progress_history (thesis_id, to_progress) VALUES (UUID_TO_BIN(?), ?)`,
                        [seminarInfo.thesis_id, nextProgress]
                    );
                }
            }
        }

        await connection.commit();
        revalidatePath("/dashboard");
        const persetujuanSlug = seminarType === 'pendadaran' ? 'persetujuan-sidang-skripsi' : `persetujuan-${seminarType.replace('_', '-')}`;
        revalidatePath(`/${persetujuanSlug}/${seminarId}`);
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Respond seminar error:", error);
        return { error: error.message || "Gagal merespon permohonan seminar." };
    } finally {
        connection.release();
    }
}

import { logStudentActivity } from "./activity";
import { publishRealtimeEvent } from "@/lib/realtime/event-bus";

// === Complete/confirm events ===

export async function completeConsultation(id: string, attended: boolean) {
    try {
        const [rows] = await db.execute(
            'SELECT student_nim, lecturer_nip FROM consultation WHERE id = UUID_TO_BIN(?)',
            [id]
        ) as any;

        const newStatus = attended ? 'completed' : 'missed';
        await db.execute(`UPDATE consultation SET status = ?, current_qr_token = NULL WHERE id = UUID_TO_BIN(?)`, [newStatus, id]);

        if (rows && rows.length > 0) {
            const cons = rows[0];
            if (attended) {
                await logStudentActivity(cons.student_nim, "KONSULTASI", "Menghadiri bimbingan");
            }
            publishRealtimeEvent({
                type: "consultation:completed",
                target: {
                    users: [cons.student_nim, cons.lecturer_nip],
                },
                payload: {
                    consultationId: id,
                    studentNim: cons.student_nim,
                    status: newStatus,
                    completedAt: new Date().toISOString(),
                },
            });
        }

        revalidatePath(`/konsultasi/${id}`);
        revalidatePath("/konsultasi");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Complete consultation error:", error);
        return { error: "Gagal mengonfirmasi konsultasi." };
    }
}



export async function markInvitationAsRead(seminarId: string, type: 'seminar_proposal' | 'seminar_hasil' | 'pendadaran') {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");
    const nip = session.user.username;

    try {
        const approvalTable = `${type}_approval`;
        const idCol = `${type}_id`;

        await db.execute(
            `UPDATE ${approvalTable} SET invitation_read = TRUE WHERE ${idCol} = UUID_TO_BIN(?) AND lecturer_nip = ?`,
            [seminarId, nip]
        );

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Mark invitation read error:", error);
        return { error: "Gagal menandai undangan sebagai dibaca." };
    }
}
