"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { v7 as uuidv7 } from "uuid";
import { logStudentActivity } from "./activity";

export async function updateThesisData(nim: string, data: { title: string, research_type: string, research_method: string }) {
    const allowedResearchTypes = ["kualitatif", "kuantitatif", "campuran", "pengembangan"];
    
    if (!allowedResearchTypes.includes(data.research_type)) {
        return { error: "Jenis penelitian tidak valid." };
    }

    try {
        await db.execute(
            `UPDATE thesis SET title = ?, research_type = ?, research_method = ? WHERE nim = ?`,
            [data.title, data.research_type, data.research_method, nim]
        );
        
        await logStudentActivity(nim, "SKRIPSI", "Merubah judul skripsi");
        await logStudentActivity(nim, "SKRIPSI", "Merubah jenis penelitian skripsi");
        await logStudentActivity(nim, "SKRIPSI", "Merubah metode penelitian skripsi");

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Update thesis error:", error);
        return { error: "Gagal memperbarui data skripsi." };
    }
}

export async function bulkAssignLecturers(nim: string, assignments: { nip: string, role: 'supervisor' | 'examiner', position: number }[]) {
    const [theses] = await db.execute('SELECT BIN_TO_UUID(id) as id FROM thesis WHERE nim = ?', [nim]) as any[];
    let thesisId: string;

    if (theses.length === 0) {
        thesisId = uuidv7();
        await db.execute(
            'INSERT INTO thesis (id, nim, progress, proposal_approval_status) VALUES (UUID_TO_BIN(?), ?, ?, ?)', 
            [thesisId, nim, 'pengajuan_proposal', 'unrequested']
        );
    } else {
        thesisId = theses[0].id;
    }

    const nips = assignments.map(a => a.nip);
    if (nips.length !== new Set(nips).size) {
        return { error: 'Dosen yang sama tidak boleh ditugaskan lebih dari satu peran untuk mahasiswa yang sama.' };
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        await connection.execute('DELETE FROM thesis_lecturer WHERE thesis_id = UUID_TO_BIN(?)', [thesisId]);
        for (const item of assignments) {
            await connection.execute(
                'INSERT INTO thesis_lecturer (thesis_id, lecturer_nip, role, position) VALUES (UUID_TO_BIN(?), ?, ?, ?)',
                [thesisId, item.nip, item.role, item.position]
            );
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error('Bulk assign error:', error);
        return { error: 'Terjadi kesalahan saat menyimpan penugasan dosen.' };
    } finally {
        connection.release();
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/thesis-assignment');
    return { success: true };
}

import fs from "fs/promises";
import path from "path";

export async function uploadThesisPdf(thesisId: string, formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    if (file.type !== "application/pdf") {
        return { error: "Only PDF files are allowed" };
    }

    try {
        const fileName = `document/skripsi_${thesisId}.pdf`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { put } = await import("@vercel/blob");
        await put(fileName, buffer, {
            access: "private",
            allowOverwrite: true,
        });

        const dbPath = `/api/uploaded/${fileName}`;
        await db.execute(
            'UPDATE thesis SET thesis_url = ? WHERE id = UUID_TO_BIN(?)',
            [dbPath, thesisId]
        );

        // Fetch NIM to log activity
        const [thesisRows] = await db.execute('SELECT nim FROM thesis WHERE id = UUID_TO_BIN(?)', [thesisId]) as any[];
        if (thesisRows.length > 0) {
            await logStudentActivity(thesisRows[0].nim, "SKRIPSI", "Upload file skripsi");
        }

        revalidatePath(`/skripsi/${thesisId}`);
        return { success: true };
    } catch (error) {
        console.error("Upload error:", error);
        return { error: "Gagal mengupload file skripsi" };
    }
}

