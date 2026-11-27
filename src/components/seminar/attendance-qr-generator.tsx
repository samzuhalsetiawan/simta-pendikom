"use client"

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/base/button";
import { RefreshCw, QrCode, Copy, Check, Eye, EyeOff } from "lucide-react";
import { getQrTokenAction } from "@/lib/actions/seminar";

import { useRealtimeEvent } from "@/components/provider/realtime-provider";

export default function AttendanceQRGenerator({
    seminarId,
    type,
    mockToken
}: {
    seminarId: string,
    type: 'proposal' | 'hasil',
    mockToken?: string
}) {
    const [token, setToken] = useState<string | null>(mockToken || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToken, setShowToken] = useState(false);
    const [copied, setCopied] = useState(false);

    // Realtime update via Global SSE instead of interval polling
    useRealtimeEvent<{ seminarId: string; token: string }>(
        "seminar:token-updated",
        (data) => {
            if (seminarId && String(data.seminarId) === String(seminarId) && data.token) {
                setToken(data.token);
            }
        },
        [seminarId]
    );

    const fetchToken = async () => {
        if (mockToken) {
            setToken(mockToken);
            return;
        }
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seminarId);
        if (!isUuid) {
            setToken("simta-preview-qr-token-12345");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const newToken = await getQrTokenAction(seminarId, type);
            if (!newToken) {
                setError("Gagal mendapatkan token QR.");
            } else {
                setToken(newToken);
            }
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToken();
    }, [seminarId, type, mockToken]);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading && !token) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-lg border border-dashed">
                <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mb-2" />
                <p className="text-xs font-medium text-muted-foreground">Memuat QR Code...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-rose-50 rounded-lg border border-rose-100 text-center">
                <p className="text-sm font-bold text-rose-700 mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchToken} className="border-rose-200 text-rose-700 hover:bg-rose-100">
                    <RefreshCw className="h-3 w-3 mr-2" /> Coba Lagi
                </Button>
            </div>
        );
    }

    if (!token) return null;

    const path = type === 'proposal' ? '/seminar-proposal/' : '/seminar-hasil/';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const qrUrl = `${origin}${path}${seminarId}?attend_token=${token}`;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 rounded-xl border shadow-none">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
                <QrCode className="h-5 w-5" />
                <h4 className="font-bold text-sm">QR Code Absensi</h4>
            </div>
            <div className="bg-white p-4 rounded-xl border">
                <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin={false} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 text-center max-w-[250px] leading-relaxed">
                Tampilkan QR Code ini kepada penonton. Token akan diperbarui secara otomatis setelah discan.
            </p>

            <div className="w-full mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs gap-2 text-muted-foreground"
                    onClick={() => setShowToken(!showToken)}
                >
                    {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showToken ? "Sembunyikan Token" : "Tampilkan Token (untuk input manual)"}
                </Button>

                {showToken && (
                    <div className="mt-2 space-y-2">
                        <div className="relative">
                            <code className="block w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-[10px] font-mono break-all leading-relaxed select-all">
                                {token}
                            </code>
                            <button
                                onClick={() => handleCopy(token)}
                                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 border hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                                title="Salin token"
                            >
                                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                            </button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs gap-2"
                            onClick={() => handleCopy(qrUrl)}
                        >
                            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            Salin URL Lengkap
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
