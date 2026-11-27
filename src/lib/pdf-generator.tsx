import { renderToFile } from '@react-pdf/renderer';
import path from "path";
import fs from "fs/promises";
import { v7 as uuidv7 } from "uuid";
import { db } from "@/lib/db";
import React from 'react';
import SuratPersetujuanSeminarProposal from "@/components/pdf/surat-persetujuan-seminar-proposal";
import SuratPersetujuanSeminarHasil from "@/components/pdf/surat-persetujuan-seminar-hasil";
import SuratPersetujuanSidangSkripsi from "@/components/pdf/surat-persetujuan-sidang-skripsi";

export type SeminarType = 'seminar_proposal' | 'seminar_hasil' | 'pendadaran';

export async function generateAndSaveSuratPersetujuan(
    seminarId: number,
    type: SeminarType,
    nim: string,
    data: any, // The specific SuratPersetujuan data type
    docIdToUpdate?: string
): Promise<string> { // Returns document UUID
    const docId = docIdToUpdate || uuidv7();
    const fileName = `${docId}.pdf`;
    const uploadDir = path.join(process.cwd(), "uploaded", "document");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    const dbPath = `/api/uploaded/document/${fileName}`;

    let element;
    let docType = '';
    let title = '';

    if (type === 'seminar_proposal') {
        element = <SuratPersetujuanSeminarProposal data={data} />;
        docType = 'surat_persetujuan_seminar_proposal';
        title = `Surat Persetujuan Seminar Proposal - ${nim}`;
    } else if (type === 'seminar_hasil') {
        element = <SuratPersetujuanSeminarHasil data={data} />;
        docType = 'surat_persetujuan_seminar_hasil';
        title = `Surat Persetujuan Seminar Hasil - ${nim}`;
    } else if (type === 'pendadaran') {
        element = <SuratPersetujuanSidangSkripsi data={data} />;
        docType = 'surat_persetujuan_pendadaran';
        title = `Surat Persetujuan Sidang Skripsi - ${nim}`;
    }

    if (!element) throw new Error("Invalid seminar type for PDF generation");

    await renderToFile(element, filePath);

    if (!docIdToUpdate) {
        await db.execute(
            `INSERT INTO document (id, type, file_path, title, uploader_nim) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?)`,
            [docId, docType, dbPath, title, nim]
        );
    }

    return docId;
}
