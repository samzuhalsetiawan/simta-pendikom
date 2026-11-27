import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPendadaranDetailById } from "@/lib/dal/seminar";
import { getGradeFromScore } from "@/lib/utils/scoring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Home, ChevronRight, Calendar, MapPin, Clock, CheckCircle2, XCircle, FileText, ArrowRight, UserCheck, Search, BookOpen, User, GraduationCap } from "lucide-react";
import { ScoreAssessmentDialog } from "@/components/seminar/score-assessment-dialog";
import { Metadata } from "next";
import { MarkSeminarCompletedButton } from "@/app/(main)/dashboard/_components/student/mark-seminar-completed-button";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    GradientCardDescription,
} from "@/components/shared/gradient-card";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const detail = await getPendadaranDetailById(id);
    if (!detail) return { title: "Detail Sidang Skripsi | SIMTA Pendikom" };
    return {
        title: `Sidang Skripsi - ${detail.student_name} | SIMTA Pendikom`,
        description: `Detail jadwal dan pelaksanaan ujian sidang skripsi ${detail.student_name} (${detail.student_nim}).`
    };
}

export default async function SidangSkripsiDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const detail = await getPendadaranDetailById(id);
    if (!detail) {
        notFound();
    }

    const username = session?.user?.username;
    const myRole = username ? detail.lecturers.find((l: any) => l.nip === username) : undefined;
    const myApproval = username ? detail.approvals.find((a: any) => a.lecturer_nip === username) : undefined;

    const formatDateTime = (isoString: string | null) => {
        if (!isoString) return "Belum dijadwalkan";
        const d = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
        }).format(d);
    };

    const getLecturerScore = (lec: any) => {
        if (lec.score !== null && lec.score !== undefined) {
            return { score: lec.score, grade: getGradeFromScore(lec.score) };
        }
        return null;
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-8 space-y-6">
            {/* Header & Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    <span>Home</span>
                </Link>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                <Link href="/sidang-skripsi" className="hover:text-foreground transition-colors">
                    <span>Sidang Skripsi</span>
                </Link>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                <span className="text-foreground font-bold truncate max-w-[200px]">{detail.student_name}</span>
            </div>

            {/* Top Section: Proposal Info & Skor Keseluruhan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Left Card (2 Spans): Info Skripsi & Mahasiswa */}
                <GradientCard variant="sidang-skripsi" className="md:col-span-2 border border-border/60">
                    <GradientCardHeader variant="sidang-skripsi" className="p-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <GradientCardTitle className="text-sm">Informasi Mahasiswa & Skripsi</GradientCardTitle>
                        </div>
                    </GradientCardHeader>
                    <div className="p-6 sm:p-7 flex flex-col justify-between space-y-6 flex-1">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Student Photo */}
                            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl shrink-0 border-2 border-border/50 shadow-sm">
                                <AvatarImage src={detail.student_image || "/default_user_photo.png"} className="object-cover rounded-2xl" />
                                <AvatarFallback className="bg-purple-500/10 text-3xl font-extrabold text-purple-600 rounded-2xl">
                                    {detail.student_name?.[0] || "?"}
                                </AvatarFallback>
                            </Avatar>

                            {/* Details */}
                            <div className="space-y-2 min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground leading-snug">
                                    {detail.thesis_title || "Judul Skripsi Belum Ditentukan"}
                                </h1>

                                <p className="text-sm font-medium text-muted-foreground pt-1">
                                    oleh <span className="font-bold text-foreground">{detail.student_name}</span>
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    NIM. {detail.student_nim}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Angkatan {detail.student_generation_year || "2020"}
                                </p>
                                <p className="text-xs text-muted-foreground pt-1">
                                    Pendidikan Komputer<br />
                                    Fakultas Keguruan dan Ilmu Pendidikan<br />
                                    Universitas Mulawarman
                                </p>
                            </div>
                        </div>
                    </div>
                </GradientCard>

                {/* Right Card (1 Span): Skor Keseluruhan */}
                <GradientCard variant="sidang-skripsi" className="md:col-span-1 border border-border/60">
                    <GradientCardHeader variant="sidang-skripsi" className="p-4 text-center">
                        <GradientCardTitle className="text-sm mx-auto">Skor Keseluruhan</GradientCardTitle>
                    </GradientCardHeader>
                    <div className="p-6 sm:p-7 flex flex-col justify-between items-center text-center space-y-6 flex-1">
                        <div className="space-y-4 my-auto w-full">
                            <div className="text-6xl sm:text-7xl font-extrabold tracking-tight py-2 flex flex-col items-center justify-center gap-3">
                                {detail.score !== null && detail.score !== undefined ? (
                                    <span className="text-purple-600 dark:text-purple-400">{getGradeFromScore(detail.score)}</span>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}

                                <div className="flex flex-wrap justify-center items-center gap-2 mt-1">
                                    {detail.score !== null && detail.score !== undefined && (
                                        <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-border/80 bg-background shadow-xs text-muted-foreground tracking-wide">
                                            Skor Nominal: {detail.score}
                                        </div>
                                    )}
                                    {detail.status === 'pass' ? (
                                        <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-emerald-500/40 bg-background shadow-xs text-emerald-600 dark:text-emerald-400 tracking-wide font-bold">
                                            Lulus Sidang
                                        </div>
                                    ) : detail.status === 'fail' ? (
                                        <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-rose-500/40 bg-background shadow-xs text-rose-600 dark:text-rose-400 tracking-wide font-bold">
                                            Tidak Lulus
                                        </div>
                                    ) : (
                                        <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-muted-foreground/30 bg-background shadow-xs text-muted-foreground tracking-wide">
                                            Belum Selesai
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </GradientCard>
            </div>

            {/* Middle Section: Tempat Waktu & Penilaian Dosen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Lihat Detail & Waktu/Tempat */}
                <div className="space-y-6">
                    {/* Aksi Cepat / Lihat Detail */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2 bg-muted/10">
                            <div className="p-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                                <Search className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-heading font-bold">Lihat Dokumen & Berkas</h3>
                                <p className="text-[10px] text-muted-foreground">Tautan cepat informasi sidang skripsi</p>
                            </div>
                        </div>
                        <div className="p-4 grid gap-3">
                            {/* 1. Skripsi */}
                            {detail.thesis_url && (
                                <a href={detail.thesis_url} target="_blank" rel="noopener noreferrer" className="block outline-none group">
                                    <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-xs rounded-xl transition-all cursor-pointer">
                                        <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold block truncate">Naskah Skripsi</span>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                    </div>
                                </a>
                            )}

                            {/* 2. Surat Permohonan Ujian Akhir */}
                            {detail.document_url && (
                                <a href={detail.document_url} target="_blank" rel="noopener noreferrer" className="block outline-none group">
                                    <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-xs rounded-xl transition-all cursor-pointer">
                                        <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-emerald-500/10 text-emerald-500">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold block truncate">Surat Permohonan Ujian Akhir</span>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                                    </div>
                                </a>
                            )}
                            
                            {/* 3. Surat Persetujuan */}
                            {(detail.status === 'pending_approval' || detail.status === 'pending_schedule' || detail.status === 'approved' || detail.status === 'pass' || detail.status === 'fail') && (
                                <Link href={`/persetujuan-sidang-skripsi/${id}`} className="block outline-none group">
                                    <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-xs rounded-xl transition-all cursor-pointer">
                                        <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold block truncate">Surat Persetujuan Sidang Skripsi</span>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0" />
                                    </div>
                                </Link>
                            )}

                            {/* 4. Profile Mahasiswa */}
                            <Link href={`/mahasiswa/${detail.student_nim}`} className="block outline-none group">
                                <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-xs rounded-xl transition-all cursor-pointer">
                                    <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-blue-500/10 text-blue-500">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold block truncate">Profil Mahasiswa</span>
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Left Card: Tempat dan Waktu Pelaksanaan */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-7 shadow-xs space-y-5">
                        <h2 className="text-base font-bold text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span>Tempat dan Waktu Pelaksanaan</span>
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Waktu Pelaksanaan</span>
                                    <p className="mt-0.5 text-sm font-bold text-foreground">
                                        {formatDateTime(detail.scheduled_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Ruangan / Tempat</span>
                                    <p className="mt-0.5 text-sm font-bold text-foreground">
                                        {detail.venue || "Belum ditentukan"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Aksi Selesai Sidang */}
                        <div className="pt-4 border-t border-border/40">
                            {detail.status === 'approved' ? (
                                <MarkSeminarCompletedButton 
                                    seminarId={id} 
                                    type="pendadaran" 
                                    className="w-full" 
                                    scheduledDate={detail.scheduled_date}
                                    canOverride={session?.user?.role?.includes('staff')}
                                />
                            ) : (
                                <div className="p-3 bg-muted/40 rounded-xl text-center text-xs text-muted-foreground">
                                    {detail.status === 'pass' ? 'Ujian sidang skripsi telah selesai dilaksanakan.' :
                                     detail.status === 'fail' ? 'Ujian sidang skripsi dinyatakan tidak lulus.' :
                                     'Sidang skripsi belum dijadwalkan secara definitif.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Dewan Penguji & Pembimbing */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-7 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div>
                                <h2 className="text-base font-bold text-foreground">Dewan Penguji & Pembimbing</h2>
                                <p className="text-xs text-muted-foreground">Daftar dosen pembimbing dan penguji ujian sidang skripsi.</p>
                            </div>
                            <Badge variant="outline" className="font-semibold text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                                {detail.lecturers.length} Dosen
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {detail.lecturers.map((lec: any) => {
                                const isSupervisor = lec.role === 'supervisor';
                                const roleLabel = isSupervisor 
                                    ? `Dosen Pembimbing ${lec.position || ''}` 
                                    : `Dosen Penguji ${lec.position || ''}`;
                                const isMe = username === lec.nip;
                                const lecApproval = detail.approvals.find((a: any) => a.lecturer_nip === lec.nip);
                                const lecturerScore = getLecturerScore(lec);

                                return (
                                    <div 
                                        key={lec.nip} 
                                        className={`p-4 rounded-xl border transition-all ${
                                            isMe 
                                                ? 'bg-purple-500/5 border-purple-500/40 ring-1 ring-purple-500/20' 
                                                : 'bg-card border-border/50 hover:border-border'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-10 w-10 shrink-0 border border-border/60">
                                                    <AvatarImage src={lec.image || "/default_user_photo.png"} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                        {lec.name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <h4 className="text-sm font-bold text-foreground truncate">
                                                            {lec.name}
                                                        </h4>
                                                        {isMe && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-purple-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                                                                Anda
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        NIP. {lec.nip}
                                                    </p>
                                                    <span className="inline-block text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                                                        {roleLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Score / Dialog */}
                                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                                                {lecturerScore ? (
                                                    <div className="text-right">
                                                        <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                                                            <span>Nilai: {lecturerScore.score}</span>
                                                            <span>({lecturerScore.grade})</span>
                                                        </div>
                                                    </div>
                                                ) : isMe && detail.status === 'approved' ? (
                                                    <ScoreAssessmentDialog 
                                                        seminarId={id} 
                                                        type="pendadaran" 
                                                        studentName={detail.student_name} 
                                                        thesisTitle={detail.thesis_title || "Skripsi"} 
                                                    />
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground italic">
                                                        Belum dinilai
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
