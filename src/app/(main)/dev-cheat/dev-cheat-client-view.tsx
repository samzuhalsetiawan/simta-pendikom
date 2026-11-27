"use client";

import { useState } from "react";
import { ListPageHeader } from "@/components/layout/list-page-header";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
} from "@/components/shared/gradient-card";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { EntityPickerModal } from "@/components/shared/entity-picker-modal";
import { searchStudentsAction, UserPickerItem } from "@/lib/actions/user-picker";
import {
    getStudentCheatStatusAction,
    allowStudentToHeldSemproAction,
    StudentCheatStatus,
} from "@/lib/actions/dev-cheat";
import { toast } from "sonner";
import {
    Terminal,
    Wrench,
    UserCheck,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    FileCheck,
    Zap,
    RefreshCw,
    Search,
    Clock,
    BookOpen,
} from "lucide-react";

export default function DevCheatClientView() {
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<UserPickerItem | null>(null);
    const [statusData, setStatusData] = useState<StudentCheatStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadStudentStatus = async (item: UserPickerItem) => {
        setIsLoadingStatus(true);
        try {
            const data = await getStudentCheatStatusAction(item.identifier);
            setStatusData(data);
        } catch (err: any) {
            toast.error("Gagal memuat status mahasiswa");
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const handleSelectStudent = (item: UserPickerItem) => {
        setSelectedStudent(item);
        loadStudentStatus(item);
    };

    const handleApplyCheat = async () => {
        if (!selectedStudent) return;
        setIsSubmitting(true);
        try {
            const res = await allowStudentToHeldSemproAction(selectedStudent.identifier);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.message || "Berhasil memberikan izin seminar proposal!");
                // Reload status
                await loadStudentStatus(selectedStudent);
            }
        } catch (err: any) {
            toast.error(err.message || "Terjadi kesalahan saat memproses cheat.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
            <ListPageHeader
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Dev Cheat Panel" },
                ]}
                badgeIcon={<Terminal className="w-3.5 h-3.5" />}
                badgeLabel="Development & Testing"
                title="Developer Cheat Panel"
                description="Halaman utilitas khusus pengujian untuk memanipulasi status data skripsi mahasiswa dengan cepat."
                variant="destructive"
            />

            {/* Section 1: Allow Student to Held Seminar Proposal */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-destructive" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Section 1: Allow student to held Seminar Proposal
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Fitur ini memanipulasi prasyarat seminar proposal mahasiswa yang dipilih agar langsung memenuhi syarat (eligible) untuk mengajukan permohonan seminar proposal.
                    Sistem akan meng-inject presensi sebagai penonton minimal 3 seminar mahasiswa lain dan mengubah status persetujuan proposal menjadi <strong>approved</strong>.
                </p>

                <GradientCard variant="seminar-proposal" className="border shadow-md">
                    <GradientCardHeader variant="seminar-proposal" className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <GradientCardTitle className="text-lg flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    Bypass Syarat Seminar Proposal
                                </GradientCardTitle>
                                <GradientCardDescription className="text-xs sm:text-sm mt-1">
                                    Pilih mahasiswa untuk memeriksa status dan menjalankan bypass kelayakan seminar proposal.
                                </GradientCardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsStudentModalOpen(true)}
                                className="gap-2 bg-background/80 hover:bg-background border-border"
                            >
                                <Search className="w-4 h-4" />
                                {selectedStudent ? "Ganti Mahasiswa" : "Pilih Mahasiswa"}
                            </Button>
                        </div>
                    </GradientCardHeader>

                    <div className="p-6 space-y-6">
                        {/* Student selection summary */}
                        {selectedStudent ? (
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                                        {selectedStudent.name?.charAt(0) || "M"}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground text-base">
                                            {selectedStudent.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            NIM: {selectedStudent.identifier}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadStudentStatus(selectedStudent)}
                                        disabled={isLoadingStatus}
                                        className="gap-1.5 text-xs"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? "animate-spin" : ""}`} />
                                        Refresh Data
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 px-4 border border-dashed rounded-xl border-border bg-muted/20">
                                <UserCheck className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
                                <h3 className="font-semibold text-foreground text-sm">Belum Ada Mahasiswa Dipilih</h3>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                                    Silakan klik tombol di bawah untuk memilih akun mahasiswa yang ingin diuji kelayakan seminar proposalnya.
                                </p>
                                <Button
                                    variant="default"
                                    onClick={() => setIsStudentModalOpen(true)}
                                    className="gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Pilih Mahasiswa
                                </Button>
                            </div>
                        )}

                        {/* Status detail when student is selected */}
                        {selectedStudent && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-primary" />
                                    Pemeriksaan Prasyarat Saat Ini:
                                </h4>

                                {isLoadingStatus ? (
                                    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Memeriksa data dan status skripsi...
                                    </div>
                                ) : statusData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Status Proposal */}
                                        <div className="p-4 rounded-lg border border-border/80 bg-card/60 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <FileCheck className="w-4 h-4 text-amber-500" />
                                                    Persetujuan Proposal Dosen
                                                </span>
                                                <Badge
                                                    variant={statusData.proposal_approval_status === "approved" ? "default" : "destructive"}
                                                    className={`capitalize text-[11px] ${
                                                        statusData.proposal_approval_status === "approved"
                                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                            : statusData.proposal_approval_status === "pending"
                                                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                            : ""
                                                    }`}
                                                >
                                                    {statusData.proposal_approval_status || "Belum Mengajukan"}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                                <div className="flex items-start gap-2">
                                                    {statusData.title ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                    )}
                                                    <span>
                                                        <strong>Judul:</strong>{" "}
                                                        {statusData.title || (
                                                            <span className="text-rose-500 italic">Belum diisi oleh mahasiswa</span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {statusData.proposal_url ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                                    )}
                                                    <span>
                                                        <strong>File Proposal:</strong>{" "}
                                                        {statusData.proposal_url ? (
                                                            <span className="text-emerald-500 font-medium">Sudah diunggah</span>
                                                        ) : (
                                                            <span className="text-rose-500 italic">Belum diunggah</span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {statusData.has_supervisors ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                                    )}
                                                    <span>
                                                        <strong>Dosen Pembimbing:</strong>{" "}
                                                        {statusData.has_supervisors ? (
                                                            <span className="text-emerald-500 font-medium">Sudah ditentukan</span>
                                                        ) : (
                                                            <span className="text-rose-500 italic">Belum ada pembimbing</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Presensi Seminar */}
                                        <div className="p-4 rounded-lg border border-border/80 bg-card/60 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-sky-500" />
                                                    Menonton Seminar Lain
                                                </span>
                                                <Badge
                                                    variant="default"
                                                    className={`text-[11px] ${
                                                        statusData.attendance_count >= 3
                                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                            : "bg-amber-500 hover:bg-amber-600 text-white"
                                                    }`}
                                                >
                                                    {statusData.attendance_count} / 3 Seminar
                                                </Badge>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    {statusData.attendance_count >= 3 ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                                    )}
                                                    <span>
                                                        {statusData.attendance_count >= 3
                                                            ? "Syarat presensi terpenuhi (minimal 3x menghadiri seminar)."
                                                            : `Kurang ${3 - statusData.attendance_count} kali menghadiri seminar.`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                                                    <span>
                                                        <strong>Permohonan Sempro Aktif:</strong>{" "}
                                                        {statusData.active_sempro_count > 0 ? (
                                                            <span className="text-amber-500 font-medium">Sudah memiliki {statusData.active_sempro_count} pengajuan</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Belum ada</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        Data skripsi mahasiswa ini belum ditemukan di database.
                                    </div>
                                )}

                                {/* Action button & Warnings */}
                                {statusData && (
                                    <div className="pt-2">
                                        {!statusData.is_ready_for_cheat ? (
                                            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                                                <p className="font-semibold flex items-center gap-1.5">
                                                    <XCircle className="w-4 h-4 shrink-0" />
                                                    Mahasiswa belum melengkapi data dan file proposal!
                                                </p>
                                                <p className="text-muted-foreground text-[11px]">
                                                    Syarat dari sistem tetap mengharuskan mahasiswa memiliki judul skripsi, mengunggah file proposal, serta memiliki dosen pembimbing terlebih dahulu sebelum statusnya dapat dimanipulasi menjadi disetujui.
                                                </p>
                                            </div>
                                        ) : statusData.is_eligible_for_sempro ? (
                                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                                                <p className="font-semibold flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                    Mahasiswa sudah eligible menggelar Seminar Proposal!
                                                </p>
                                                <p className="text-muted-foreground text-[11px]">
                                                    Proposal sudah disetujui dan kehadiran seminar sudah mencapai {statusData.attendance_count} kali. Mahasiswa dapat langsung mengajukan seminar proposal melalui dashboard-nya.
                                                </p>
                                            </div>
                                        ) : null}

                                        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                                            <Button
                                                variant="default"
                                                onClick={handleApplyCheat}
                                                disabled={isSubmitting || isLoadingStatus || !statusData.is_ready_for_cheat}
                                                className="gap-2 shadow-md"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                        Memproses Bypass...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-4 h-4" />
                                                        Jadikan Mahasiswa Eligible Seminar Proposal
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </GradientCard>
            </div>

            {/* Modal Picker Mahasiswa */}
            <EntityPickerModal
                open={isStudentModalOpen}
                onOpenChange={setIsStudentModalOpen}
                title="Pilih Mahasiswa untuk Dev Cheat"
                description="Cari mahasiswa berdasarkan nama atau NIM untuk memeriksa kelayakan seminar proposal."
                searchPlaceholder="Cari nama atau NIM mahasiswa..."
                entityTypeLabel="Mahasiswa"
                selectedId={selectedStudent?.id}
                onSelect={handleSelectStudent}
                fetcher={searchStudentsAction}
            />
        </div>
    );
}
