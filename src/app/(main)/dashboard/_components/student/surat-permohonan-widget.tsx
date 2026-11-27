"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/base/button";
import { FileText, Upload, Download, CheckCircle2, Loader2, ExternalLink, RefreshCw, ChevronRight } from "lucide-react";
import { uploadSuratPermohonanPendadaranAction } from "@/lib/actions/seminar";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/base/dialog";

interface SuratPermohonanWidgetProps {
    thesisId: string;
    currentUrl?: string | null;
    disabled?: boolean;
}

export function SuratPermohonanWidget({ thesisId, currentUrl, disabled = false }: SuratPermohonanWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (disabled || !thesisId) return;

        if (file.type !== "application/pdf") {
            toast.error("Hanya file PDF yang diperbolehkan.");
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            toast.error("Ukuran file melebihi batas maksimal 3MB.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("thesisId", thesisId);

        const result = await uploadSuratPermohonanPendadaranAction(formData);
        
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Surat Permohonan Ujian Akhir berhasil diupload!");
        }
        
        setIsUploading(false);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const templateLink = "https://docs.google.com/document/d/1V3i9lGHOpBIgOeOaKy9eqRxM2lHp1V_u/edit";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button 
                    type="button"
                    className="w-full text-left focus:outline-none group outline-none"
                >
                    <div className="border border-border/60 rounded-xl bg-card hover:bg-muted/30 transition-all p-4 flex items-center justify-between gap-4 shadow-sm group-hover:border-primary/30 group-hover:shadow-md">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                                    Surat Permohonan Ujian Akhir
                                </h4>
                                {currentUrl ? (
                                    <div className="flex items-center gap-1.5 mt-0.5 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                        <p className="text-xs font-medium truncate">
                                            Dokumen telah diupload
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Klik untuk mengupload Surat Permohonan Ujian Akhir.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </div>
                </button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Surat Permohonan Ujian Akhir
                    </DialogTitle>
                    <DialogDescription>
                        Silakan unduh template dokumen, isi dengan data yang benar, lalu upload dalam format PDF.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    <div className="flex justify-center">
                        <a 
                            href={templateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0 outline-none w-full sm:w-auto"
                        >
                            <Download className="h-4 w-4" />
                            <span>Unduh Template Google Docs</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-70 ml-1" />
                        </a>
                    </div>

                    <div className="relative border-t border-border/40 pt-5">
                        {currentUrl ? (
                            <div className="flex flex-col items-center justify-center gap-4 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                        Dokumen Telah Diupload
                                    </h5>
                                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-mono break-all max-w-[250px] mx-auto">
                                        {currentUrl.split('/').pop()}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
                                    <a 
                                        href={currentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Buka Dokumen</span>
                                    </a>

                                    {!disabled && (
                                        <>
                                            <input 
                                                type="file" 
                                                accept="application/pdf"
                                                className="hidden" 
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFile(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="h-8"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                                ) : (
                                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                                )}
                                                <span>{isUploading ? "Mengupload..." : "Ganti File"}</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div 
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                                    dragActive 
                                        ? "border-primary bg-primary/5 scale-[0.99]" 
                                        : "border-border/60 bg-muted/20 hover:bg-muted/40"
                                } ${isUploading || disabled ? "opacity-60 pointer-events-none" : ""}`}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                            >
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFile(e.target.files[0]);
                                        }
                                    }}
                                />

                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="p-4 bg-card rounded-full shadow-sm border border-border/50 text-primary">
                                        {isUploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        ) : (
                                            <Upload className="h-8 w-8" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            {isUploading ? "Mengupload dokumen..." : "Klik untuk memilih file PDF atau drag and drop kesini"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1.5">
                                            Maksimal ukuran file 3MB
                                        </p>
                                    </div>

                                    {!disabled && !isUploading && (
                                        <Button 
                                            type="button"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-2 bg-card hover:bg-muted text-foreground border border-border/60 font-bold text-xs px-6 rounded-lg shadow-sm"
                                        >
                                            Pilih File
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
