"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSeminarAttendances } from "@/lib/dal/seminar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v7 as uuidv7 } from "uuid";
import fs from "fs";
import path from "path";
import { logStudentActivity } from "./activity";
import { MIN_SEMINAR_ATTENDANCE } from "@/lib/constants/thesis";

import { put } from "@vercel/blob";

export async function requestSeminarProposal(formData: FormData) {
    try {
        const thesisId = formData.get("thesisId") as string;

        if (!thesisId) throw new Error("Thesis ID is required");

        const [thesisRows] = await db.execute(
            `SELECT 
                t.nim, 
                BIN_TO_UUID(t.id) as thesis_id,
                t.title as proposal_title,
                t.proposal_approval_status as proposal_status
            FROM thesis t
            WHERE t.id = UUID_TO_BIN(?)`,
            [thesisId]
        ) as any[];
        if (thesisRows.length === 0) throw new Error("Thesis not found.");
        const thesis = thesisRows[0];
        const nim = thesis.nim;

        if (!thesis.proposal_title || thesis.proposal_title.trim() === '') {
            throw new Error("Judul proposal belum ditentukan. Mahasiswa wajib menentukan judul proposal terlebih dahulu.");
        }

        if (thesis.proposal_status !== 'approved') {
            throw new Error("Proposal kamu wajib disetujui oleh dosen pembimbing terlebih dahulu.");
        }

        const attendances = await getSeminarAttendances(nim);
        if (attendances.total < MIN_SEMINAR_ATTENDANCE) {
            throw new Error(`kamu belum menghadiri seminar (proposal/hasil) sebanyak minimal ${MIN_SEMINAR_ATTENDANCE} kali`);
        }

        const [lecturers] = await db.execute(
            `SELECT lecturer_nip, role FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?)`, [thesisId]
        ) as any[];

        if (lecturers.length === 0) {
            throw new Error("Belum ada dosen pembimbing/penguji yang ditugaskan.");
        }

        // Check for existing pending/approved/pending_approval request
        const [existing] = await db.execute(
            "SELECT id FROM seminar_proposal WHERE thesis_id = UUID_TO_BIN(?) AND status IN ('pending_approval', 'pending_schedule', 'approved')",
            [thesisId]
        ) as any[];

        if (existing.length > 0) {
            throw new Error("Anda sudah memiliki permohonan seminar proposal yang sedang diproses.");
        }

        const seminarId = uuidv7();

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {


            // 2. Insert seminar_proposal
            await connection.execute(
                `INSERT INTO seminar_proposal (id, thesis_id, status) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), 'pending_schedule')`,
                [seminarId, thesisId]
            );

            // 3. Insert approvals for ALL lecturers
            for (const lec of lecturers) {
                await connection.execute(
                    `INSERT INTO seminar_proposal_approval (seminar_proposal_id, lecturer_nip, status, assigned_role) VALUES (UUID_TO_BIN(?), ?, 'pending', ?)`,
                    [seminarId, lec.lecturer_nip, lec.role]
                );
            }

            await logStudentActivity(nim, "SEMINAR_PROPOSAL", "Meminta permohonan seminar proposal");

            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        // removed old file handling logic

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Request seminar error:", error);
        return { error: error.message || "Gagal mengajukan seminar proposal." };
    }
}

export async function requestSeminarHasil(thesisId: string) {
    try {
        const [thesisRows] = await db.execute("SELECT nim, title FROM thesis WHERE id = UUID_TO_BIN(?)", [thesisId]) as any[];
        if (thesisRows.length === 0) throw new Error("Thesis not found.");
        const thesis = thesisRows[0];
        const nim = thesis.nim;

        if (!thesis.title || thesis.title.trim() === '') {
            throw new Error("Judul skripsi belum ditentukan. Mahasiswa wajib menentukan judul skripsinya terlebih dahulu.");
        }

        const attendances = await getSeminarAttendances(nim);
        if (attendances.total < MIN_SEMINAR_ATTENDANCE) {
            throw new Error(`kamu belum menghadiri seminar (proposal/hasil) sebanyak minimal ${MIN_SEMINAR_ATTENDANCE} kali`);
        }

        const [lecturers] = await db.execute(
            `SELECT lecturer_nip, role FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?)`, [thesisId]
        ) as any[];

        if (lecturers.length === 0) {
            throw new Error("Belum ada dosen pembimbing/penguji yang ditugaskan.");
        }

        // Check for existing pending_approval/pending/approved request
        const [existing] = await db.execute(
            "SELECT id FROM seminar_hasil WHERE thesis_id = UUID_TO_BIN(?) AND status IN ('pending_approval', 'pending_schedule', 'approved')",
            [thesisId]
        ) as any[];

        if (existing.length > 0) {
            throw new Error("Anda sudah memiliki permohonan seminar hasil yang sedang diproses.");
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const seminarId = uuidv7();
            
            await connection.execute(
                `INSERT INTO seminar_hasil (id, thesis_id, status) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), 'pending_schedule')`,
                [seminarId, thesisId]
            );

            for (const lec of lecturers) {
                await connection.execute(
                    `INSERT INTO seminar_hasil_approval (seminar_hasil_id, lecturer_nip, status, assigned_role) VALUES (UUID_TO_BIN(?), ?, 'pending', ?)`,
                    [seminarId, lec.lecturer_nip, lec.role]
                );
            }
            
            await logStudentActivity(nim, "SEMINAR_HASIL", "Meminta permohonan seminar hasil");
            
            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Request seminar hasil error:", error);
        return { error: error.message || "Gagal mengajukan seminar hasil." };
    }
}

export async function uploadSuratPermohonanPendadaranAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return { error: "Unauthorized" };
    }

    const nim = session.user.username;
    const file = formData.get("file") as File | null;
    const thesisId = formData.get("thesisId") as string | null;

    if (!file || !thesisId) {
        return { error: "File atau Thesis ID tidak ditemukan" };
    }

    if (file.size > 3 * 1024 * 1024) {
        return { error: "Ukuran file melebihi batas maksimal 3MB" };
    }

    if (file.type !== "application/pdf") {
        return { error: "Format file wajib PDF" };
    }

    try {
        const [pendadarans] = await db.execute(
            `SELECT BIN_TO_UUID(id) as id, status, surat_permohonan_pendadaran_url FROM pendadaran WHERE thesis_id = UUID_TO_BIN(?) ORDER BY created_at DESC LIMIT 1`,
            [thesisId]
        ) as any[];

        const latest = pendadarans.length > 0 ? pendadarans[0] : null;

        if (!latest || (latest.status !== 'pending_document' && !(latest.status === 'rejected' && latest.surat_permohonan_pendadaran_url))) {
            return { error: "Permohonan sidang skripsi tidak dalam status menunggu upload atau perbaikan surat permohonan." };
        }

        const timestamp = Date.now();
        const filename = `document/surat_permohonan_pendadaran_${nim}_${timestamp}.pdf`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await put(filename, buffer, {
            access: "private",
            allowOverwrite: true,
        });
        const dbUrl = `/api/uploaded/${filename}`;

        await db.execute(
            `UPDATE pendadaran SET surat_permohonan_pendadaran_url = ?, status = 'pending_staff_approval' WHERE id = UUID_TO_BIN(?)`,
            [dbUrl, latest.id]
        );

        await logStudentActivity(nim, "SIDANG_SKRIPSI", "Mengupload surat permohonan ujian akhir");

        revalidatePath("/dashboard");
        return { success: true, filePath: dbUrl };
    } catch (error: any) {
        console.error("Upload surat permohonan pendadaran error:", error);
        return { error: error.message || "Gagal mengupload dokumen" };
    }
}

export async function requestPendadaran(nim: string) {
    try {
        const [theses] = await db.execute(
            "SELECT BIN_TO_UUID(id) as id, title FROM thesis WHERE nim = ? AND progress = 'pendadaran'", [nim]
        ) as any[];

        if (theses.length === 0) {
            throw new Error("Mahasiswa belum dalam tahap sidang skripsi.");
        }
        const thesis = theses[0];
        const thesisId = thesis.id;

        if (!thesis.title || thesis.title.trim() === '') {
            throw new Error("Judul skripsi belum ditentukan. Mahasiswa wajib menentukan judul skripsinya terlebih dahulu.");
        }

        const [lecturers] = await db.execute(
            `SELECT lecturer_nip, role FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?)`, [thesisId]
        ) as any[];

        if (lecturers.length === 0) {
            throw new Error("Belum ada dosen pembimbing/penguji yang ditugaskan.");
        }

        const [existing] = await db.execute(
            "SELECT id FROM pendadaran WHERE thesis_id = UUID_TO_BIN(?) AND status IN ('pending_schedule', 'pending_approval', 'pending_document', 'pending_staff_approval', 'approved')", [thesisId]
        ) as any[];

        if (existing.length > 0) {
            throw new Error("Anda sudah memiliki permintaan sidang skripsi yang sedang diproses atau terjadwalkan.");
        }

        const seminarId = uuidv7();

        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            await connection.execute(
                "INSERT INTO pendadaran (id, thesis_id, status, created_at) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), 'pending_schedule', CURRENT_TIMESTAMP)",
                [seminarId, thesisId]
            );

            for (const lec of lecturers) {
                await connection.execute(
                    `INSERT INTO pendadaran_approval (pendadaran_id, lecturer_nip, status, assigned_role) VALUES (UUID_TO_BIN(?), ?, 'pending', ?)`,
                    [seminarId, lec.lecturer_nip, lec.role]
                );
            }
            
            await logStudentActivity(nim, "SIDANG_SKRIPSI", "Meminta permohonan sidang skripsi");
            
            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Request pendadaran error:", error);
        return { error: error.message || "Gagal mengajukan sidang skripsi." };
    }
}

export async function registerAsSpectator(seminarId: string, type: 'proposal' | 'hasil') {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");

    const nim = session.user.username;

    try {
        const [existing] = await db.execute(
            "SELECT id FROM seminar_attendance WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = ? AND student_nim = ?",
            [seminarId, type, nim]
        ) as any[];

        if (existing.length > 0) {
            return { error: "Anda sudah mendaftar sebagai penonton di seminar ini." };
        }

        await db.execute(
            "INSERT INTO seminar_attendance (seminar_id, seminar_type, student_nim, status) VALUES (UUID_TO_BIN(?), ?, ?, 'terdaftar')",
            [seminarId, type, nim]
        );

        const path = type === 'proposal' ? `/seminar-proposal/${seminarId}` : `/seminar-hasil/${seminarId}`;
        revalidatePath(path);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Register spectator error:", error);
        return { error: error.message || "Gagal mendaftar sebagai penonton." };
    }
}

export async function submitAttendance(
    seminarId: string, 
    type: 'proposal' | 'hasil', 
    token: string, 
    fingerprint: string, 
    deviceUuid?: string
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");

    const nim = session.user.username;
    const table = type === 'proposal' ? 'seminar_proposal' : 'seminar_hasil';

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Validate Token
        const [seminar] = await connection.execute(
            `SELECT current_qr_token FROM ${table} WHERE id = UUID_TO_BIN(?)`, [seminarId]
        ) as any[];

        if (seminar.length === 0 || seminar[0].current_qr_token !== token) {
            throw new Error("QR Code tidak valid atau sudah kadaluarsa. Silakan scan ulang QR Code terbaru.");
        }

        // 2. Validate Device Identity (Hybrid Device Identification)
        // A. Hard validation on persistent device UUID to prevent multiple accounts on the same browser/device
        if (deviceUuid) {
            const [usedUuid] = await connection.execute(
                "SELECT student_nim FROM seminar_attendance WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = ? AND device_uuid = ?",
                [seminarId, type, deviceUuid]
            ) as any[];

            if (usedUuid.length > 0 && usedUuid[0].student_nim !== nim) {
                throw new Error("Perangkat ini sudah digunakan untuk absen akun lain di seminar yang sama. (Jasa Titip Terdeteksi)");
            }
        }

        // B. Heuristic check on device fingerprint (auditing potential identical hardware / incognito bypass)
        let heuristicFlag = false;
        let flaggedNim: string | null = null;
        if (fingerprint) {
            const [usedFingerprint] = await connection.execute(
                "SELECT student_nim FROM seminar_attendance WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = ? AND device_fingerprint = ?",
                [seminarId, type, fingerprint]
            ) as any[];

            if (usedFingerprint.length > 0 && usedFingerprint[0].student_nim !== nim) {
                heuristicFlag = true;
                flaggedNim = usedFingerprint[0].student_nim;
            }
        }

        // 3. Check if registered
        const [attendance] = await connection.execute(
            "SELECT id, status FROM seminar_attendance WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = ? AND student_nim = ?",
            [seminarId, type, nim]
        ) as any[];

        if (attendance.length === 0) {
            // Auto register and mark as attended
            await connection.execute(
                "INSERT INTO seminar_attendance (seminar_id, seminar_type, student_nim, status, device_uuid, device_fingerprint) VALUES (UUID_TO_BIN(?), ?, ?, 'menghadiri', ?, ?)",
                [seminarId, type, nim, deviceUuid || null, fingerprint || null]
            );
        } else {
            if (attendance[0].status === 'menghadiri') {
                throw new Error("Anda sudah tercatat hadir.");
            }

            // 4. Update attendance
            await connection.execute(
                "UPDATE seminar_attendance SET status = 'menghadiri', device_uuid = ?, device_fingerprint = ? WHERE id = ?",
                [deviceUuid || null, fingerprint || null, attendance[0].id]
            );
        }

        // 5. Invalidate token
        await connection.execute(`UPDATE ${table} SET current_qr_token = NULL WHERE id = UUID_TO_BIN(?)`, [seminarId]);

        if (type === 'proposal') {
            await logStudentActivity(nim, "SEMINAR_PROPOSAL", "Menghadiri seminar proposal");
        } else if (type === 'hasil') {
            await logStudentActivity(nim, "SEMINAR_HASIL", "Menghadiri seminar hasil");
        }

        // Record audit trail if fingerprint matched another student (heuristic notice)
        if (heuristicFlag && flaggedNim) {
            console.warn(
                `[AUDIT_TRAIL] Mahasiswa ${nim} presensi dengan profil perangkat serupa dengan NIM ${flaggedNim} pada seminar ${seminarId} (indikasi model gawai sejenis atau mode penyamaran).`
            );
        }

        await connection.commit();
        const path = type === 'proposal' ? `/seminar-proposal/${seminarId}` : `/seminar-hasil/${seminarId}`;
        revalidatePath(path);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Submit attendance error:", error);
        return { error: error.message || "Gagal mencatat kehadiran." };
    } finally {
        connection.release();
    }
}

export async function getQrTokenAction(seminarId: string, type: 'proposal' | 'hasil') {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");
    
    const { getCurrentQrToken } = await import("@/lib/dal/seminar");
    return await getCurrentQrToken(seminarId, type);
}

export async function getSpectatorStatusAction(seminarId: string, type: 'proposal' | 'hasil') {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) return null;
    const nim = session.user.username;

    const [rows] = await db.execute(
        "SELECT status FROM seminar_attendance WHERE seminar_id = UUID_TO_BIN(?) AND seminar_type = ? AND student_nim = ?",
        [seminarId, type, nim]
    ) as any[];

    if (rows.length === 0) return null;
    return rows[0].status as 'terdaftar' | 'menghadiri';
}

export async function submitLecturerScore(seminarId: string, type: 'proposal' | 'hasil' | 'pendadaran', score: number) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");

    if (isNaN(score) || score < 0 || score > 100) {
        throw new Error("Skor harus berada dalam rentang 0 hingga 100.");
    }

    const lecturerNip = session.user.username;
    let scoreTable = 'seminar_proposal_lecturer_score';
    let mainTable = 'seminar_proposal';
    if (type === 'hasil') {
        scoreTable = 'seminar_hasil_lecturer_score';
        mainTable = 'seminar_hasil';
    } else if (type === 'pendadaran') {
        scoreTable = 'pendadaran_lecturer_score';
        mainTable = 'pendadaran';
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [statusCheck] = await connection.execute(
            `SELECT status FROM ${mainTable} WHERE id = UUID_TO_BIN(?)`,
            [seminarId]
        ) as any[];

        if (statusCheck.length > 0 && statusCheck[0].status !== 'approved') {
            throw new Error("Seminar telah ditandai selesai. Penilaian sudah dikunci dan tidak dapat diubah lagi.");
        }

        await connection.execute(
            `INSERT INTO ${scoreTable} (id, seminar_id, lecturer_nip, score) 
             VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?, ?)
             ON CONFLICT (seminar_id, lecturer_nip) DO UPDATE SET score = EXCLUDED.score, updated_at = CURRENT_TIMESTAMP`,
            [seminarId, lecturerNip, score]
        );

        const [allScores] = await connection.execute(
            `SELECT score FROM ${scoreTable} WHERE seminar_id = UUID_TO_BIN(?)`,
            [seminarId]
        ) as any[];

        const validScores = allScores.map((r: any) => Number(r.score)).filter((s: number) => !isNaN(s));
        if (validScores.length > 0) {
            const avgScore = Math.round(validScores.reduce((acc: number, curr: number) => acc + curr, 0) / validScores.length);
            await connection.execute(
                `UPDATE ${mainTable} SET score = ? WHERE id = UUID_TO_BIN(?)`,
                [avgScore, seminarId]
            );
        }

        await connection.commit();
        const detailSlug = type === 'proposal' ? 'seminar-proposal' : type === 'hasil' ? 'seminar-hasil' : 'sidang-skripsi';
        revalidatePath(`/${detailSlug}/${seminarId}`);
        return { success: true };
    } catch (error: any) {
        await connection.rollback();
        console.error("Submit lecturer score error:", error);
        return { error: error.message || "Gagal menyimpan skor penilaian." };
    } finally {
        connection.release();
    }
}

export async function markSeminarCompleted(seminarId: string, type: 'proposal' | 'hasil' | 'pendadaran') {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.username) throw new Error("Unauthorized");
    const nim = session.user.username;

    let mainTable = 'seminar_proposal';
    let scoreTable = 'seminar_proposal_lecturer_score';
    let nextProgress = 'penelitian';
    if (type === 'hasil') {
        mainTable = 'seminar_hasil';
        scoreTable = 'seminar_hasil_lecturer_score';
        nextProgress = 'pendadaran';
    } else if (type === 'pendadaran') {
        mainTable = 'pendadaran';
        scoreTable = 'pendadaran_lecturer_score';
        nextProgress = 'lulus';
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [rows] = await connection.execute(
            `SELECT BIN_TO_UUID(s.id) as id, s.status, BIN_TO_UUID(s.thesis_id) as thesis_id
             FROM ${mainTable} s
             JOIN thesis t ON s.thesis_id = t.id
             WHERE s.id = UUID_TO_BIN(?) AND t.nim = ?`,
            [seminarId, nim]
        ) as any[];

        if (rows.length === 0) {
            throw new Error("Seminar tidak ditemukan atau Anda tidak berhak mengakses seminar ini.");
        }

        const seminar = rows[0];
        if (seminar.status !== 'approved') {
            throw new Error("Seminar ini tidak sedang berlangsung atau sudah ditandai selesai.");
        }

        const [scoreRows] = await connection.execute(
            `SELECT score FROM ${scoreTable} WHERE seminar_id = UUID_TO_BIN(?)`,
            [seminarId]
        ) as any[];

        const validScores = scoreRows.map((r: any) => Number(r.score)).filter((s: number) => !isNaN(s));
        let avgScore: number | null = null;
        if (validScores.length > 0) {
            avgScore = Math.round(validScores.reduce((acc: number, curr: number) => acc + curr, 0) / validScores.length);
        }

        const { MIN_PASSING_SCORE } = await import("@/lib/constants/scoring");
        const isPassed = avgScore !== null && avgScore > MIN_PASSING_SCORE;
        const newStatus = isPassed ? 'pass' : 'fail';

        await connection.execute(
            `UPDATE ${mainTable} SET status = ?, score = ? WHERE id = UUID_TO_BIN(?)`,
            [newStatus, avgScore, seminarId]
        );

        if (isPassed && seminar.thesis_id) {
            await connection.execute(
                `UPDATE thesis SET progress = ? WHERE id = UUID_TO_BIN(?)`,
                [nextProgress, seminar.thesis_id]
            );
            await connection.execute(
                `INSERT INTO thesis_progress_history (thesis_id, to_progress) VALUES (UUID_TO_BIN(?), ?)`,
                [seminar.thesis_id, nextProgress]
            );
            revalidatePath(`/skripsi/${seminar.thesis_id}`);
        }

        await connection.commit();

        if (type === 'proposal') {
            await logStudentActivity(nim, "SEMINAR_PROPOSAL", "Melaksanakan seminar proposal");
        } else if (type === 'hasil') {
            await logStudentActivity(nim, "SEMINAR_HASIL", "Melaksanakan seminar hasil");
        } else if (type === 'pendadaran') {
            await logStudentActivity(nim, "SIDANG_SKRIPSI", "Melaksanakan sidang skripsi");
        }

        revalidatePath("/dashboard");
        const pathSlug = type === 'proposal' ? 'seminar-proposal' : type === 'hasil' ? 'seminar-hasil' : 'sidang-skripsi';
        revalidatePath(`/${pathSlug}/${seminarId}`);

        return { success: true, status: newStatus, score: avgScore };
    } catch (error: any) {
        await connection.rollback();
        console.error("Mark seminar completed error:", error);
        return { error: error.message || "Gagal menyelesaikan seminar." };
    } finally {
        connection.release();
    }
}
