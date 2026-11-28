"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import path from "path";
import { logStudentActivity } from "./activity";

export async function updateProposal(id: string, data: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) return { error: "Unauthorized" };

    const title = data.get("title")?.toString();
    const researchType = data.get("research_type")?.toString();
    const researchMethod = data.get("research_method")?.toString();

    const connection = await db.getConnection();
    try {
        // Check ownership
        const [rows] = await connection.execute(
            "SELECT nim, proposal_approval_status as approval_status FROM thesis WHERE id = UUID_TO_BIN(?)",
            [id]
        ) as any[];

        if (rows.length === 0 || rows[0].nim !== session.user.username) {
            return { error: "Proposal tidak ditemukan atau bukan milikmu." };
        }

        if (rows[0].approval_status === 'pending' || rows[0].approval_status === 'approved') {
            return { error: "Tidak dapat mengubah proposal yang sedang atau sudah disetujui." };
        }

        const updates = [];
        const params = [];
        if (title !== undefined) {
            updates.push("title = ?");
            params.push(title);
        }
        if (researchType !== undefined) {
            updates.push("research_type = ?");
            params.push(researchType);
        }
        if (researchMethod !== undefined) {
            updates.push("research_method = ?");
            params.push(researchMethod);
        }

        if (updates.length > 0) {
            params.push(id);
            await connection.execute(
                `UPDATE thesis SET ${updates.join(", ")} WHERE id = UUID_TO_BIN(?)`,
                params
            );

            // Log activities based on what changed
            const nim = session.user.username;
            if (title !== undefined) await logStudentActivity(nim, "PROPOSAL", "Merubah judul proposal");
            if (researchType !== undefined) await logStudentActivity(nim, "PROPOSAL", "Merubah jenis penelitian proposal");
            if (researchMethod !== undefined) await logStudentActivity(nim, "PROPOSAL", "Merubah metode penelitian proposal");
        }

        revalidatePath("/dashboard");
        revalidatePath("/skripsi");
        revalidatePath(`/skripsi/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Update proposal error:", error);
        return { error: "Gagal mengupdate proposal." };
    } finally {
        connection.release();
    }
}

export async function uploadProposalPdf(id: string, data: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) return { error: "Unauthorized" };

    const file = data.get("file") as File;
    if (!file || file.type !== "application/pdf") {
        return { error: "File harus berupa PDF." };
    }

    const connection = await db.getConnection();
    try {
        // Check ownership
        const [rows] = await connection.execute(
            "SELECT nim, proposal_approval_status as approval_status FROM thesis WHERE id = UUID_TO_BIN(?)",
            [id]
        ) as any[];

        if (rows.length === 0 || rows[0].nim !== session.user.username) {
            return { error: "Proposal tidak ditemukan atau bukan milikmu." };
        }

        if (rows[0].approval_status === 'pending' || rows[0].approval_status === 'approved') {
            return { error: "Tidak dapat mengubah file proposal yang sedang atau sudah disetujui." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `document/proposal_${id}.pdf`;
        await put(fileName, buffer, {
            access: "private",
            allowOverwrite: true,
        });
        const fileUrl = `/api/uploaded/${fileName}`;
        
        await connection.execute(
            "UPDATE thesis SET proposal_url = ? WHERE id = UUID_TO_BIN(?)",
            [fileUrl, id]
        );

        await logStudentActivity(session.user.username, "PROPOSAL", "Upload file proposal");

        revalidatePath("/dashboard");
        revalidatePath("/skripsi");
        revalidatePath(`/skripsi/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Upload proposal error:", error);
        return { error: "Gagal mengupload file proposal." };
    } finally {
        connection.release();
    }
}

export async function requestProposalApproval(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) return { error: "Unauthorized" };

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Check ownership and completion
        const [rows] = await connection.execute(
            "SELECT nim, title, research_type, research_method, proposal_url, proposal_approval_status as approval_status FROM thesis WHERE id = UUID_TO_BIN(?)",
            [id]
        ) as any[];

        if (rows.length === 0 || rows[0].nim !== session.user.username) {
            throw new Error("Skripsi/Proposal tidak ditemukan atau bukan milikmu.");
        }

        const proposal = rows[0];
        if (!proposal.title || !proposal.research_type || !proposal.research_method || !proposal.proposal_url) {
            throw new Error("Informasi proposal atau file belum lengkap.");
        }

        if (proposal.approval_status === 'pending' || proposal.approval_status === 'approved') {
            throw new Error("Proposal sudah diajukan atau sudah disetujui.");
        }

        const thesisId = id;

        // Get lecturers (supervisors only)
        const [lecturers] = await connection.execute(
            "SELECT lecturer_nip FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?) AND role = 'supervisor'",
            [thesisId]
        ) as any[];

        // Get Kajur & Kaprodi
        const [staff] = await connection.execute(
            "SELECT nip, role FROM staff WHERE role IN ('ketua_jurusan', 'koordinator_program_studi')"
        ) as any[];

        // Clear existing approvals to prevent duplicates (in case they were just reset/canceled)
        await connection.execute("DELETE FROM proposal_approval WHERE thesis_id = UUID_TO_BIN(?)", [thesisId]);

        // Insert approvals
        // Lecturers (Supervisors)
        for (const lec of lecturers) {
            await connection.execute(
                "INSERT INTO proposal_approval (thesis_id, lecturer_nip, status, assigned_role) VALUES (UUID_TO_BIN(?), ?, 'pending', 'supervisor')",
                [thesisId, lec.lecturer_nip]
            );
        }

        // Staff
        for (const st of staff) {
            await connection.execute(
                "INSERT INTO proposal_approval (thesis_id, lecturer_nip, status, assigned_role) VALUES (UUID_TO_BIN(?), ?, 'pending', ?)",
                [thesisId, st.nip, st.role]
            );
        }

        await connection.execute(
            "UPDATE thesis SET proposal_approval_status = 'pending' WHERE id = UUID_TO_BIN(?)",
            [thesisId]
        );

        await logStudentActivity(session.user.username, "PROPOSAL", "Meminta persetujuan proposal");

        await connection.commit();
        revalidatePath("/dashboard");
        revalidatePath("/skripsi");
        revalidatePath(`/skripsi/${id}`);
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Request proposal approval error:", error);
        return { error: error.message || "Gagal mengajukan permohonan persetujuan proposal." };
    } finally {
        connection.release();
    }
}

export async function respondToProposalApproval(
    approvalId: number | number[],
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
        const ids = Array.isArray(approvalId) ? approvalId : [approvalId];
        if (ids.length === 0) throw new Error("No approval IDs provided");

        let thesisId: string | null = null;

        for (const id of ids) {
            // Update approval
            await connection.execute(
                `UPDATE proposal_approval SET status = ?, rejection_reason = ?, use_signature = ?, responded_at = NOW() WHERE id = ? AND lecturer_nip = ?`,
                [status, reason || null, useSignature, id, nip]
            );

            // Fetch thesis_id from approval
            const [approvalRow] = await connection.execute(
                `SELECT BIN_TO_UUID(thesis_id) as thesis_id FROM proposal_approval WHERE id = ?`, [id]
            ) as any[];

            if (approvalRow.length === 0) throw new Error(`Approval ${id} not found`);
            if (!thesisId) thesisId = approvalRow[0].thesis_id;
        }

        if (!thesisId) throw new Error("Thesis ID could not be determined");

        if (status === 'rejected') {
            await connection.execute(
                `UPDATE thesis SET proposal_approval_status = 'rejected' WHERE id = UUID_TO_BIN(?)`, [thesisId]
            );
        } else {
            // Check if any is rejected or pending
            const [allApprovals] = await connection.execute(
                `SELECT status FROM proposal_approval WHERE thesis_id = UUID_TO_BIN(?)`, [thesisId]
            ) as any[];

            const hasRejected = allApprovals.some((a: any) => a.status === 'rejected');
            const hasPending = allApprovals.some((a: any) => a.status === 'pending');

            if (hasRejected) {
                await connection.execute(`UPDATE thesis SET proposal_approval_status = 'rejected' WHERE id = UUID_TO_BIN(?)`, [thesisId]);
            } else if (!hasPending) {
                // All approved!
                await connection.execute(`UPDATE thesis SET proposal_approval_status = 'approved' WHERE id = UUID_TO_BIN(?)`, [thesisId]);
            }
        }

        await connection.commit();
        revalidatePath("/dashboard");
        revalidatePath("/skripsi");
        revalidatePath(`/skripsi/${thesisId}`);
        revalidatePath(`/persetujuan-proposal/${thesisId}`);
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Respond proposal approval error:", error);
        return { error: error.message || "Gagal merespon permohonan proposal." };
    } finally {
        connection.release();
    }
}

export async function cancelProposalApprovalRequest(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) return { error: "Unauthorized" };

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Check ownership and status
        const [rows] = await connection.execute(
            "SELECT nim, proposal_approval_status as approval_status FROM thesis WHERE id = UUID_TO_BIN(?)",
            [id]
        ) as any[];

        if (rows.length === 0 || rows[0].nim !== session.user.username) {
            throw new Error("Skripsi/Proposal tidak ditemukan atau bukan milikmu.");
        }

        if (rows[0].approval_status !== 'pending') {
            throw new Error("Hanya permohonan yang sedang menunggu persetujuan yang dapat dibatalkan.");
        }

        // Hapus semua record di proposal_approval
        await connection.execute(
            "DELETE FROM proposal_approval WHERE thesis_id = UUID_TO_BIN(?)",
            [id]
        );

        // Reset status
        await connection.execute(
            "UPDATE thesis SET proposal_approval_status = 'unrequested' WHERE id = UUID_TO_BIN(?)",
            [id]
        );

        await connection.commit();
        revalidatePath("/dashboard");
        revalidatePath("/skripsi");
        revalidatePath(`/skripsi/${id}`);
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Cancel proposal approval error:", error);
        return { error: error.message || "Gagal membatalkan permohonan persetujuan proposal." };
    } finally {
        connection.release();
    }
}
