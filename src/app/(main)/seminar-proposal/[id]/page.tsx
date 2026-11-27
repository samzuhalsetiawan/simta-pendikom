import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSeminarProposalDetailById } from "@/lib/dal/seminar";
import { getGradeFromScore } from "@/lib/utils/scoring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Home, ChevronRight, Calendar, MapPin, Clock, Users, CheckCircle2, XCircle, FileText, ArrowRight, UserCheck, Search, BookOpen, User, Star } from "lucide-react";
import { ScoreAssessmentDialog } from "@/components/seminar/score-assessment-dialog";
import { Metadata } from "next";
import { MarkSeminarCompletedButton } from "@/app/(main)/dashboard/_components/student/mark-seminar-completed-button";
import SeminarQRButton from "@/app/(main)/dashboard/_components/student/seminar-qr-button";
import SeminarAttendanceWidget from "@/components/seminar/seminar-attendance-widget";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const detail = await getSeminarProposalDetailById(id);
    if (!detail) return { title: "Detail Seminar Proposal | SIMTA Pendikom" };
    return {
        title: `Seminar Proposal - ${detail.student_name} | SIMTA Pendikom`,
        description: `Detail jadwal dan pelaksanaan seminar proposal skripsi ${detail.student_name} (${detail.student_nim}).`
    };
}

export default async function SeminarProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const detail = await getSeminarProposalDetailById(id);
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



    const getLecturerScore = (lec: any, approvalStatus?: string) => {
        if (lec.score !== null && lec.score !== undefined) {
            return { score: lec.score, grade: getGradeFromScore(lec.score) };
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            
            <main className="container mx-auto max-w-5xl px-4 py-6 sm:px-8 space-y-6">
                {/* Header & Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <Link href="/seminar-proposal" className="hover:text-foreground transition-colors">
                        <span>Seminar Proposal</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <span className="text-foreground font-bold truncate max-w-[400px]">{detail.thesis_title || "Judul Belum Ditentukan"}</span>
                </div>

                {/* Top Section: Proposal Info & Skor Keseluruhan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* Left Card (2 Spans): Info Proposal & Mahasiswa */}
                    <GradientCard className="md:col-span-2 h-full" >
                        <GradientCardHeader >
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <GradientCardTitle>Informasi Proposal</GradientCardTitle>
                                    <GradientCardDescription>Detail mahasiswa dan judul proposal skripsi.</GradientCardDescription>
                                </div>
                            </div>
                        </GradientCardHeader>
                        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 flex-1">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                {/* Student Photo */}
                                <Avatar className="h-32 w-32 sm:h-36 sm:w-36 rounded-2xl shrink-0 border border-border/50 shadow-sm">
                                    <AvatarImage src={detail.student_image || "/default_user_photo.png"} className="object-cover rounded-2xl" />
                                    <AvatarFallback className="bg-primary/10 text-4xl font-extrabold text-primary rounded-2xl">
                                        {detail.student_name?.[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Details */}
                                <div className="space-y-2 min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground leading-snug">
                                        {detail.thesis_title || "Judul Proposal Belum Ditentukan"}
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
                    <GradientCard className="md:col-span-1 h-full" >
                        <GradientCardHeader >
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                    <Star className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <GradientCardTitle>Penilaian</GradientCardTitle>
                                    <GradientCardDescription>Skor keseluruhan seminar.</GradientCardDescription>
                                </div>
                            </div>
                        </GradientCardHeader>
                        <div className="p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6 flex-1">
                            <div className="space-y-4 my-auto w-full">
                                <span className="text-sm font-bold text-muted-foreground tracking-wide">
                                    Skor Keseluruhan
                                </span>
                                <div className="text-6xl sm:text-7xl font-extrabold tracking-tight py-2 flex flex-col items-center justify-center gap-3">
                                    {detail.score !== null && detail.score !== undefined ? (
                                        <span className="text-primary">{getGradeFromScore(detail.score)}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}

                                    <div className="flex flex-wrap justify-center items-center gap-2 mt-1">
                                        {detail.score !== null && detail.score !== undefined && (
                                            <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-border/80 bg-background shadow-sm text-muted-foreground tracking-wide">
                                                Skor Nominal: {detail.score}
                                            </div>
                                        )}
                                        {detail.status === 'pass' ? (
                                            <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-emerald-500/40 bg-background shadow-sm text-emerald-600 dark:text-emerald-400 tracking-wide">
                                                Lulus
                                            </div>
                                        ) : detail.status === 'fail' ? (
                                            <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-rose-500/40 bg-background shadow-sm text-rose-600 dark:text-rose-400 tracking-wide">
                                                Gagal
                                            </div>
                                        ) : (
                                            <div className="text-xs font-medium px-4 py-1.5 rounded-full border border-muted-foreground/30 bg-background shadow-sm text-muted-foreground tracking-wide">
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
                        <GradientCard >
                            <GradientCardHeader >
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                        <Search className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <GradientCardTitle>Lihat Detail</GradientCardTitle>
                                        <GradientCardDescription>Tautan cepat informasi seminar.</GradientCardDescription>
                                    </div>
                                </div>
                            </GradientCardHeader>
                            <div className="p-5 grid gap-3">
                                {/* 1. Proposal */}
                                {detail.thesis_id ? (
                                    <Link href={`/skripsi/${detail.thesis_id}`} className="block outline-none group">
                                        <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-sm rounded-xl transition-all cursor-pointer">
                                            <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-bold block truncate">Proposal</span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                        </div>
                                    </Link>
                                ) : detail.proposal_url ? (
                                    <a href={detail.proposal_url} target="_blank" rel="noopener noreferrer" className="block outline-none group">
                                        <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-sm rounded-xl transition-all cursor-pointer">
                                            <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-bold block truncate">Proposal</span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                        </div>
                                    </a>
                                ) : null}
                                
                                {/* 2. Surat Persetujuan */}
                                {(detail.status === 'approved' || detail.status === 'pass' || detail.status === 'fail') && (
                                    <Link href={`/persetujuan-seminar-proposal/${id}`} className="block outline-none group">
                                        <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-sm rounded-xl transition-all cursor-pointer">
                                            <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-amber-500/10 text-amber-500">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-bold block truncate">Surat Persetujuan Seminar Proposal</span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
                                        </div>
                                    </Link>
                                )}

                                {/* 3. Profile Mahasiswa */}
                                <Link href={`/mahasiswa/${detail.student_nim}`} className="block outline-none group">
                                    <div className="w-full h-12 flex items-center gap-3 px-3 bg-muted/30 hover:bg-muted text-foreground border border-border/50 shadow-sm rounded-xl transition-all cursor-pointer">
                                        <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform bg-blue-500/10 text-blue-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold block truncate">Profile Mahasiswa</span>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                                    </div>
                                </Link>
                            </div>
                        </GradientCard>

                        {/* Left Card: Tempat dan Waktu Pelaksanaan */}
                        <GradientCard >
                            <GradientCardHeader >
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <GradientCardTitle>Tempat & Waktu</GradientCardTitle>
                                        <GradientCardDescription>Jadwal pelaksanaan seminar proposal.</GradientCardDescription>
                                    </div>
                                </div>
                            </GradientCardHeader>
                            <div className="p-5 space-y-5">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                                                {detail.venue || "Belum ditentukan / Daring"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {detail.rejection_reason && (
                                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-600 dark:text-rose-400 mt-4">
                                        <strong className="font-bold">Catatan / Alasan Penolakan:</strong> {detail.rejection_reason}
                                    </div>
                                )}

                                {/* Aksi Seminar: Tandai Selesai */}
                                {detail.status === 'approved' && (detail.student_nim === session?.user?.username || session?.user?.role?.includes('staff')) && (
                                    <div className="pt-2">
                                        <MarkSeminarCompletedButton 
                                            seminarId={id} 
                                            type="proposal" 
                                            className="w-full" 
                                            scheduledDate={detail.scheduled_date}
                                            canOverride={session?.user?.role?.includes('staff')}
                                        />
                                    </div>
                                )}
                            </div>
                        </GradientCard>
                    </div>

                    {/* Right Card: Penilaian Dosen */}
                    <GradientCard className="h-full" >
                        <GradientCardHeader >
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <GradientCardTitle>Penilaian Dosen</GradientCardTitle>
                                    <GradientCardDescription>Rekapitulasi nilai dari dosen pembimbing dan penguji.</GradientCardDescription>
                                </div>
                            </div>
                        </GradientCardHeader>
                        <div className="p-5 space-y-4 divide-y divide-border/30">
                            {detail.lecturers.map((lec: any) => {
                                const approval = detail.approvals.find((a: any) => a.lecturer_nip === lec.nip);
                                const scoreInfo = getLecturerScore(lec, approval?.status);

                                return (
                                    <div key={lec.nip} className="pt-4 pb-1 first:pt-1 flex items-start justify-between gap-3">
                                        <div className="flex gap-3.5 min-w-0 items-center">
                                            <Avatar className="h-10 w-10 border border-border/60 shadow-sm shrink-0">
                                                <AvatarImage src={lec.image || ''} alt={lec.name} className="object-cover" />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{lec.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1 min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {lec.role === 'supervisor' ? `Pembimbing ${lec.position}` : `Penguji ${lec.position}`}
                                                </span>
                                                <p className="text-xs font-bold text-foreground truncate">
                                                    {lec.name}
                                                </p>
                                                <p className="text-[11px] font-mono text-muted-foreground">
                                                    {lec.nip}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex flex-col items-end justify-center h-10 gap-1">
                                            {session?.user?.username === lec.nip && detail.status === 'approved' ? (
                                                <ScoreAssessmentDialog 
                                                    seminarId={id} 
                                                    type="proposal" 
                                                    currentScore={scoreInfo?.score ?? null} 
                                                />
                                            ) : scoreInfo ? (
                                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1">
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                        Nilai: {scoreInfo.score}
                                                    </span>
                                                    <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 border-l border-emerald-500/30 pl-2">
                                                        {scoreInfo.grade}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2.5 py-1">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-muted-foreground font-bold text-xs">Belum Menilai</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GradientCard>
                </div>

                {/* Bottom Section: Penonton Seminar */}
                <GradientCard >
                    <GradientCardHeader >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <GradientCardTitle>Penonton Seminar</GradientCardTitle>
                                    <GradientCardDescription>Daftar mahasiswa yang hadir.</GradientCardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-transparent font-bold">
                                    {detail.spectators?.length || detail.spectators_count || 0} Hadir / Terdaftar
                                </Badge>
                                {session?.user && detail.student_nim !== session?.user?.username && (
                                    <SeminarAttendanceWidget seminarId={id} type="proposal" />
                                )}
                                {detail.status === 'approved' && detail.student_nim === session?.user?.username && detail.scheduled_date && (
                                    <SeminarQRButton scheduledDate={detail.scheduled_date} seminarId={id} type="proposal" />
                                )}
                            </div>
                        </div>
                    </GradientCardHeader>
                    <div className="p-5 space-y-5">
                        {detail.spectators && detail.spectators.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                                {detail.spectators.map((spec: any) => (
                                    <div key={spec.id || spec.nim} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarImage src={spec.image || `/api/avatar/${spec.nim}`} alt={spec.name} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                {spec.name?.[0] || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{spec.name}</p>
                                            <p className="text-[10px] font-mono text-muted-foreground">{spec.nim}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground py-4 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                                Belum ada penonton yang terdaftar untuk seminar proposal ini.
                            </p>
                        )}
                    </div>
                </GradientCard>
            </main>
        </div>
    );
}
