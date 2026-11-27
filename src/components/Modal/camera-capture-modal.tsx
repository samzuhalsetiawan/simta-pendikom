"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, Loader2, AlertCircle, RefreshCw, SwitchCamera } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
    type GradientCardVariant,
    variantIconBadgeStyles
} from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface CameraCaptureModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCapture: (capturedDataUrl: string) => void;
    roleVariant?: "student" | "lecturer" | "staff";
    cardVariant?: GradientCardVariant;
    inline?: boolean;
}

export function CameraCaptureModal({
    open = false,
    onOpenChange = () => {},
    onCapture,
    roleVariant = "student",
    cardVariant,
    inline = false,
}: CameraCaptureModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraState, setCameraState] = useState<"idle" | "requesting" | "ready" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);

    const gradientVariant: GradientCardVariant = cardVariant || (
        roleVariant === "student" ? "pengajuan-proposal" :
        roleVariant === "lecturer" ? "konsultasi" : "sidang-skripsi"
    );

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async (mode: "user" | "environment") => {
        stopStream();
        setCameraState("requesting");
        setErrorMessage(null);

        if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
            setCameraState("error");
            setErrorMessage("Kamera tidak didukung oleh browser ini atau koneksi tidak aman (HTTPS/localhost).");
            return;
        }

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: mode,
                    width: { ideal: 1280 },
                    height: { ideal: 960 },
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            setCameraState("ready");

            // Check if multiple camera devices are present
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter((d) => d.kind === "videoinput");
                setHasMultipleCameras(videoInputs.length > 1);
            } catch {
                // Ignore device enumeration errors
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            setCameraState("error");
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setErrorMessage("Izin akses kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setErrorMessage("Perangkat kamera tidak ditemukan.");
            } else {
                setErrorMessage("Gagal mengakses kamera. Silakan periksa kembali perangkat Anda.");
            }
        }
    }, [stopStream]);

    useEffect(() => {
        if (open) {
            startCamera(facingMode);
        } else {
            stopStream();
            setCameraState("idle");
        }

        return () => {
            stopStream();
        };
    }, [open, startCamera, stopStream, facingMode]);

    const toggleCamera = () => {
        const nextMode = facingMode === "user" ? "environment" : "user";
        setFacingMode(nextMode);
    };

    const handleClose = () => {
        stopStream();
        onOpenChange(false);
    };

    const takePhoto = () => {
        if (!videoRef.current || cameraState !== "ready") return;

        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);

        try {
            const video = videoRef.current;
            const vWidth = video.videoWidth || 1280;
            const vHeight = video.videoHeight || 960;
            const size = Math.min(vWidth, vHeight);
            const startX = (vWidth - size) / 2;
            const startY = (vHeight - size) / 2;

            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Mirror horizontally if user front camera
            if (facingMode === "user") {
                ctx.translate(size, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
            const capturedDataUrl = canvas.toDataURL("image/jpeg", 0.95);

            stopStream();
            onCapture(capturedDataUrl);
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to capture photo:", err);
        }
    };

    const modalInner = (
        <GradientCard variant={gradientVariant} rounded="bottom" className="w-full max-w-lg shadow-2xl border-0 text-left overflow-hidden">
            {/* Header */}
            <GradientCardHeader variant={gradientVariant} rounded="none" className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/30">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", variantIconBadgeStyles[gradientVariant])}>
                        <Camera className="h-4 w-4" />
                    </div>
                    <div>
                        <GradientCardTitle className="text-base truncate">Foto dari Kamera</GradientCardTitle>
                        <GradientCardDescription className="text-xs truncate">Posisikan wajah Anda di dalam lingkaran panduan</GradientCardDescription>
                    </div>
                </div>
                {!inline && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </GradientCardHeader>

            {/* Area Live Preview Kamera: Full 1 body modal antara header dan action buttons */}
            <div className="relative w-full h-[380px] sm:h-[420px] bg-neutral-950 border-b border-border/60 overflow-hidden flex items-center justify-center select-none">
                {/* Video Element */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        "w-full h-full object-cover block",
                        facingMode === "user" && "-scale-x-100"
                    )}
                />

                {/* State: Requesting / Loading */}
                {cameraState === "requesting" && (
                    <div className="absolute inset-0 z-20 bg-neutral-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">Menghubungkan ke Kamera</p>
                            <p className="text-xs text-neutral-400">Mohon izinkan akses kamera pada peramban Anda...</p>
                        </div>
                    </div>
                )}

                {/* State: Error */}
                {cameraState === "error" && (
                    <div className="absolute inset-0 z-20 bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
                        <div className="p-3 rounded-full bg-destructive/15 text-destructive border border-destructive/20">
                            <AlertCircle className="h-7 w-7" />
                        </div>
                        <div className="space-y-1.5 max-w-xs">
                            <p className="text-sm font-semibold">Tidak Dapat Mengakses Kamera</p>
                            <p className="text-xs text-neutral-400 leading-relaxed">{errorMessage}</p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => startCamera(facingMode)}
                            className="text-xs font-semibold rounded-xl gap-2 cursor-pointer"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {/* Camera Guide Overlay: Grid Kotak 1:1 + Lingkaran (Inscribed) */}
                {cameraState === "ready" && (
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-0">
                        {/* Border Kotak 1:1 (mentok sisi live preview, rasio 1:1, tanpa rounded corner) */}
                        <div 
                            className="relative h-full aspect-square max-h-full max-w-full border border-white/70 rounded-none flex items-center justify-center overflow-hidden transition-all"
                            style={{
                                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.48)",
                            }}
                        >
                            {/* Grid 3x3 (Rule of Thirds) di dalam kotak 1:1 */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                                <div className="border-r border-b border-white/15 border-dashed" />
                                <div className="border-r border-b border-white/15 border-dashed" />
                                <div className="border-b border-white/15 border-dashed" />
                                <div className="border-r border-b border-white/15 border-dashed" />
                                <div className="border-r border-b border-white/15 border-dashed" />
                                <div className="border-b border-white/15 border-dashed" />
                                <div className="border-r border-b border-white/15 border-dashed" />
                                <div className="border-r border-b border-white/15 border-dashed" />
                                <div className="" />
                            </div>

                            {/* Lingkaran dengan radius selebar sisi kotak (garis putus-putus tipis, menyinggung keempat sisi kotak 1:1) */}
                            <div className="absolute inset-0 w-full h-full rounded-full border border-dashed border-white/65 pointer-events-none" />

                            {/* Viewfinder Corner Accents (Tajam / Tanpa rounded) */}
                            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-primary pointer-events-none" />
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-primary pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-primary pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-primary pointer-events-none" />

                            {/* Central crosshair guide */}
                            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Shutter Flash Animation */}
                {isFlashing && (
                    <div className="absolute inset-0 z-30 bg-white/90 animate-out fade-out duration-200 pointer-events-none" />
                )}
            </div>

            {/* Action buttons with padding */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-card">
                {/* Left: Batal button */}
                <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleClose}
                    className="h-10 text-xs font-semibold rounded-xl px-4 border-border/60 hover:bg-muted cursor-pointer"
                >
                    Batal
                </Button>

                {/* Center: Primary Shutter Button */}
                <button
                    type="button"
                    onClick={takePhoto}
                    disabled={cameraState !== "ready"}
                    className="group relative flex items-center justify-center h-14 w-14 rounded-full border-4 border-primary/70 bg-background p-1 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Ambil Foto"
                    aria-label="Ambil Foto"
                >
                    <div className="h-full w-full rounded-full bg-primary group-hover:bg-primary/90 transition-colors flex items-center justify-center shadow-inner">
                        <Camera className="h-5 w-5 text-primary-foreground" />
                    </div>
                </button>

                {/* Right: Camera Flip / Placeholder */}
                <div className="w-[68px] flex justify-end">
                    {hasMultipleCameras && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={toggleCamera}
                            disabled={cameraState !== "ready"}
                            className="h-10 w-10 rounded-xl border-border/60 hover:bg-muted cursor-pointer"
                            title="Ganti Kamera"
                        >
                            <SwitchCamera className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </GradientCard>
    );

    if (inline) {
        return modalInner;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent aria-describedby={undefined} hideCloseButton className="p-0 border-0 bg-transparent shadow-none max-w-lg focus:outline-none">
                <DialogTitle className="sr-only">Foto dari Kamera</DialogTitle>
                <DialogDescription className="sr-only">Posisikan wajah Anda di dalam lingkaran panduan</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
