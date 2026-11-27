"use client"

import { useState, useRef, useEffect } from "react"
import { uploadThesisPdf } from "@/lib/actions/thesis"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/base/dialog"
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card"
import { Lock, ShieldAlert } from "lucide-react"

interface SharedPdfPreviewProps {
    title: string;
    url: string | null;
    isUploadable?: boolean;
    uploadAction?: (formData: FormData) => Promise<{error?: string, success?: boolean}>;
    thesisId?: string;
    isOwner?: boolean;
    emptyMessage?: string;
    variant?: "lulus" | "pengajuan-proposal" | "seminar-proposal" | "konsultasi" | "penelitian" | "seminar-hasil" | "sidang-skripsi";
    subtitle?: React.ReactNode;
}

export function SharedPdfPreview({ 
    title, 
    url, 
    isUploadable = false,
    uploadAction,
    thesisId, 
    isOwner = false,
    emptyMessage = "Belum ada dokumen yang diupload",
    variant = "lulus",
    subtitle = "File dokumen tugas akhir"
}: SharedPdfPreviewProps) {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isPrivateDoc, setIsPrivateDoc] = useState(false)

    useEffect(() => {
        if (!url) {
            setIsPrivateDoc(false)
            return
        }

        let isCancelled = false
        fetch(url, { method: "HEAD" })
            .then((res) => {
                if (!isCancelled) {
                    if (res.status === 403 || res.status === 401) {
                        setIsPrivateDoc(true)
                    } else {
                        setIsPrivateDoc(false)
                    }
                }
            })
            .catch(() => {
                // If HEAD fails, keep default behavior
            })

        return () => {
            isCancelled = true
        }
    }, [url])

    const pdfContainerRef = useRef<HTMLDivElement>(null)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && pdfContainerRef.current) {
            pdfContainerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`)
            })
        } else if (document.fullscreenElement) {
            document.exitFullscreen()
        }
    }

    const handleFile = async (file: File) => {
        if (!isUploadable) return;
        if (!uploadAction && !thesisId) return; // Need at least one

        if (file.type !== "application/pdf") {
            setError("Hanya file PDF yang diperbolehkan.")
            return
        }

        setError(null)
        setIsUploading(true)

        const formData = new FormData()
        formData.append("file", file)

        let result;
        if (uploadAction) {
            result = await uploadAction(formData);
        } else if (thesisId) {
            result = await uploadThesisPdf(thesisId, formData)
        }
        
        if (result?.error) {
            setError(result.error)
        } else {
            setIsModalOpen(false)
            router.refresh()
        }
        
        setIsUploading(false)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const UploaderArea = ({ isReplacement = false }: { isReplacement?: boolean }) => (
        <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border/50 bg-muted/20 hover:bg-muted/40"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
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
                        handleFile(e.target.files[0])
                    }
                }}
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-card rounded-full">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {isUploading ? "Mengupload..." : "Klik untuk memilih file PDF atau drag and drop kesini"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Maksimal ukuran file disesuaikan dengan limit server.</p>
                </div>

                {isReplacement && !isUploading && (
                    <div className="bg-amber-500/10 text-amber-600 p-3 rounded-xl text-xs border border-amber-500/20 mt-2 max-w-sm">
                        <p className="font-semibold mb-1">Perhatian!</p>
                        <p>Mengupload file baru akan menimpa file skripsi lama yang telah tersimpan di server.</p>
                    </div>
                )}

                <button 
                    onClick={(e) => {
                        e.preventDefault()
                        fileInputRef.current?.click()
                    }}
                    disabled={isUploading}
                    className="mt-2 px-4 py-2 bg-card border border-border/50 text-sm font-medium text-foreground rounded-xl hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    Pilih File
                </button>
            </div>
        </div>
    );

    return (
        <GradientCard variant={variant}>
            <GradientCardHeader variant={variant}>
                <div className="min-w-0 flex-1">
                    <GradientCardTitle className="truncate">{title}</GradientCardTitle>
                    {subtitle && <GradientCardDescription>{subtitle}</GradientCardDescription>}
                </div>
                {url && !isPrivateDoc && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button 
                                onClick={toggleFullscreen}
                                title="Fullscreen"
                                className="px-2 py-1.5 sm:px-3 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span className="hidden sm:inline">Fullscreen</span>
                            </button>
                            {isUploadable && isOwner && (
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    title="Upload"
                                    className="px-2 py-1.5 sm:px-3 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="hidden sm:inline">Upload</span>
                                </button>
                            )}
                            <a 
                                href={url}
                                download
                                title="Download"
                                className="px-2 py-1.5 sm:px-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="hidden sm:inline">Download</span>
                            </a>
                        </div>
                )}
            </GradientCardHeader>
            <div className="flex-1 flex flex-col">
                {error && (
                    <div className="p-5 pb-0">
                        <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20">
                            {error}
                        </div>
                    </div>
                )}

            {url ? (
                isPrivateDoc ? (
                    <div className="mx-5 my-8 p-8 border-2 border-dashed rounded-3xl border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-xs">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-foreground mb-1.5 font-heading">
                            Dokumen Bersifat Privat
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
                            Dokumen naskah tugas akhir ini hanya dapat diakses oleh mahasiswa pemilik tugas akhir serta Tim Dosen Pembimbing dan Dosen Penguji terkait.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-muted-foreground font-medium shadow-2xs">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                            <span>Akses Terbatas & Terlindungi</span>
                        </div>
                    </div>
                ) : (
                    <div ref={pdfContainerRef} className="w-full aspect-[1/1.4] bg-white border-t border-border/50">
                        <iframe 
                            src={`${url}#toolbar=0`} 
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    </div>
                )
            ) : (
                isUploadable && isOwner ? (
                    <div className="p-5 pt-0"><UploaderArea /></div>
                ) : (
                    <div className="mx-5 mb-5 h-64 border-2 border-dashed rounded-2xl border-border/50 flex flex-col items-center justify-center text-muted-foreground/50 bg-muted/20">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>{emptyMessage}</p>
                    </div>
                )
            )}

            {isUploadable && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Upload Dokumen Baru</DialogTitle>
                            <DialogDescription>
                                Pilih file PDF yang baru.
                            </DialogDescription>
                        </DialogHeader>
                        <UploaderArea isReplacement={true} />
                    </DialogContent>
                </Dialog>
            )}
            </div>
        </GradientCard>
    )
}
