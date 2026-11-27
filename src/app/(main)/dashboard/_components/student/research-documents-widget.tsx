"use client"

import React from "react"
import { motion } from "framer-motion"
import { FileText, FileCheck, FileSpreadsheet, UserCheck, Download } from "lucide-react"

interface Props {
    documents: Record<string, string>
}

interface DocumentMeta {
    key: string;
    title: string;
    description: string;
    icon: typeof FileText;
    iconColor: string;
    iconBg: string;
    borderColor: string;
}

const DOCUMENT_METADATA: DocumentMeta[] = [
    {
        key: "surat_rekomendasi_penelitian",
        title: "Surat Rekomendasi Penelitian",
        description: "Template surat rekomendasi resmi untuk pelaksanaan penelitian.",
        icon: FileText,
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-500/10",
        borderColor: "hover:border-blue-500/30 dark:hover:border-blue-500/30",
    },
    {
        key: "surat_pengantar_penelitian_skripsi",
        title: "Surat Pengantar Penelitian Skripsi",
        description: "Template surat pengantar penelitian ke instansi atau lembaga tujuan.",
        icon: FileCheck,
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-500/10",
        borderColor: "hover:border-emerald-500/30 dark:hover:border-emerald-500/30",
    },
    {
        key: "surat_pengantar_observasi_penelitian_skripsi",
        title: "Surat Pengantar Observasi Penelitian",
        description: "Template surat pengantar untuk pengambilan data awal dan observasi.",
        icon: FileSpreadsheet,
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-500/10",
        borderColor: "hover:border-amber-500/30 dark:hover:border-amber-500/30",
    },
    {
        key: "surat_permohonan_validator",
        title: "Surat Permohonan Validator",
        description: "Template surat permohonan kepada dosen atau praktisi sebagai validator instrumen.",
        icon: UserCheck,
        iconColor: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-500/10",
        borderColor: "hover:border-purple-500/30 dark:hover:border-purple-500/30",
    },
];

export default function ResearchDocumentsWidget({ documents }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                    Unduh template resmi administrasi penelitian di bawah ini. Anda dapat mendownloadnya dalam format Word (.docx) melalui menu <span className="font-semibold text-foreground">File &gt; Download</span> di Google Docs.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCUMENT_METADATA.map((meta, index) => {
                    const url = documents[meta.key];
                    const Icon = meta.icon;

                    return (
                        <motion.div
                            key={meta.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.08 }}
                            className={`group relative flex flex-col justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-muted/30 transition-all duration-200 shadow-2xs hover:shadow-sm ${meta.borderColor}`}
                        >
                            <div className="flex items-start gap-3.5 mb-4">
                                <div className={`p-2.5 rounded-xl ${meta.iconBg} ${meta.iconColor} shrink-0 transition-transform group-hover:scale-105`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="text-sm font-bold font-heading leading-snug text-foreground group-hover:text-primary transition-colors">
                                        {meta.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {meta.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border/40 flex items-center justify-end">
                                {url ? (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 group/btn"
                                    >
                                        <span>Unduh Template</span>
                                        <Download className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-y-0.5" />
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground/60 cursor-not-allowed">
                                        <span>Belum Tersedia</span>
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
