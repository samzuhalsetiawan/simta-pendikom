"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { fetchPDFData } from "@/lib/actions/pdf";
import type { EventType } from "@/lib/dal/pdf";
import SuratPersetujuanSeminarProposal from "@/components/pdf/surat-persetujuan-seminar-proposal";
import SuratPersetujuanSeminarHasil from "@/components/pdf/surat-persetujuan-seminar-hasil";
import SuratPersetujuanSidangSkripsi from "@/components/pdf/surat-persetujuan-sidang-skripsi";

const EVENT_LABELS: Record<EventType, { label: string; filePrefix: string }> = {
    seminar_proposal: { label: "Surat Persetujuan Sempro", filePrefix: "Surat_Persetujuan_Sempro" },
    seminar_hasil: { label: "Surat Persetujuan Semhas", filePrefix: "Surat_Persetujuan_Semhas" },
    pendadaran: { label: "Surat Persetujuan Sidang Skripsi", filePrefix: "Surat_Persetujuan_Sidang_Skripsi" },
};

interface DownloadPDFButtonProps {
    thesisId: string;
    eventType: EventType;
}

export default function DownloadPDFButton({ thesisId, eventType }: DownloadPDFButtonProps) {
    const [loading, setLoading] = useState(false);
    const config = EVENT_LABELS[eventType];

    const handleDownload = async () => {
        setLoading(true);
        try {
            const result = await fetchPDFData(thesisId, eventType);

            if (result.error || !result.data) {
                toast.error(result.error || "Gagal mengambil data PDF.");
                return;
            }

            const data = result.data as any;

            let doc;
            switch (eventType) {
                case 'seminar_proposal':
                    doc = <SuratPersetujuanSeminarProposal data={data} />;
                    break;
                case 'seminar_hasil':
                    doc = <SuratPersetujuanSeminarHasil data={data} />;
                    break;
                case 'pendadaran':
                    doc = <SuratPersetujuanSidangSkripsi data={data} />;
                    break;
            }

            const blob = await pdf(doc).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${config.filePrefix}_${data.studentNim}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("PDF berhasil didownload!");
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Terjadi kesalahan saat membuat PDF.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={loading}
            variant="outline"
            className="w-full h-10 rounded-xl font-bold text-xs gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary/90"
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Download className="h-3.5 w-3.5" />
            )}
            {loading ? "Membuat PDF..." : `Download ${config.label}`}
        </Button>
    );
}
