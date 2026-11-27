import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLecturerProfile } from "@/lib/dal/profile";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import {
    BookOpen,
    Users,
    Presentation,
    Award,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    GraduationCap,
    Home
} from "lucide-react";
import ProfileCard from "@/components/profile/profile-card";
import { 
    GradientCard, 
    GradientCardHeader, 
    GradientCardTitle, 
    GradientCardDescription 
} from "@/components/shared/gradient-card";

function getProgressLabel(progress: string): string {
    switch (progress) {
        case "pengajuan_proposal": return "Pengajuan Proposal";
        case "seminar_proposal": return "Seminar Proposal";
        case "penelitian": return "Penelitian";
        case "seminar_hasil": return "Seminar Hasil";
        case "pendadaran": return "Sidang Skripsi";
        case "lulus": return "Lulus Skripsi";
        default: return progress;
    }
}

function getProgressBadgeVariant(progress: string) {
    switch (progress) {
        case "lulus":
            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
        case "pendadaran":
            return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
        case "seminar_hasil":
            return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
        case "penelitian":
            return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
        case "seminar_proposal":
            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        case "pengajuan_proposal":
        default:
            return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    }
}


export default async function DosenProfilePage({
    params
}: {
    params: Promise<{ nip: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { nip } = await params;
    const profile = await getLecturerProfile(nip);

    if (!profile) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold font-heading">Dosen Tidak Ditemukan</h2>
                        <p className="text-sm text-muted-foreground">
                            Data dosen dengan NIP <span className="font-mono font-bold text-foreground">{nip}</span> tidak terdaftar di sistem.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl mt-2 font-semibold border-border">
                        <Link href="/dosen" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Direktori Dosen
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.username === nip;
    const sanitizedProfile = {
        ...profile,
        hasSignature: !!profile.signaturePath,
        signaturePath: isOwner ? profile.signaturePath : null,
    };
    const { lecturerDetails } = profile;
    const activeSupervised = lecturerDetails.supervised_students.filter(s => s.progress !== "lulus");
    const graduatedSupervised = lecturerDetails.supervised_students.filter(s => s.progress === "lulus");

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <main className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <Link href="/dosen" className="hover:text-foreground transition-colors">
                        Dosen
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <span className="text-foreground font-bold truncate max-w-[240px]">{profile.name}</span>
                </div>

                {/* Page Title & Quick Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                    <div>
                        <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Profil Dosen</p>
                        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
                            {profile.name}
                        </h1>
                    </div>
                </div>

                {/* 2-Column Layout matching Dashboard: Main (2fr) + Sidebar (1fr) */}
                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    {/* Main Column (2fr): Bimbingan & Pengujian Information */}
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* 1. Statistics Summary Card */}
                        <GradientCard variant="primary" className="shadow-sm">
                            <GradientCardHeader variant="primary">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <GradientCardTitle>Statistik Bimbingan & Pengujian</GradientCardTitle>
                                        <GradientCardDescription>Ringkasan beban kerja akademik dan bimbingan tugas akhir</GradientCardDescription>
                                    </div>
                                </div>
                            </GradientCardHeader>

                            <div className="p-5 sm:p-6">
                                <div className="grid sm:grid-cols-3 gap-3.5">
                                    {/* Active Supervised */}
                                    <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-primary">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bimbingan Aktif</span>
                                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                                <Users className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                                                {lecturerDetails.supervising_active_count}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-0.5">Sedang dalam proses</p>
                                        </div>
                                    </div>

                                    {/* Graduated Supervised */}
                                    <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bimbingan Lulus</span>
                                            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                                <Award className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                                                {lecturerDetails.supervising_graduated_count}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-0.5">Telah menyelesaikan skripsi</p>
                                        </div>
                                    </div>

                                    {/* Examined */}
                                    <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mahasiswa Diuji</span>
                                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                                                <Presentation className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                                                {lecturerDetails.examining_count}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-0.5">Sebagai dewan penguji</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GradientCard>

                        {/* 2. Supervised Students Card */}
                        <GradientCard variant="primary" className="shadow-sm">
                            <GradientCardHeader variant="primary">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <GradientCardTitle>Mahasiswa Bimbingan</GradientCardTitle>
                                        <GradientCardDescription>Daftar mahasiswa yang dibimbing dalam pengerjaan skripsi</GradientCardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5 border-border/60">
                                    Total: {lecturerDetails.supervising_count} Mahasiswa
                                </Badge>
                            </GradientCardHeader>

                            <div className="p-5 sm:p-6 space-y-6">
                                {/* Active Students Section */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-foreground flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary" />
                                        Bimbingan Aktif ({activeSupervised.length})
                                    </p>

                                    {activeSupervised.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {activeSupervised.map((student) => (
                                                <Link
                                                    key={student.nim}
                                                    href={`/mahasiswa/${student.nim}`}
                                                    title={student.thesis_title || undefined}
                                                    className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all"
                                                >
                                                    <Avatar className="h-10 w-10 shrink-0 border border-border">
                                                        <AvatarImage src={student.image || "/default_user_photo.png"} className="object-cover" />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                            {student.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                                                                Pembimbing {student.position}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <Badge className={`${getProgressBadgeVariant(student.progress)} font-bold text-[9px] px-1.5 py-0 h-4`}>
                                                                    {getProgressLabel(student.progress)}
                                                                </Badge>
                                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-mono">
                                                            NIM: {student.nim} • Angkatan {student.generation_year}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic py-2">Tidak ada mahasiswa bimbingan yang sedang aktif saat ini.</p>
                                    )}
                                </div>

                                {/* Graduated Students Section */}
                                {graduatedSupervised.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border/60">
                                        <p className="text-xs font-bold text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                            Telah Lulus ({graduatedSupervised.length})
                                        </p>

                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {graduatedSupervised.slice(0, 6).map((student) => (
                                                <Link
                                                    key={student.nim}
                                                    href={`/mahasiswa/${student.nim}`}
                                                    className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:border-emerald-500/40 hover:bg-muted/40 transition-all text-xs"
                                                >
                                                    <Avatar className="h-9 w-9 shrink-0 border border-border">
                                                        <AvatarImage src={student.image || "/default_user_photo.png"} className="object-cover" />
                                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                                                            {student.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                                                Lulus
                                                            </span>
                                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-600 transition-all" />
                                                        </div>
                                                        <p className="text-xs font-bold text-foreground truncate group-hover:text-emerald-600 transition-colors">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-mono">
                                                            NIM: {student.nim} • Angkatan {student.generation_year}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        {graduatedSupervised.length > 6 && (
                                            <p className="text-[11px] text-muted-foreground text-center pt-1 italic">
                                                +{graduatedSupervised.length - 6} mahasiswa lulus lainnya
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </GradientCard>

                        {/* 3. Examined Students Card */}
                        <GradientCard variant="primary" className="shadow-sm">
                            <GradientCardHeader variant="primary">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                                        <Presentation className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <GradientCardTitle>Mahasiswa yang Diuji</GradientCardTitle>
                                        <GradientCardDescription>Daftar mahasiswa yang diuji dalam seminar atau sidang ujian skripsi</GradientCardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5 border-border/60">
                                    Total: {lecturerDetails.examined_students.length} Mahasiswa
                                </Badge>
                            </GradientCardHeader>

                            <div className="p-5 sm:p-6">
                                {lecturerDetails.examined_students.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {lecturerDetails.examined_students.map((student) => (
                                            <Link
                                                key={student.nim}
                                                href={`/mahasiswa/${student.nim}`}
                                                className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all"
                                            >
                                                <Avatar className="h-10 w-10 shrink-0 border border-border">
                                                    <AvatarImage src={student.image || "/default_user_photo.png"} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                        {student.name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                                                            Penguji {student.position}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <Badge className={`${getProgressBadgeVariant(student.progress)} font-bold text-[9px] px-1.5 py-0 h-4`}>
                                                                {getProgressLabel(student.progress)}
                                                            </Badge>
                                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground font-mono">
                                                        NIM: {student.nim}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 space-y-1 text-muted-foreground">
                                        <Presentation className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                                        <p className="text-xs italic">Belum ada catatan mahasiswa yang diuji.</p>
                                    </div>
                                )}
                            </div>
                        </GradientCard>
                    </div>

                    {/* Sidebar Column (1fr): ProfileCard */}
                    <div className="lg:col-span-1 space-y-6 min-w-0">
                        <ProfileCard 
                            profile={sanitizedProfile} 
                            isOwner={isOwner} 
                            showSignature={true}
                            roleVariant="lecturer" 
                            cardVariant="primary"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
