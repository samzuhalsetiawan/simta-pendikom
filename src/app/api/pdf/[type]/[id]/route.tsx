import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import SuratPersetujuanProposal from "@/components/pdf/surat-persetujuan-proposal";
import SuratPersetujuanSeminarProposal from "@/components/pdf/surat-persetujuan-seminar-proposal";
import SuratPersetujuanSeminarHasil from "@/components/pdf/surat-persetujuan-seminar-hasil";
import SuratPersetujuanSidangSkripsi from "@/components/pdf/surat-persetujuan-sidang-skripsi";
import { getProposalPdfData } from "@/lib/dal/pdf-proposal";
import { getSeminarPdfData } from "@/lib/dal/pdf-seminar";

interface PdfRegistryItem {
    fetcher: (id: string) => Promise<any>;
    render: (data: any) => React.ReactElement;
    filenamePrefix: string;
}

const PDF_REGISTRY: Record<string, PdfRegistryItem> = {
    "proposal": {
        fetcher: (id) => getProposalPdfData(id),
        render: (data) => <SuratPersetujuanProposal data={data} />,
        filenamePrefix: "surat_persetujuan_proposal"
    },
    "seminar-proposal": {
        fetcher: (id) => getSeminarPdfData(id, 'seminar_proposal'),
        render: (data) => <SuratPersetujuanSeminarProposal data={data} />,
        filenamePrefix: "surat_persetujuan_seminar_proposal"
    },
    "seminar-hasil": {
        fetcher: (id) => getSeminarPdfData(id, 'seminar_hasil'),
        render: (data) => <SuratPersetujuanSeminarHasil data={data} />,
        filenamePrefix: "surat_persetujuan_seminar_hasil"
    },
    "sidang-skripsi": {
        fetcher: (id) => getSeminarPdfData(id, 'pendadaran'),
        render: (data) => <SuratPersetujuanSidangSkripsi data={data} />,
        filenamePrefix: "surat_persetujuan_sidang_skripsi"
    }
};

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await context.params;

    const registryItem = PDF_REGISTRY[type];
    if (!registryItem) {
        return new NextResponse("Invalid PDF Type", { status: 400 });
    }

    try {
        const data = await registryItem.fetcher(id);

        if (!data) {
            return new NextResponse(`${type.replace("-", " ")} Data Not Found`, { status: 404 });
        }

        const stream = await renderToStream(registryItem.render(data));

        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${registryItem.filenamePrefix}_${id}.pdf"`,
            },
        });
    } catch (error) {
        console.error(`PDF generation error for ${type}:`, error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
