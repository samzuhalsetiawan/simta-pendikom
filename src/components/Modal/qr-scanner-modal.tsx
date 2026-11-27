"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { X, Camera, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { toast } from "sonner";
import { verifyAndCompleteConsultation } from "@/lib/actions/consultation";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface QRScannerModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onScanSuccess?: (token: string) => Promise<any> | any;
    onAttend?: (token: string) => Promise<any> | any;
    loading?: boolean;
    error?: string | null;
    title?: string;
    description?: string;
    inline?: boolean;
}

export function QRScannerModal({
    open = false,
    onOpenChange = () => {},
    onScanSuccess,
    onAttend,
    loading: externalLoading = false,
    error: externalError = null,
    title = "Scan QR Code",
    description = "Arahkan kamera ke QR Code",
    inline = false
}: QRScannerModalProps) {
    const router = useRouter();
    const [internalLoading, setInternalLoading] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);
    const [manualToken, setManualToken] = useState("");

    const loading = externalLoading || internalLoading;
    const errorMsg = externalError || internalError;
    const handler = onScanSuccess || onAttend;

    const extractToken = (raw: string) => {
        try {
            const url = new URL(raw);
            const token = url.searchParams.get("attend_token") || url.searchParams.get("token");
            if (token) return token;
            if (url.pathname.includes('/api/attendance/consultation/')) {
                return url.pathname.split('/api/attendance/consultation/')[1] || raw;
            }
        } catch {
            if (raw.includes('/api/attendance/consultation/')) {
                return raw.split('/api/attendance/consultation/')[1];
            }
        }
        return raw.trim();
    };

    const handleProcessResult = async (result: string) => {
        if (loading || !result.trim()) return;

        try {
            setInternalLoading(true);
            setInternalError(null);

            const token = extractToken(result);

            // If a specific callback is passed (e.g. from seminar attendance widget or consultation view)
            if (handler) {
                await handler(token);
                onOpenChange(false);
                setManualToken("");
                return;
            }

            // Global scan (e.g. from navbar scanner)
            let isProcessed = false;

            // 1. Consultation attendance URL or direct consultation token
            const isConsultationPattern = 
                result.includes('/api/attendance/consultation/') || 
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]+$/i.test(token);

            if (isConsultationPattern) {
                isProcessed = true;
                const res = await verifyAndCompleteConsultation(token);
                if (res.error) {
                    setInternalError(
                        res.error === "invalid_token" ? "QR Code tidak valid atau sudah kadaluarsa." :
                        res.error === "unauthorized" ? "Anda tidak diizinkan untuk mengonfirmasi kehadiran ini (pastikan Anda dosen pembimbing mahasiswa bersangkutan)." :
                        res.error === "already_completed" ? "Kehadiran sudah terkonfirmasi sebelumnya." : "Gagal memverifikasi kehadiran."
                    );
                } else {
                    toast.success("Kehadiran bimbingan berhasil dikonfirmasi!");
                    onOpenChange(false);
                    setManualToken("");
                    router.refresh();
                }
            }

            // 2. Seminar attendance URL with attend_token
            if (!isProcessed && (result.includes('/seminar-proposal/') || result.includes('/seminar-hasil/'))) {
                isProcessed = true;
                try {
                    const parsedUrl = new URL(result);
                    const path = parsedUrl.pathname + parsedUrl.search;
                    toast.info("Mengarahkan ke halaman seminar...");
                    onOpenChange(false);
                    router.push(path);
                } catch {
                    router.push(result);
                }
            }

            if (!isProcessed) {
                setInternalError("Format QR Code tidak dikenali. Pastikan Anda memindai QR resmi SIMTA.");
            }
        } catch {
            setInternalError("Gagal memproses QR Code.");
        } finally {
            setInternalLoading(false);
        }
    };

    const modalInner = (
        <GradientCard variant="konsultasi" rounded="bottom" className="w-full max-w-md shadow-2xl border-0 text-left">
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-5 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Camera className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles["konsultasi"])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">{title}</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">{description}</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            {/* Camera Scanner Box - Full width, touching header, no rounded corners */}
            <div className="relative overflow-hidden bg-black w-full aspect-video flex items-center justify-center">
                {inline ? (
                    <div className="flex flex-col items-center gap-2.5 text-white/80 p-6 text-center">
                        <Camera className="h-9 w-9 text-primary animate-pulse" />
                        <p className="text-xs font-medium">Area Pemindai Kamera</p>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-medium">Memproses QR Code...</p>
                    </div>
                ) : (
                    <Scanner 
                        onScan={(result) => {
                            if (result && result.length > 0) {
                                handleProcessResult(result[0].rawValue);
                            }
                        }} 
                        onError={(e) => console.error(e)}
                        components={{}}
                    />
                )}
                
                {/* Visual Overlay Target Frame */}
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
                    <div 
                        className="w-[60%] max-w-[220px] aspect-square relative rounded-xl"
                        style={{ boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)" }}
                    >
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl -mt-0.5 -ml-0.5"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl -mt-0.5 -mr-0.5"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl -mb-0.5 -ml-0.5"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl -mb-0.5 -mr-0.5"></div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">

                {/* Divider: Atau Input Manual */}
                <div className="relative flex items-center pt-1">
                    <div className="flex-grow border-t border-border/60"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Atau Input Manual</span>
                    <div className="flex-grow border-t border-border/60"></div>
                </div>

                {/* Manual Token Input */}
                <div className="relative">
                    <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        placeholder="Masukan token kode QR..."
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleProcessResult(manualToken);
                            }
                        }}
                        className="pl-9 pr-20 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs font-mono w-full"
                    />
                    <button
                        type="button"
                        onClick={() => handleProcessResult(manualToken)}
                        disabled={loading || !manualToken.trim()}
                        className={cn(
                            "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 rounded-md font-bold text-[10px] transition-colors",
                            (loading || !manualToken.trim()) 
                                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                                : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        )}
                    >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "KIRIM"}
                    </button>
                </div>

                {errorMsg && (
                    <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{errorMsg}</p>
                    </div>
                )}


            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-md focus:outline-none">
                <DialogTitle className="sr-only">Pindai QR Code</DialogTitle>
                <DialogDescription className="sr-only">Pemindai kamera dan input manual kode presensi atau konsultasi</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}

