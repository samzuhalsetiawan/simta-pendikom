"use client"

import React, { useState } from "react";
import { QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/base/button";
import { QRCodeModal } from "@/components/Modal/qr-code-modal";

interface ConsultationQRGeneratorProps {
    token: string;
    onConfirmAttendance: (attended: boolean) => void;
    loading: boolean;
}

export function ConsultationQRGenerator({ token, onConfirmAttendance, loading }: ConsultationQRGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                <AlertCircle className="w-5 h-5 mb-2 text-amber-500" />
                <p className="text-sm font-medium">QR Code tidak tersedia untuk sesi ini.</p>
            </div>
        );
    }

    return (
        <>
            <Button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code Kehadiran
            </Button>

            <QRCodeModal
                open={isOpen}
                onOpenChange={setIsOpen}
                token={token}
                type="consultation"
                title="QR Code Bimbingan"
                description="Tunjukkan QR Code ini kepada mahasiswa"
                onConfirmAttendance={onConfirmAttendance}
                loading={loading}
            />
        </>
    );
}

export default ConsultationQRGenerator;
