"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logStudentActivity } from "@/lib/actions/activity";

export interface StudentCheatStatus {
    nim: string;
    name: string;
    thesis_id: string | null;
    title: string | null;
    proposal_url: string | null;
    proposal_approval_status: 'unrequested' | 'pending' | 'approved' | 'rejected' | null;
    progress: string | null;
    attendance_count: number;
    active_sempro_count: number;
    has_supervisors: boolean;
    is_ready_for_cheat: boolean; // has title, has proposal_url, has supervisors, has thesis_id
    is_eligible_for_sempro: boolean; // attendance >= 3 && proposal_approval_status === 'approved' && has title
}

export async function getStudentCheatStatusAction(nim: string): Promise<StudentCheatStatus | null> {
    try {
        const [rows] = await db.execute(`
            SELECT 
                s.nim,
                u.name,
                BIN_TO_UUID(t.id) as thesis_id,
                t.title,
                t.proposal_url,
                t.proposal_approval_status,
                t.progress,
                (SELECT COUNT(*) FROM seminar_attendance sa WHERE sa.student_nim = s.nim AND sa.status = 'menghadiri') as attendance_count,
                (SELECT COUNT(*) FROM seminar_proposal sp WHERE sp.thesis_id = t.id AND sp.status IN ('pending_approval', 'pending_schedule', 'approved')) as active_sempro_count,
                (SELECT COUNT(*) FROM thesis_lecturer tl WHERE tl.thesis_id = t.id AND tl.role = 'supervisor') as supervisor_count
            FROM student s
            JOIN user u ON s.nim = u.username
            LEFT JOIN thesis t ON s.nim = t.nim
            WHERE s.nim = ?
        `, [nim]) as any[];

        if (rows.length === 0) return null;
        const r = rows[0];

        const has_supervisors = Number(r.supervisor_count || 0) > 0;
        const has_title = Boolean(r.title && r.title.trim() !== "");
        const has_proposal_file = Boolean(r.proposal_url && r.proposal_url.trim() !== "");
        const has_thesis_id = Boolean(r.thesis_id);
        const attendance_count = Number(r.attendance_count || 0);
        const is_approved = r.proposal_approval_status === "approved";

        return {
            nim: r.nim,
            name: r.name,
            thesis_id: r.thesis_id || null,
            title: r.title || null,
            proposal_url: r.proposal_url || null,
            proposal_approval_status: r.proposal_approval_status || null,
            progress: r.progress || null,
            attendance_count,
            active_sempro_count: Number(r.active_sempro_count || 0),
            has_supervisors,
            is_ready_for_cheat: has_thesis_id && has_title && has_proposal_file && has_supervisors,
            is_eligible_for_sempro: attendance_count >= 3 && is_approved && has_title,
        };
    } catch (error: any) {
        console.error("getStudentCheatStatusAction error:", error);
        return null;
    }
}

export async function allowStudentToHeldSemproAction(nim: string) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Validasi mahasiswa dan data skripsi / proposal
        const [theses] = await connection.execute(`
            SELECT 
                BIN_TO_UUID(t.id) as thesis_id,
                t.title,
                t.proposal_url,
                t.proposal_approval_status
            FROM thesis t
            WHERE t.nim = ?
        `, [nim]) as any[];

        if (theses.length === 0) {
            throw new Error(`Mahasiswa dengan NIM ${nim} belum memiliki data skripsi/thesis.`);
        }

        const thesis = theses[0];
        const thesisId = thesis.thesis_id;

        if (!thesis.title || thesis.title.trim() === "") {
            throw new Error("Mahasiswa belum memiliki judul proposal. Harap lengkapi judul proposal terlebih dahulu.");
        }

        if (!thesis.proposal_url || thesis.proposal_url.trim() === "") {
            throw new Error("Mahasiswa belum mengunggah file dokumen proposal. Harap upload dokumen proposal terlebih dahulu.");
        }

        // Cek dosen pembimbing
        const [supervisors] = await connection.execute(
            `SELECT lecturer_nip FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?) AND role = 'supervisor'`,
            [thesisId]
        ) as any[];

        if (supervisors.length === 0) {
            throw new Error("Mahasiswa belum memiliki dosen pembimbing yang ditugaskan.");
        }

        // 2. Manipulasi status proposal agar disetujui (proposal_approval_status = 'approved')
        // Dapatkan pejabat staff kajur & kaprodi
        const [staff] = await connection.execute(
            `SELECT nip, role FROM staff WHERE role IN ('ketua_jurusan', 'koordinator_program_studi')`
        ) as any[];

        // Hapus approval lama jika ada, lalu generate entri baru yang sudah approved
        await connection.execute(`DELETE FROM proposal_approval WHERE thesis_id = UUID_TO_BIN(?)`, [thesisId]);

        for (const sup of supervisors) {
            await connection.execute(`
                INSERT INTO proposal_approval (thesis_id, lecturer_nip, status, assigned_role, use_signature, responded_at)
                VALUES (UUID_TO_BIN(?), ?, 'approved', 'supervisor', 1, NOW())
            `, [thesisId, sup.lecturer_nip]);
        }

        for (const st of staff) {
            await connection.execute(`
                INSERT INTO proposal_approval (thesis_id, lecturer_nip, status, assigned_role, use_signature, responded_at)
                VALUES (UUID_TO_BIN(?), ?, 'approved', ?, 1, NOW())
            `, [thesisId, st.nip, st.role]);
        }

        await connection.execute(`
            UPDATE thesis SET proposal_approval_status = 'approved' WHERE id = UUID_TO_BIN(?)
        `, [thesisId]);

        // 3. Inject kehadiran seminar agar mahasiswa minimal menonton 3 seminar mahasiswa lain
        const [currentAttendances] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM seminar_attendance 
            WHERE student_nim = ? AND status = 'menghadiri'
        `, [nim]) as any[];

        const currentCount = Number(currentAttendances[0]?.count || 0);
        let injectedCount = 0;

        if (currentCount < 3) {
            const needed = 3 - currentCount;

            // Cari seminar milik orang lain yang belum pernah dihadiri/didaftarkan oleh mahasiswa ini
            const [availableSeminars] = await connection.execute(`
                SELECT BIN_TO_UUID(s.id) as id, s.type
                FROM (
                    SELECT sp.id, 'proposal' as type, t.nim
                    FROM seminar_proposal sp
                    JOIN thesis t ON sp.thesis_id = t.id
                    UNION ALL
                    SELECT sh.id, 'hasil' as type, t.nim
                    FROM seminar_hasil sh
                    JOIN thesis t ON sh.thesis_id = t.id
                ) s
                WHERE s.nim != ?
                  AND NOT EXISTS (
                      SELECT 1 FROM seminar_attendance sa
                      WHERE sa.seminar_id = s.id 
                        AND sa.seminar_type = s.type
                        AND sa.student_nim = ?
                  )
                LIMIT ${Number(needed)}
            `, [nim, nim]) as any[];

            if (availableSeminars.length < needed) {
                throw new Error(`Tidak cukup agenda seminar mahasiswa lain di database untuk dijadikan presensi kehadiran (tersedia: ${availableSeminars.length}, dibutuhkan: ${needed}).`);
            }

            for (const sem of availableSeminars) {
                await connection.execute(`
                    INSERT INTO seminar_attendance (seminar_id, seminar_type, student_nim, status, device_fingerprint, created_at)
                    VALUES (UUID_TO_BIN(?), ?, ?, 'menghadiri', 'dev_cheat_injected', NOW())
                `, [sem.id, sem.type, nim]);
                injectedCount++;
            }
        }

        await logStudentActivity(nim, "PROPOSAL", "Meminta persetujuan proposal");

        await connection.commit();

        revalidatePath("/dev-cheat");
        revalidatePath("/dashboard");
        revalidatePath("/skripsi");
        revalidatePath(`/skripsi/${thesisId}`);
        revalidatePath(`/persetujuan-proposal/${thesisId}`);

        return { 
            success: true, 
            message: `Berhasil! Status proposal disetujui, dan ${injectedCount > 0 ? `${injectedCount} presensi seminar penonton berhasil di-inject.` : "presensi seminar sudah mencukupi (>=3)."}`
        };
    } catch (error: any) {
        await connection.rollback();
        console.error("allowStudentToHeldSemproAction error:", error);
        return { error: error.message || "Gagal mengizinkan mahasiswa untuk seminar proposal." };
    } finally {
        connection.release();
    }
}
