"use client"

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/base/dialog";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { CheckCircle2, KeyRound, Loader2, UserPlus } from "lucide-react";
import { registerAsSpectator, submitAttendance, getSpectatorStatusAction } from "@/lib/actions/seminar";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { toast } from "sonner";

interface SeminarAttendanceWidgetProps {
    seminarId: string;
    type: 'proposal' | 'hasil';
}

export default function SeminarAttendanceWidget({ seminarId, type }: SeminarAttendanceWidgetProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [spectatorStatus, setSpectatorStatus] = useState<'terdaftar' | 'menghadiri' | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Manual token dialog state (camera scan is exclusively handled via Navbar profile menu)
    const [showTokenDialog, setShowTokenDialog] = useState(false);
    const [manualToken, setManualToken] = useState("");

    const attendTokenParam = searchParams?.get('attend_token');

    const fetchStatus = async () => {
        setStatusLoading(true);
        try {
            const status = await getSpectatorStatusAction(seminarId, type);
            setSpectatorStatus(status);
        } catch (e) {
            console.error(e);
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [seminarId, type]);

    // Auto attend if attend_token parameter is in URL (from scanning via Navbar scanner)
    useEffect(() => {
        if (attendTokenParam) {
            handleAttend(attendTokenParam);
        }
    }, [attendTokenParam]);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await registerAsSpectator(seminarId, type);
            if (res.error) {
                toast.error(res.error);
                setError(res.error);
            } else {
                toast.success("Berhasil mendaftar sebagai penonton!");
                setSpectatorStatus('terdaftar');
            }
        } catch (e: any) {
            toast.error(e.message || "Terjadi kesalahan.");
            setError(e.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    const getOrCreateDeviceUuid = (): string => {
        const STORAGE_KEY = "simta_device_uuid";
        try {
            let uuid = localStorage.getItem(STORAGE_KEY);
            if (!uuid) {
                uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
                    ? crypto.randomUUID() 
                    : 'dev-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
                localStorage.setItem(STORAGE_KEY, uuid);
            }
            return uuid;
        } catch {
            return 'temp-' + Math.random().toString(36).substring(2, 15);
        }
    };

    const handleAttend = async (tokenInput: string) => {
        if (!tokenInput.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const fp = await fpPromise.load();
            const result = await fp.get();
            const fingerprint = result.visitorId;
            const deviceUuid = getOrCreateDeviceUuid();

            const res = await submitAttendance(seminarId, type, tokenInput.trim(), fingerprint, deviceUuid);
            if (res.error) {
                toast.error(res.error);
                setError(res.error);
            } else {
                toast.success("Absensi berhasil dicatat!");
                setSpectatorStatus('menghadiri');
                setShowTokenDialog(false);
                setManualToken("");
                if (attendTokenParam) {
                    // Clean URL parameter without reloading
                    const path = type === 'proposal' ? `/seminar-proposal/${seminarId}` : `/seminar-hasil/${seminarId}`;
                    router.replace(path);
                }
            }
        } catch (e: any) {
            toast.error(e.message || "Terjadi kesalahan.");
            setError(e.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    if (statusLoading) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat status absensi...
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {spectatorStatus === 'menghadiri' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    Sudah Tercatat Hadir
                </div>
            ) : spectatorStatus === 'terdaftar' ? (
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 font-bold text-xs">
                        Terdaftar sebagai Penonton
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegister}
                        disabled={loading}
                        className="border-primary/30 hover:bg-primary/5 text-primary font-bold text-xs rounded-xl h-9 px-3.5 gap-1.5 cursor-pointer"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        Daftar Penonton
                    </Button>
                </div>
            )}

            {/* Manual Attendance Token Dialog (Single scanner policy: camera scan is via navbar profile menu) */}
            <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
                <DialogContent className="max-w-sm rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                            <KeyRound className="h-5 w-5 text-primary" />
                            Presensi Kehadiran Seminar
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Pindai QR pemateri melalui menu profil di Navbar (pojok kanan atas), atau masukkan token 6-digit di bawah ini:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <Input
                            placeholder="Masukkan kode token..."
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAttend(manualToken);
                            }}
                            className="text-center tracking-widest font-mono font-bold uppercase rounded-xl h-11"
                        />
                        {error && (
                            <p className="text-xs text-rose-500 font-medium text-center">{error}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTokenDialog(false)}
                            className="rounded-xl font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            disabled={loading || !manualToken.trim()}
                            onClick={() => handleAttend(manualToken)}
                            className="bg-primary text-primary-foreground rounded-xl font-bold gap-1.5"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Kirim Kehadiran
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
