import { renderToBuffer } from '@react-pdf/renderer';
import { put } from "@vercel/blob";
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
    const fileName = `document/${docId}.pdf`;

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

    const pdfBuffer = await renderToBuffer(element);
    const blob = await put(fileName, pdfBuffer, {
        access: "public",
        allowOverwrite: true,
    });

    if (!docIdToUpdate) {
        await db.query(
            `INSERT INTO document (id, type, file_path, title, uploader_nim) VALUES ($1, $2, $3, $4, $5)`,
            [Buffer.from(docId.replace(/-/g, ''), 'hex'), docType, blob.url, title, nim]
        );
    }

    return docId;
}
