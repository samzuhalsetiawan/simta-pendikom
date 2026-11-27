"use client"

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { QrCode, AlertCircle, Loader2, Copy, Check, Eye, EyeOff, X } from "lucide-react";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    variantIconBadgeStyles,
    type GradientCardVariant
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface QRCodeModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    token?: string | null;
    qrUrl?: string;
    type?: 'consultation' | 'proposal' | 'hasil' | 'seminar';
    seminarId?: string | number;
    title?: string;
    description?: string;
    variant?: GradientCardVariant;
    onConfirmAttendance?: (attended: boolean) => any;
    loading?: boolean;
    inline?: boolean;
    className?: string;
}

export function QRCodeModal({
    open = false,
    onOpenChange = () => {},
    token,
    qrUrl: customQrUrl,
    type = 'consultation',
    seminarId,
    title,
    description,
    variant: customVariant,
    onConfirmAttendance,
    loading = false,
    inline = false,
    className
}: QRCodeModalProps) {
    const [showToken, setShowToken] = useState(false);
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Resolve variant
    const variant: GradientCardVariant = customVariant || (
        type === 'hasil' ? 'seminar-hasil' :
        type === 'proposal' ? 'seminar-proposal' :
        type === 'seminar' ? 'seminar-proposal' :
        'konsultasi'
    );

    // Resolve default title & description
    const modalTitle = title || (
        type === 'hasil' || type === 'proposal' || type === 'seminar'
            ? "QR Code Seminar"
            : "QR Code Kehadiran"
    );

    const modalDescription = description || (
        type === 'hasil' || type === 'proposal' || type === 'seminar'
            ? "Tampilkan kode ini untuk dipindai audiens seminar"
            : "Tunjukkan QR Code ini kepada dosen pembimbing untuk dipindai"
    );

    // Generate QR URL from received token
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let effectiveQrUrl = customQrUrl || '';

    if (!effectiveQrUrl && token) {
        if (token.startsWith('http://') || token.startsWith('https://')) {
            effectiveQrUrl = token;
        } else if (type === 'proposal' || type === 'hasil') {
            effectiveQrUrl = `${baseUrl}/seminar-${type}/${seminarId || ''}?attend_token=${token}`;
        } else if (seminarId) {
            effectiveQrUrl = `${baseUrl}/seminar-proposal/${seminarId}?attend_token=${token}`;
        } else {
            effectiveQrUrl = `${baseUrl}/api/attendance/consultation/${token}`;
        }
    }

    const qrValue = effectiveQrUrl || token || "";

    const handleCopy = async (text: string, isUrl = false) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }

        if (isUrl) {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } else {
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        }
    };

    const modalInner = (
        <GradientCard
            variant={variant}
            rounded="bottom"
            className={cn(
                "w-full shadow-none border-0 text-left",
                !inline && (type === 'consultation' ? "max-w-sm" : "max-w-md"),
                className
            )}
        >
            <GradientCardHeader variant={variant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <QrCode className={cn("w-6 h-6 shrink-0", variantIconBadgeStyles[variant])} />
                    <div className="space-y-0.5 min-w-0">
                        <GradientCardTitle className="text-base truncate">{modalTitle}</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">{modalDescription}</GradientCardDescription>
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

            <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
                {loading && !token ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-2xl border border-dashed border-border/70 my-2 w-full">
                        <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
                        <p className="text-xs font-medium text-muted-foreground">Memuat QR Code...</p>
                    </div>
                ) : !token ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-2xl border border-amber-500/20 my-2 w-full">
                        <AlertCircle className="w-6 h-6 mb-2 text-amber-500" />
                        <p className="text-xs font-semibold">QR Code belum tersedia untuk sesi ini.</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Pastikan jadwal telah aktif atau coba beberapa saat lagi.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-white rounded-2xl border border-border/40 my-1">
                            <QRCodeSVG value={qrValue} size={190} level="M" includeMargin={false} />
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[260px]">
                            {type === 'hasil' || type === 'proposal' || type === 'seminar'
                                ? "Tampilkan QR Code ini kepada audiens seminar untuk mencatat kehadiran."
                                : "Tunjukkan QR Code ini kepada mahasiswa untuk memverifikasi bimbingan."}
                        </p>
                    </>
                )}

                {/* Manual Token Section with Copy Button */}
                {token && (
                    <div className="w-full pt-3 border-t border-border/50 text-left">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs gap-2 text-muted-foreground hover:text-foreground justify-center h-8"
                            onClick={() => setShowToken(!showToken)}
                        >
                            {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            <span>{showToken ? "Sembunyikan Token" : "Tampilkan Token (Input Manual)"}</span>
                        </Button>

                        {showToken && (
                            <div className="mt-2.5 space-y-2">
                                <div className="relative">
                                    <code className="block w-full p-2.5 pr-9 bg-muted/80 rounded-xl text-[11px] font-mono break-all leading-relaxed select-all border border-border/60">
                                        {token}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(token, false)}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-background border hover:bg-muted transition-colors cursor-pointer"
                                        title="Salin token"
                                    >
                                        {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                    </button>
                                </div>
                                {effectiveQrUrl && effectiveQrUrl !== token && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-[11px] h-8 gap-1.5 rounded-xl cursor-pointer"
                                        onClick={() => handleCopy(effectiveQrUrl, true)}
                                    >
                                        {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                        Salin URL Presensi
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Lecturer Manual Confirmation Buttons */}
                {onConfirmAttendance && (
                    <div className="w-full pt-3 border-t border-border/50">
                        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                            Atau konfirmasi manual jika kamera mahasiswa terkendala:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => onConfirmAttendance(true)}
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs h-9"
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                                Selesai
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onConfirmAttendance(false)}
                                disabled={loading}
                                className="rounded-xl font-bold cursor-pointer text-xs h-9"
                            >
                                Tidak Hadir
                            </Button>
                        </div>
                    </div>
                )}

                <div className="w-full pt-2 border-t border-border/50 flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold text-xs cursor-pointer"
                    >
                        Tutup
                    </Button>
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                hideCloseButton
                className={cn(
                    "p-0 border-0 bg-transparent shadow-none focus:outline-none",
                    type === 'consultation' ? "max-w-sm" : "max-w-md"
                )}
            >
                <DialogTitle className="sr-only">{title || "QR Code Presensi"}</DialogTitle>
                <DialogDescription className="sr-only">Tampilkan dan pindai QR Code presensi</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}

export default QRCodeModal;
