import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentProfile } from "@/lib/dal/profile";
import { getStudentProposal } from "@/lib/dal/proposal";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import {
    FileText,
    Clock,
    ChevronRight,
    ArrowLeft,
    Users,
    Activity,
    BookOpen,
    AlertCircle,
    Home,
    Presentation,
    MessageCircle
} from "lucide-react";
import ProfileCard from "@/components/profile/profile-card";
import StudentProgressPipeline from "@/components/shared/student-progress-pipeline";
import ResearchSummaryWidget from "@/components/shared/research-summary-widget";
import { 
    GradientCard, 
    GradientCardHeader, 
    GradientCardTitle, 
    GradientCardDescription,
    type GradientCardVariant 
} from "@/components/shared/gradient-card";

const STAGE_VARIANT_MAP: Record<string, GradientCardVariant> = {
    pengajuan_proposal: "pengajuan-proposal",
    seminar_proposal: "seminar-proposal",
    penelitian: "penelitian",
    seminar_hasil: "seminar-hasil",
    pendadaran: "sidang-skripsi",
    lulus: "lulus",
};

const getActivityIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (["seminar_proposal", "seminar_hasil", "sidang_skripsi"].includes(cat)) {
        return <Presentation className="w-3.5 h-3.5" />;
    }
    if (cat === "konsultasi") {
        return <MessageCircle className="w-3.5 h-3.5" />;
    }
    if (["proposal", "skripsi"].includes(cat)) {
        return <FileText className="w-3.5 h-3.5" />;
    }
    return <Clock className="w-3.5 h-3.5" />;
};

export default async function MahasiswaProfilePage({
    params
}: {
    params: Promise<{ nim: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { nim } = await params;
    const [profile, proposalData] = await Promise.all([
        getStudentProfile(nim),
        getStudentProposal(nim)
    ]);

    if (!profile) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold font-heading">Mahasiswa Tidak Ditemukan</h2>
                        <p className="text-sm text-muted-foreground">
                            Data mahasiswa dengan NIM <span className="font-mono font-bold text-foreground">{nim}</span> tidak terdaftar di sistem.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl mt-2 font-semibold border-border">
                        <Link href="/mahasiswa" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Direktori Mahasiswa
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.username === nim;
    const sanitizedProfile = {
        ...profile,
        signaturePath: isOwner ? profile.signaturePath : null,
    };
    const { studentDetails } = profile;
    const thesis = studentDetails.thesis;
    const activeStageVariant = (thesis?.progress && STAGE_VARIANT_MAP[thesis.progress]) || "primary";

    // Progress skripsi mahasiswa: jika belum lulus seminar proposal, tampilkan proposal; jika sudah lulus, tampilkan skripsi
    const isPassedSeminarProposal = !!(thesis?.progress && ['penelitian', 'seminar_hasil', 'pendadaran', 'lulus'].includes(thesis.progress));

    const summaryConfig = isPassedSeminarProposal ? {
        title: "Informasi Skripsi",
        description: isOwner ? "Detail informasi tugas akhir kamu." : "Detail informasi tugas akhir mahasiswa.",
        data: thesis,
        actionLink: thesis ? `/skripsi/${thesis.id}` : "#",
        actionLabel: "Lihat Detail Skripsi",
        actionDisabled: !thesis,
        icon: <BookOpen className="h-4 w-4 text-primary" />
    } : {
        title: "Informasi Proposal",
        description: isOwner ? "Informasi pengajuan proposal kamu." : "Informasi pengajuan proposal tugas akhir mahasiswa.",
        data: proposalData,
        actionLink: proposalData ? `/skripsi/${proposalData.id}` : "#",
        actionLabel: "Lihat Detail Proposal",
        actionDisabled: !proposalData,
        icon: <FileText className="h-4 w-4 text-primary" />
    };

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
                    <Link href="/mahasiswa" className="hover:text-foreground transition-colors">
                        Mahasiswa
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <span className="text-foreground font-bold truncate max-w-[240px]">{profile.name}</span>
                </div>

                {/* Page Title & Quick Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                    <div>
                        <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Profil Mahasiswa</p>
                        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
                            {profile.name}
                        </h1>
                    </div>
                </div>

                {/* 2-Column Layout matching Dashboard: Main (2fr) + Sidebar (1fr) */}
                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    {/* Main Column (2fr): Academic & Thesis Info */}
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* 1. Academic & Thesis Progress Pipeline (Exact component from Dashboard) */}
                        <StudentProgressPipeline currentProgress={thesis?.progress || null} />

                        {/* 2. Proposal / Thesis Summary (Dinamis: Proposal jika belum lulus seminar proposal, Skripsi jika sudah lulus) */}
                        <ResearchSummaryWidget 
                            title={summaryConfig.title}
                            description={summaryConfig.description}
                            data={summaryConfig.data}
                            actionLink={summaryConfig.actionLink}
                            actionLabel={summaryConfig.actionLabel}
                            actionDisabled={summaryConfig.actionDisabled}
                            icon={summaryConfig.icon}
                            variant={activeStageVariant}
                        />

                        {/* 2b. Supervising & Examining Team Card */}
                        {thesis && (
                            <GradientCard variant={activeStageVariant} className="shadow-sm">
                                <GradientCardHeader variant={activeStageVariant}>
                                    <div className="flex items-start gap-2.5">
                                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <GradientCardTitle>Dosen Pembimbing & Penguji</GradientCardTitle>
                                            <GradientCardDescription>Daftar dosen pembimbing dan penguji skripsi</GradientCardDescription>
                                        </div>
                                    </div>
                                </GradientCardHeader>

                                <div className="p-5 sm:p-6 space-y-6">
                                    <div className="space-y-4">
                                        {/* Supervisors */}
                                        <div className="space-y-2.5">
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-primary" />
                                                Dosen Pembimbing
                                            </p>
                                            {studentDetails.supervisors.length > 0 ? (
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {studentDetails.supervisors.map((sp) => (
                                                        <Link
                                                            key={sp.nip}
                                                            href={`/dosen/${sp.nip}`}
                                                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all"
                                                        >
                                                            <Avatar className="h-10 w-10 shrink-0 border border-border">
                                                                <AvatarImage src={sp.image || "/default_user_photo.png"} className="object-cover" />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                                    {sp.name[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                                        Pembimbing {sp.position}
                                                                    </span>
                                                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                                </div>
                                                                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                                    {sp.name}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground font-mono">NIP: {sp.nip}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic py-1">Belum ada dosen pembimbing yang ditugaskan.</p>
                                            )}
                                        </div>

                                        {/* Examiners */}
                                        <div className="space-y-2.5 pt-2">
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-primary" />
                                                Dosen Penguji
                                            </p>
                                            {studentDetails.examiners.length > 0 ? (
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {studentDetails.examiners.map((ex) => (
                                                        <Link
                                                            key={ex.nip}
                                                            href={`/dosen/${ex.nip}`}
                                                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all"
                                                        >
                                                            <Avatar className="h-10 w-10 shrink-0 border border-border">
                                                                <AvatarImage src={ex.image || "/default_user_photo.png"} className="object-cover" />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                                    {ex.name[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                                        Penguji {ex.position}
                                                                    </span>
                                                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                                </div>
                                                                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                                    {ex.name}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground font-mono">NIP: {ex.nip}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic py-1">Belum ada dosen penguji yang ditugaskan.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GradientCard>
                        )}

                        {/* 3. Activity & Bimbingan Overview Card */}
                        <GradientCard variant={activeStageVariant} className="shadow-sm">
                            <GradientCardHeader variant={activeStageVariant}>
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5 text-primary">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <GradientCardTitle>Aktivitas & Riwayat Bimbingan</GradientCardTitle>
                                        <GradientCardDescription>Log aktivitas bimbingan dan konsultasi tugas akhir</GradientCardDescription>
                                    </div>
                                </div>
                            </GradientCardHeader>

                            <div className="p-5 sm:p-6 space-y-4">
                                {studentDetails.recent_activities.length > 0 ? (
                                    <div className="flex flex-col">
                                        {studentDetails.recent_activities.map((act, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0 last:pb-0 first:pt-0"
                                            >
                                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                    {getActivityIcon(act.category)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-medium text-foreground">{act.description}</p>
                                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                                            {new Date(act.created_at).toLocaleDateString("id-ID", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 space-y-1 text-muted-foreground">
                                        <Clock className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                                        <p className="text-xs italic">Belum ada aktivitas yang tercatat baru-baru ini.</p>
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
                            showSignature={isOwner}
                            roleVariant="student" 
                            cardVariant={activeStageVariant} 
                            generationYear={studentDetails.generation_year}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
