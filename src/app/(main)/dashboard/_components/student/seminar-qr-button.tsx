"use client"

import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/base/button";
import { QRCodeModal } from "@/components/Modal/qr-code-modal";
import { getQrTokenAction } from "@/lib/actions/seminar";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

import { useRealtimeEvent } from "@/components/provider/realtime-provider";

interface SeminarQRButtonProps {
    scheduledDate: string;
    seminarId: string | number;
    type: 'proposal' | 'hasil';
}

export default function SeminarQRButton({ scheduledDate, seminarId, type }: SeminarQRButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Consider ongoing if current time is >= scheduledDate
    // Or if within 30 minutes before
    const isOngoing = new Date().getTime() >= new Date(scheduledDate).getTime() - (30 * 60 * 1000);

    const handleClick = () => {
        if (!isOngoing) {
            toast.error("QRCode kehadiran hanya dapat dibuka saat sudah masuk waktu seminar");
            return;
        }
        setIsOpen(true);
    };

    // Realtime update via Global SSE instead of interval polling
    useRealtimeEvent<{ seminarId: string; token: string }>(
        "seminar:token-updated",
        (data) => {
            if (isOpen && seminarId && String(data.seminarId) === String(seminarId) && data.token) {
                setToken(data.token);
            }
        },
        [isOpen, seminarId]
    );

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        const fetchToken = async () => {
            try {
                setLoading(true);
                const newToken = await getQrTokenAction(String(seminarId), type);
                if (isMounted && newToken) {
                    setToken(newToken);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchToken();

        return () => {
            isMounted = false;
        };
    }, [isOpen, seminarId, type]);

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                    "h-10 w-10 rounded-full transition-all cursor-pointer",
                    isOngoing 
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white" 
                        : "bg-emerald-500/10 text-emerald-600/50 hover:bg-emerald-500/10 hover:text-emerald-600/50 cursor-not-allowed opacity-50"
                )}
                onClick={handleClick}
            >
                <QrCode className="h-5 w-5" />
            </Button>

            <QRCodeModal
                open={isOpen}
                onOpenChange={setIsOpen}
                token={token}
                loading={loading}
                type={type}
                seminarId={seminarId}
                title={type === 'hasil' ? "QR Code Seminar Hasil" : "QR Code Seminar Proposal"}
                description="Tampilkan kode ini untuk dipindai audiens seminar"
            />
        </>
    );
}
