"use client"

import React, { useState } from "react"
import { 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    BookOpen, 
    CheckCircle, 
    XCircle, 
    Timer, 
    Loader2, 
    MessageSquare, 
    AlertCircle, 
    Save, 
    Send, 
    QrCode 
} from "lucide-react"
import { Button } from "@/components/base/button"
import { Input } from "@/components/base/input"
import { Label } from "@/components/base/label"
import { Textarea } from "@/components/base/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/base/dialog"
import { 
    GradientCard, 
    GradientCardHeader, 
    GradientCardTitle, 
    GradientCardDescription 
} from "@/components/shared/gradient-card"
import type { Consultation } from "@/lib/dal/consultation"
import { 
    updateStudentNotes, 
    scheduleConsultation,
    rejectConsultation,
    getOrCreateConsultationQrToken
} from "@/lib/actions/consultation"
import { completeConsultation } from "@/lib/actions/approval"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { QRCodeModal } from "@/components/Modal/qr-code-modal"
import { useRealtimeEvent } from "@/components/provider/realtime-provider"
import { ConsultationScheduleModal } from "@/components/Modal/consultation-schedule-modal"
import { ConsultationRejectModal } from "@/components/Modal/consultation-reject-modal"

interface Props {
    consultation: Consultation
    currentUserRole: "student" | "lecturer" | "guest"
    isOwnerStudent: boolean
    isOwnerLecturer?: boolean
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string; bg: string }> = {
    requested: { icon: Timer, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/30', label: 'Menunggu jadwal dari dosen' },
    scheduled: { icon: Timer, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/30', label: 'Menunggu Konfirmasi' },

    approved: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/30', label: 'Disetujui' },
    completed: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Selesai' },
    rejected: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/30', label: 'Ditolak' },
    missed: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/30', label: 'Tidak Hadir' },
}

export function ConsultationDetailView({ consultation, currentUserRole, isOwnerStudent, isOwnerLecturer = false }: Props) {
    const router = useRouter()
    
    const config = STATUS_CONFIG[consultation.status] || STATUS_CONFIG.requested
    const StatusIcon = config.icon

    // Notes State (Hanya 1 Catatan Mahasiswa)
    const [studentNotes, setStudentNotes] = useState<string>(consultation.student_notes || "")
    const [savingStudentNotes, setSavingStudentNotes] = useState(false)

    // Schedule / Action State
    const [loading, setLoading] = useState<boolean>(false)
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

    // Form states
    const [scheduleDate, setScheduleDate] = useState<string>(
        consultation.consultation_date ? new Date(consultation.consultation_date).toISOString().split('T')[0] : ""
    )
    const [scheduleTime, setScheduleTime] = useState<string>(
        consultation.consultation_date 
            ? new Date(consultation.consultation_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
            : ""
    )
    const [scheduleVenue, setScheduleVenue] = useState<string>(consultation.venue || "")
    const [rejectReason, setRejectReason] = useState<string>("")
    const [isQrModalOpen, setIsQrModalOpen] = useState(false)
    const [qrToken, setQrToken] = useState<string>(consultation.current_qr_token || "")
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" })

    // Listen to realtime consultation events via Global SSE
    useRealtimeEvent<{ consultationId: string; status: string }>(
        "consultation:completed",
        (data) => {
            if (data.consultationId === consultation.id) {
                if (data.status === "completed") {
                    toast.success("Kehadiran bimbingan berhasil dikonfirmasi!");
                } else if (data.status === "missed") {
                    toast.info("Bimbingan ditandai tidak hadir.");
                }
                setIsQrModalOpen(false);
                router.refresh();
            }
        },
        [consultation.id, router]
    )

    const handleOpenQrModal = async () => {
        if (!qrToken) {
            setLoading(true)
            try {
                const res = await getOrCreateConsultationQrToken(consultation.id)
                if (res.token) {
                    setQrToken(res.token)
                    setIsQrModalOpen(true)
                } else {
                    toast.error("Gagal memuat QR Code.")
                }
            } catch {
                toast.error("Gagal memuat QR Code.")
            } finally {
                setLoading(false)
            }
        } else {
            setIsQrModalOpen(true)
        }
    }

    React.useEffect(() => {
        // Read flash cookies for attendance redirect
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const successMsg = getCookie("simta_attendance_msg");
        if (successMsg === "success") {
            toast.success("Kehadiran bimbingan berhasil dikonfirmasi!");
            document.cookie = "simta_attendance_msg=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        const errorMsg = getCookie("simta_attendance_error");
        if (errorMsg) {
            let userMessage = "Terjadi kesalahan saat memverifikasi kehadiran.";
            if (errorMsg === "invalid_token" || errorMsg === "not_found") {
                userMessage = "QR Code tidak valid atau sudah kadaluarsa.";
            } else if (errorMsg === "unauthorized") {
                userMessage = "Anda tidak diizinkan untuk mengkonfirmasi kehadiran pada jadwal ini.";
            } else if (errorMsg === "already_completed") {
                userMessage = "Kehadiran pada jadwal ini sudah terkonfirmasi.";
            }
            
            setErrorModal({ open: true, message: userMessage });
            document.cookie = "simta_attendance_error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }, []);

    const handleSaveStudentNotes = async () => {
        setSavingStudentNotes(true)
        try {
            await updateStudentNotes(consultation.id, studentNotes)
            toast.success("Catatan konsultasi berhasil disimpan")
        } catch (e: any) {
            toast.error("Gagal menyimpan catatan")
        } finally {
            setSavingStudentNotes(false)
        }
    }

    const handleScheduleSubmit = async (date: string, time: string, venue: string) => {
        setLoading(true)
        try {
            const dateTime = `${date} ${time}:00`
            await scheduleConsultation(consultation.id, dateTime, venue)
            toast.success("Jadwal bimbingan berhasil ditentukan")
            setIsScheduleModalOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Gagal menjadwalkan bimbingan")
        } finally {
            setLoading(false)
        }
    }

    const handleRejectSubmit = async (reason: string) => {
        setLoading(true)
        try {
            await rejectConsultation(consultation.id, reason)
            toast.success("Konsultasi ditolak")
            setIsRejectModalOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Gagal menolak konsultasi")
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmAttendance = async (attended: boolean) => {
        setLoading(true)
        const res = await completeConsultation(consultation.id, attended)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(attended ? "Kehadiran bimbingan dikonfirmasi (Selesai)" : "Bimbingan ditandai tidak hadir")
            router.refresh()
        }
        setLoading(false)
    }

    const hasSchedule = consultation.consultation_date !== null
    const payload = JSON.stringify({ type: 'simta_consultation', id: consultation.id })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Konsultasi Skripsi</h2>
                    <p className="text-sm text-muted-foreground mt-1">Informasi lengkap terkait sesi konsultasi skripsi</p>
                </div>
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full ${config.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
                </div>
            </div>

            {/* BANNER NOTIFIKASI PERMINTAAN JADWAL ULANG (Jika ada) */}
            {consultation.status === 'reschedule_requested' && consultation.student_notes && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/30 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                            Permintaan Penjadwalan Ulang dari Mahasiswa
                        </p>
                        <p className="text-sm text-rose-600 dark:text-rose-300 italic mt-0.5">
                            "{consultation.student_notes}"
                        </p>
                    </div>
                </div>
            )}

            {/* ASYMMETRIC 2-COLUMN LAYOUT (35% Sidebar Context : 65% Main Canvas) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* === KOLOM KIRI (Panel Konteks: 4 cols / ~35%) === */}
                <div className="lg:col-span-4 space-y-5">
                    
                    {/* 1. Card Jadwal & Lokasi */}
                    <GradientCard>
                        <GradientCardHeader className="p-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Waktu & Tempat</h3>
                            </div>
                        </GradientCardHeader>
                        <div className="p-5 pt-4 space-y-4">

                        {hasSchedule ? (
                            <div className="space-y-3.5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-muted-foreground">Tanggal</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {new Date(consultation.consultation_date!).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-muted-foreground">Waktu</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {new Date(consultation.consultation_date!).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} WIB
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-muted-foreground">Tempat / Ruangan</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {consultation.venue || "Belum ditentukan"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : consultation.status === 'rejected' ? (
                            <div className="flex items-start gap-3 p-3.5 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 rounded-xl">
                                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-500 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-left">
                                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Pengajuan Ditolak</p>
                                    {consultation.reject_reason && (
                                        <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-snug">
                                            Alasan: {consultation.reject_reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3.5 bg-muted/40 rounded-xl text-center space-y-1.5 border border-dashed border-border/70">
                                <Timer className="h-5 w-5 text-muted-foreground mx-auto" />
                                <p className="text-xs font-semibold text-foreground">Jadwal Belum Ditentukan</p>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    {currentUserRole === 'lecturer' 
                                        ? "Silakan tentukan jadwal dan tempat pelaksanaan konsultasi."
                                        : "Menunggu dosen pembimbing menentukan waktu & tempat."}
                                </p>
                            </div>
                        )}

                        {/* Actions inside Schedule Card */}
                        <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-2">
                            {/* Dosen: Atur Jadwal & Tolak */}
                            {currentUserRole === 'lecturer' && isOwnerLecturer && (consultation.status === 'requested') && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={() => setIsRejectModalOpen(true)} className="w-full text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30" size="sm">
                                        <XCircle className="h-4 w-4 mr-1.5" /> Tolak
                                    </Button>
                                    <Button onClick={() => setIsScheduleModalOpen(true)} className="w-full bg-emerald-600 hover:bg-emerald-700" size="sm">
                                        <Calendar className="h-4 w-4 mr-1.5" /> Tentukan Jadwal
                                    </Button>
                                </div>
                            )}

                            {/* Dosen: Konfirmasi Kehadiran Langsung di Halaman */}
                            {currentUserRole === 'lecturer' && isOwnerLecturer && consultation.status === 'approved' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleConfirmAttendance(true)}
                                        disabled={loading}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs h-9 cursor-pointer"
                                    >
                                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                                        Selesai (Hadir)
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleConfirmAttendance(false)}
                                        disabled={loading}
                                        className="w-full text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-bold text-xs h-9 cursor-pointer"
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                        Tidak Hadir
                                    </Button>
                                </div>
                            )}

                            {/* Mahasiswa: Tampilkan QR Presensi */}
                            {currentUserRole === 'student' && isOwnerStudent && consultation.status === 'approved' && (
                                <div className="pt-2 flex flex-col gap-3">
                                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-center">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Tunjukkan QR Code berikut kepada dosen pembimbing Anda untuk memverifikasi kehadiran bimbingan.
                                        </p>
                                    </div>
                                    <Button 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer" 
                                        onClick={handleOpenQrModal}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
                                        Tampilkan QR Presensi
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    </GradientCard>

                    {/* 2. Card Partisipan (Mahasiswa & Dosen) */}
                    <GradientCard>
                        <GradientCardHeader className="p-4">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mahasiswa & Dosen</h3>
                            </div>
                        </GradientCardHeader>
                        <div className="p-5 pt-4 space-y-4">

                        {/* Mahasiswa */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border border-primary/20">
                                {consultation.student_image ? (
                                    <img src={consultation.student_image} alt={consultation.student_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mahasiswa</p>
                                <p className="text-sm font-semibold text-foreground truncate">{consultation.student_name}</p>
                                <p className="text-xs text-muted-foreground">{consultation.student_nim}</p>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Dosen */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border border-primary/20">
                                {consultation.lecturer_image ? (
                                    <img src={consultation.lecturer_image} alt={consultation.lecturer_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {consultation.lecturer_role === 'examiner' ? 'Dosen Penguji' : 'Dosen Pembimbing'}
                                </p>
                                <p className="text-sm font-semibold text-foreground truncate">{consultation.lecturer_name}</p>
                                <p className="text-xs text-muted-foreground">{consultation.lecturer_nip}</p>
                            </div>
                        </div>
                    </div>
                    </GradientCard>

                    {/* 3. Card Topik / Judul Skripsi */}
                    <GradientCard>
                        <GradientCardHeader className="p-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Informasi {consultation.is_thesis ? 'Skripsi' : 'Proposal'}
                                </h3>
                            </div>
                        </GradientCardHeader>
                        <div className="p-5 pt-4 space-y-2.5">
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                {consultation.thesis_title || "Belum menentukan judul"}
                            </p>
                        </div>
                    </GradientCard>

                </div>

                {/* === KOLOM KANAN (Lembar Catatan Konsultasi: 8 cols / ~65%) === */}
                <div className="lg:col-span-8">
                    <GradientCard className="flex flex-col min-h-[580px]">
                        <GradientCardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <GradientCardTitle>Catatan Konsultasi</GradientCardTitle>
                                    <GradientCardDescription className="flex flex-col gap-0.5">
                                        <span>
                                            {currentUserRole === 'student' && isOwnerStudent
                                                ? "Catatan selama sesi konsultasi yang dituliskan oleh mahasiswa"
                                                : "Catatan diskusi yang disampaikan selama sesi konsultasi."}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground/80 font-normal italic">
                                            *Catatan konsultasi akan dapat dilihat oleh publik
                                        </span>
                                    </GradientCardDescription>
                                </div>
                            </div>
                        </GradientCardHeader>

                        <div className="p-6 flex flex-col flex-1 space-y-4">
                            {currentUserRole === 'student' && isOwnerStudent && studentNotes !== (consultation.student_notes || "") && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-500">
                                        Ada perubahan catatan yang belum disimpan.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setStudentNotes(consultation.student_notes || "")} 
                                            disabled={savingStudentNotes}
                                        >
                                            Batal
                                        </Button>
                                        <Button onClick={handleSaveStudentNotes} disabled={savingStudentNotes} size="sm">
                                            {savingStudentNotes ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Simpan Catatan
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 flex flex-col space-y-2">
                                <Textarea 
                                    value={studentNotes}
                                    onChange={(e) => setStudentNotes(e.target.value)}
                                    placeholder={isOwnerStudent ? "Tuliskan apa yang ingin Anda diskusikan dengan dosen pembimbing, progres pengerjaan bab, pertanyaan, atau catatan hasil diskusi di sini..." : "Tidak ada catatan konsultasi yang ditulis mahasiswa."}
                                    className="flex-1 min-h-[380px] lg:min-h-[440px] resize-none bg-background/50 focus:bg-background transition-colors p-4 leading-relaxed text-sm disabled:cursor-default"
                                    disabled={currentUserRole !== 'student' || !isOwnerStudent}
                                />
                            </div>
                        </div>
                    </GradientCard>
                </div>

            </div>

            {/* MODAL / DIALOG: TENTUKAN JADWAL (Dosen) */}
            <ConsultationScheduleModal
                open={isScheduleModalOpen}
                onOpenChange={setIsScheduleModalOpen}
                onSubmit={handleScheduleSubmit}
                loading={loading}
                initialDate={scheduleDate}
                initialTime={scheduleTime}
                initialVenue={scheduleVenue}
            />

            {/* MODAL / DIALOG: TOLAK KONSULTASI (Dosen) */}
            <ConsultationRejectModal
                open={isRejectModalOpen}
                onOpenChange={setIsRejectModalOpen}
                onSubmit={handleRejectSubmit}
                loading={loading}
            />

            <Dialog open={errorModal.open} onOpenChange={(open) => !open && setErrorModal({ open: false, message: "" })}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertCircle className="w-5 h-5" />
                            Gagal Verifikasi Kehadiran
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {errorModal.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setErrorModal({ open: false, message: "" })} variant="outline">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Student QR Code Modal for Lecturer to scan */}
            <QRCodeModal
                open={isQrModalOpen}
                onOpenChange={setIsQrModalOpen}
                token={qrToken}
                type="consultation"
                title="QR Code Presensi Bimbingan"
                description="Tunjukkan QR Code ini kepada dosen pembimbing Anda untuk dipindai"
            />
        </div>
    )
}
