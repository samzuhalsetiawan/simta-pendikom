import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import Link from "next/link";
import { 
    Calendar, 
    AlertCircle,
    Presentation,
    Search,
    GraduationCap,
    FileText,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle,
    IdCard,
    Mail,
    User,
    BookOpen,
    ChevronRight,
    Lock,
    MessageSquare,
    ArrowRight
} from "lucide-react";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";
import { getStudentDashboardData } from "@/lib/dal/student";
import { getStudentConsultations } from "@/lib/dal/consultation";
import { getSeminarProposalStatus, getSeminarHasilStatus, getPendadaranStatus, getSeminarAttendances, getUpcomingSpectatingSeminars } from "@/lib/dal/seminar";
import { getGraduationChecklists } from "@/lib/dal/graduation";
import { getStudentProposal } from "@/lib/dal/proposal";
import { getExternalDocumentUrls } from "@/lib/dal/external-document";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { MIN_SEMINAR_ATTENDANCE } from "@/lib/constants/thesis";

import DashboardSidebar from "../_components/shared/dashboard-sidebar";

import StudentProgressPipeline from "@/components/shared/student-progress-pipeline";
import { ApprovalStatusList } from "../_components/shared/approval-status-list";
import ResearchSummaryWidget from "@/components/shared/research-summary-widget";
import { LecturersInfoCardList } from "@/components/shared/lecturers-info-card-list";
import { getLecturersInfoCardData } from "@/lib/dal/thesis";
import { ConsultationModal } from "../_components/student/consultation-modal";
import RequestProposalApprovalButton from "../_components/student/request-proposal-approval-button";
import CancelProposalApprovalButton from "../_components/student/cancel-proposal-approval-button";
import { MultiRoleSwitcher } from "../_components/shared/multi-role-switcher";
import { DashboardActionTrackerProvider } from "../_components/shared/dashboard-action-tracker";
import ConsultationHistoryWidget from "../_components/student/consultation-history-widget";
import UpcomingAgendaWidget from "../_components/student/upcoming-agenda-widget";

import RequestSeminarProposal from "../_components/student/request-seminar-proposal";
import RequestSeminarHasil from "../_components/student/request-seminar-hasil";
import RequestPendadaran from "../_components/student/request-pendadaran";
import { SuratPermohonanWidget } from "../_components/student/surat-permohonan-widget";
import { GraduationChecklist } from "@/components/graduation-checklist";
import SeminarQRButton from "../_components/student/seminar-qr-button";
import { MarkSeminarCompletedButton } from "../_components/student/mark-seminar-completed-button";
import ResearchDocumentsWidget from "../_components/student/research-documents-widget";
import { SidangSkripsiMiniStepper } from "../_components/student/sidang-skripsi-mini-stepper";



export default async function StudentDashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/login");
    const roles = JSON.parse(session.user.role || "[]") as string[];
    if (!roles.includes("student")) redirect("/");

    const [
        { thesis, lecturers },
        consultations,
        attendances,
        checklists,
        proposalData,
        externalDocuments,
        spectatingSeminars
    ] = await Promise.all([
        getStudentDashboardData(session.user.username),
        getStudentConsultations(session.user.username),
        getSeminarAttendances(session.user.username),
        getGraduationChecklists(session.user.username),
        getStudentProposal(session.user.username),
        getExternalDocumentUrls(),
        getUpcomingSpectatingSeminars(session.user.username)
    ]);

    const seminarStatus = thesis ? await getSeminarProposalStatus(thesis.id) : null;
    const seminarHasilStatus = thesis ? await getSeminarHasilStatus(thesis.id) : null;
    const pendadaranStatus = thesis ? await getPendadaranStatus(session.user.username) : null;
    const displayLecturers = thesis ? await getLecturersInfoCardData(thesis.id) : [];

    const supervisors = lecturers.filter(l => l.role === 'supervisor');
    const examiners = lecturers.filter(l => l.role === 'examiner');

    const renderApprovalBadge = (status: string) => {
        if (status === 'pending_schedule') {
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Menunggu Jadwal dari Staff</Badge>;
        }
        if (status === 'pending_approval') {
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Menunggu Persetujuan Dosen</Badge>;
        }
        if (status === 'pending_document') {
            return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Menunggu Upload Surat</Badge>;
        }
        if (status === 'pending_staff_approval') {
            return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Verifikasi Surat oleh Staff</Badge>;
        }
        if (status === 'approved' || status === 'pass' || status === 'fail') {
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Disetujui</Badge>;
        }
        if (status === 'rejected') {
            return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Ditolak</Badge>;
        }
        return null;
    }

    const renderGraduationBadge = (status: string) => {
        if (status === 'pass') {
            return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Lulus</Badge>;
        }
        if (status === 'fail') {
            return <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Gagal</Badge>;
        }
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Belum Selesai</Badge>;
    }

    const formatDateOnly = (isoString: string | null) => {
        if (!isoString) return "Belum dijadwalkan";
        return new Date(isoString).toLocaleDateString('id-ID', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    };

    const formatTimeOnly = (isoString: string | null) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const renderSeminarStatusDetail = (
        status: { id: string | number; scheduled_date: string | null; status: string; venue: string | null; rejection_reason: string | null; approvals?: any[] },
        colorAccent: string,
        type: 'proposal' | 'hasil' | 'pendadaran'
    ) => {
        const typeLabel = type === 'proposal' ? 'Seminar Proposal' : type === 'hasil' ? 'Seminar Hasil' : 'Sidang Skripsi';
        const detailUrl = type === 'proposal' ? `/seminar-proposal/${status.id}` : type === 'hasil' ? `/seminar-hasil/${status.id}` : `/sidang-skripsi/${status.id}`;
        const suratUrl = type === 'proposal' ? `/persetujuan-seminar-proposal/${status.id}` : type === 'hasil' ? `/persetujuan-seminar-hasil/${status.id}` : `/persetujuan-sidang-skripsi/${status.id}`;
        const titleText = thesis?.title || proposalData?.title || "Judul belum ditentukan";

        return (
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pt-2 relative group/item">
                    <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Lihat Detail ${typeLabel}`} />
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${colorAccent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {renderApprovalBadge(status.status)}
                                    {renderGraduationBadge(status.status)}
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">
                                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span>{session.user.name}</span>
                                        <span className="text-muted-foreground font-normal text-xs">({session.user.username})</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                            {titleText}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-border/40">
                                {(['pending_schedule', 'pending_approval', 'pending_document', 'pending_staff_approval'].includes(status.status)) && status.approvals && (
                                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 overflow-hidden pointer-events-none">
                                        <div className="flex items-start gap-3 px-4 py-3 border-b border-primary/10">
                                            <Clock className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                            <span className="text-xs font-semibold text-primary leading-relaxed">
                                                {status.status === 'pending_schedule' ? 'Menunggu penjadwalan oleh Staff Prodi' :
                                                 status.status === 'pending_approval' ? 'Menunggu persetujuan dosen' :
                                                 status.status === 'pending_document' ? 'Silakan upload Surat Permohonan Ujian Akhir' :
                                                 'Menunggu verifikasi surat oleh Staff Prodi'}
                                            </span>
                                        </div>
                                        <div className="px-4 py-3">
                                            <ApprovalStatusList 
                                                approvals={status.approvals} 
                                                includeStaffNode={true} 
                                                staffStatus={
                                                    status.status === 'pending_schedule'
                                                        ? 'pending'
                                                        : (['approved', 'pass', 'fail'].includes(status.status) ? 'approved' : 'scheduled')
                                                } 
                                            />
                                        </div>
                                    </div>
                                )}

                                {['pending_approval', 'pending_document', 'pending_staff_approval', 'approved', 'pass', 'fail'].includes(status.status) && status.scheduled_date && (
                                    <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl space-y-1.5 border border-primary/10 w-full pointer-events-none">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            <span className="font-bold text-foreground">
                                                {formatDateOnly(status.scheduled_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                                            {formatTimeOnly(status.scheduled_date)} WITA
                                        </div>
                                        {status.venue && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                                {status.venue}
                                            </div>
                                        )}
                                    </div>
                                )}


                                {status.status === 'rejected' && (
                                    <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-3 pointer-events-none">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                            <XCircle className="h-3 w-3" />
                                            Permohonan Ditolak
                                        </div>
                                        {status.rejection_reason && (
                                            <div className="flex items-start gap-1.5 p-2 bg-rose-500/10 rounded-lg">
                                                <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-rose-700 dark:text-rose-300 italic leading-relaxed">{status.rejection_reason}</p>
                                            </div>
                                        )}
                                        {status.approvals && status.approvals.some((a: any) => a.status === 'rejected') && (
                                            <div className="space-y-2 mt-2 pl-2 border-l-2 border-rose-500/20">
                                                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Ditolak oleh Dosen Pembimbing:</p>
                                                {status.approvals.filter((a: any) => a.status === 'rejected').map((app: any, idx: number) => (
                                                    <div key={idx} className="flex flex-col gap-0.5 text-xs">
                                                        <span className="font-medium text-foreground">{app.lecturer_name}</span>
                                                        <span className="italic text-rose-600 dark:text-rose-400 text-[10px]">Alasan: {app.rejection_reason || "Tidak ada alasan"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0 pt-1 pointer-events-none" title="Lihat Detail Seminar">
                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-primary transition-all group-hover/item:translate-x-1" />
                    </div>
                </div>
            </div>
        );
    };

    /* Sidebar content — shared between desktop column and mobile drawer */
    const sidebarContent = (
        <>
            <UpcomingAgendaWidget 
                consultations={consultations} 
                seminarProposal={seminarStatus} 
                seminarHasil={seminarHasilStatus} 
                pendadaran={pendadaranStatus} 
                spectatingSeminars={spectatingSeminars}
            />
            {displayLecturers.length > 0 && (
                <LecturersInfoCardList 
                    lecturers={displayLecturers} 
                    renderAction={(lecturer) => (
                        <ConsultationModal 
                            studentNim={session.user.username} 
                            lecturerNip={lecturer.nip} 
                            lecturerName={lecturer.name} 
                        />
                    )}
                />
            )}
            <ConsultationHistoryWidget consultations={consultations} />
        </>
    );

    const isUnassigned = !thesis || supervisors.length === 0;

    const isSeminarProposalUnlocked = proposalData?.approval_status === 'approved' && attendances.total >= MIN_SEMINAR_ATTENDANCE;
    const isSkripsiUnlocked = thesis?.progress === 'penelitian' || thesis?.progress === 'seminar_hasil' || thesis?.progress === 'pendadaran' || thesis?.progress === 'lulus';
    const isPendadaranUnlocked = thesis?.progress === 'pendadaran' || thesis?.progress === 'lulus';

    if (isUnassigned) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                                <main className="flex-1 container py-6 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-heading font-extrabold mb-3 text-foreground/90">Belum Ditugaskan</h2>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            Saat ini kamu belum ditugaskan untuk mengerjakan skripsi, silahkan hubungi staff program studi.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Header */}
            
            <main className="flex-1 container py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
                <DashboardActionTrackerProvider>
                
                {/* 2-Column Layout: Main (2fr) + Sidebar (1fr) */}
                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* Consultation Alerts */}
                        {consultations.filter(c => c.status === 'approved' && c.consultation_date).map(c => (
                            <GradientCard key={c.id} className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl shrink-0">
                                            <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Jadwal Bimbingan Baru</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Dosen pembimbing telah menentukan jadwal untuk bimbingan Anda. Silakan konfirmasi.</p>
                                        </div>
                                    </div>
                                    <Button size="sm" asChild className="shrink-0">
                                        <Link href={`/konsultasi/${c.id}`}>
                                            Tinjau <ArrowRight className="h-3 w-3 ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </GradientCard>
                        ))}

                        {/* Progress Timeline */}
                        <StudentProgressPipeline currentProgress={thesis?.progress || null} />

                        {/* Proposal Summary */}
                        <ResearchSummaryWidget 
                            title="Proposal"
                            description="Informasi pengajuan proposal kamu."
                            data={proposalData}
                            actionLink={proposalData ? `/skripsi/${proposalData.id}` : "#"}
                            actionDisabled={proposalData?.approval_status === 'pending' || proposalData?.approval_status === 'approved'}
                            actionDisabledMessage={proposalData?.approval_status === 'approved' ? "" : "Tidak dapat mengubah proposal selama masa permintaan persetujuan"}
                            icon={<FileText className="h-4 w-4 text-primary" />}
                        >
                            {proposalData && (
                                <div className="space-y-4">
                                    {proposalData.approval_status === 'pending' && proposalData.approvals && proposalData.approvals.length > 0 && (
                                        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 overflow-hidden">
                                            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10">
                                                <Clock className="h-4 w-4 text-primary shrink-0" />
                                                <span className="text-xs font-semibold text-primary">Status Persetujuan Proposal</span>
                                            </div>
                                            <div className="px-4 py-3">
                                                <ApprovalStatusList approvals={proposalData.approvals} includeStaffNode={false} />
                                            </div>
                                        </div>
                                    )}

                                    {proposalData.approval_status === 'pending' ? (
                                        <div className="flex flex-col gap-2">
                                            <CancelProposalApprovalButton proposalId={proposalData.id} />
                                        </div>
                                    ) : proposalData.approval_status === 'approved' ? (
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                className="w-full h-12 rounded-xl font-bold justify-center gap-2 bg-primary text-primary-foreground opacity-50"
                                                disabled={true}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Proposal Telah Disetujui
                                            </Button>
                                        </div>
                                    ) : (
                                        <RequestProposalApprovalButton
                                            proposalId={proposalData.id}
                                            disabled={!(proposalData.title && proposalData.research_type && proposalData.research_method && proposalData.proposal_url)}
                                            disabledMessage="Kamu belum mengisi detail informasi dan mengupload file proposal"
                                        />
                                    )}
                                    {proposalData.approval_status === 'rejected' && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400 mt-2">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            <span>Proposal ditolak. Silahkan ubah dan ajukan kembali.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ResearchSummaryWidget>

                        {/* === Action & Status Sections === */}

                        {/* Seminar Proposal */}
                        <div className={`relative ${!isSeminarProposalUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {!isSeminarProposalUnlocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl gap-3 text-center px-4">
                                    <div className="bg-background p-3 rounded-full shadow-sm border">
                                        <Lock className="w-6 h-6 text-muted-foreground dark:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground dark:text-white max-w-[250px]">
                                            Dapatkan persetujuan proposal & Kehadiran Seminar ({MIN_SEMINAR_ATTENDANCE}x) untuk membuka. ({attendances.total}/{MIN_SEMINAR_ATTENDANCE})
                                        </p>
                                    </div>
                                </div>
                            )}
                            <GradientCard className="flex flex-col" variant="seminar-proposal">
                                <GradientCardHeader variant="seminar-proposal">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                            <Presentation className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <GradientCardTitle>Seminar Proposal</GradientCardTitle>
                                            <GradientCardDescription>Permohonan dan status seminar proposal.</GradientCardDescription>
                                        </div>
                                    </div>
                                </GradientCardHeader>
                                <div className="p-5 space-y-5">
                                    {thesis && (
                                        <div className="space-y-2">

                                            <div className={`flex items-center gap-2 text-xs font-medium ${attendances.total < MIN_SEMINAR_ATTENDANCE ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {attendances.total < MIN_SEMINAR_ATTENDANCE ? (
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                )}
                                                <span>
                                                    Syarat kehadiran seminar mahasiswa lain ({attendances.total}/{MIN_SEMINAR_ATTENDANCE})
                                                    {attendances.total >= MIN_SEMINAR_ATTENDANCE && " — Terpenuhi"}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs font-medium ${proposalData?.approval_status !== 'approved' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {proposalData?.approval_status !== 'approved' ? (
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                )}
                                                <span>
                                                    Mendapat Persetujuan Proposal
                                                    {proposalData?.approval_status === 'approved' && " — Terpenuhi"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {seminarStatus && renderSeminarStatusDetail(seminarStatus, 'primary', 'proposal')}
                                    <div className="flex flex-col gap-2 pt-1">
                                        <RequestSeminarProposal 
                                            thesisId={thesis?.id || ""} 
                                            disabled={!thesis || (seminarStatus && seminarStatus.status !== 'rejected' && seminarStatus.status !== 'fail')} 
                                            attendanceCount={attendances.total}
                                            hasProposalTitle={!!proposalData?.title}
                                            hasApprovedProposal={proposalData?.approval_status === 'approved'}
                                        />
                                    </div>
                                </div>
                            </GradientCard>
                        </div>

                        {/* Skripsi Summary */}
                        <div className={`relative ${!isSkripsiUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {!isSkripsiUnlocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl gap-3 text-center px-4">
                                    <div className="bg-background p-3 rounded-full shadow-sm border">
                                        <Lock className="w-6 h-6 text-muted-foreground dark:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground dark:text-white max-w-[250px]">
                                            Lulus Seminar Proposal untuk membuka tahap ini.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <ResearchSummaryWidget 
                                title="Skripsi"
                                description="Detail informasi tugas akhir kamu."
                                data={thesis}
                                actionLink={thesis ? `/skripsi/${thesis.id}` : "#"}
                            />
                        </div>

                        {/* Penelitian */}
                        <div className={`relative ${!isSkripsiUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {!isSkripsiUnlocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl gap-3 text-center px-4">
                                    <div className="bg-background p-3 rounded-full shadow-sm border">
                                        <Lock className="w-6 h-6 text-muted-foreground dark:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground dark:text-white max-w-[250px]">
                                            Lulus Seminar Proposal untuk membuka tahap ini.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <GradientCard className="flex flex-col" variant="penelitian">
                                <GradientCardHeader variant="penelitian">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                            <Search className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <GradientCardTitle>Penelitian</GradientCardTitle>
                                            <GradientCardDescription>Tahap pelaksanaan dan administrasi penelitian skripsi.</GradientCardDescription>
                                        </div>
                                    </div>
                                </GradientCardHeader>
                                <div className="p-5">
                                    <ResearchDocumentsWidget documents={externalDocuments} />
                                </div>
                            </GradientCard>
                        </div>

                        {/* Seminar Hasil */}
                        <div className={`relative ${!isSkripsiUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {!isSkripsiUnlocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl gap-3 text-center px-4">
                                    <div className="bg-background p-3 rounded-full shadow-sm border">
                                        <Lock className="w-6 h-6 text-muted-foreground dark:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground dark:text-white max-w-[250px]">
                                            Lulus Seminar Proposal untuk membuka tahap ini.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <GradientCard className="flex flex-col" variant="seminar-hasil">
                                <GradientCardHeader variant="seminar-hasil">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                            <Presentation className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <GradientCardTitle>Seminar Hasil</GradientCardTitle>
                                            <GradientCardDescription>Permohonan dan status seminar hasil.</GradientCardDescription>
                                        </div>
                                    </div>
                                </GradientCardHeader>
                                <div className="p-5 space-y-5">
                                    {thesis && thesis.progress === 'penelitian' && (
                                        <div className="space-y-2">
                                            <div className={`flex items-center gap-2 text-xs font-medium ${!thesis.title ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {!thesis.title ? (
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                )}
                                                <span>
                                                    Harus melengkapi data skripsi
                                                    {!!thesis.title && " — Terpenuhi"}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs font-medium ${attendances.total < MIN_SEMINAR_ATTENDANCE ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {attendances.total < MIN_SEMINAR_ATTENDANCE ? (
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                                )}
                                                <span>
                                                    Syarat kehadiran seminar mahasiswa lain ({attendances.total}/{MIN_SEMINAR_ATTENDANCE})
                                                    {attendances.total >= MIN_SEMINAR_ATTENDANCE && " — Terpenuhi"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {seminarHasilStatus && renderSeminarStatusDetail(seminarHasilStatus, 'emerald', 'hasil')}
                                    
                                    <RequestSeminarHasil 
                                        thesisId={thesis?.id || ""} 
                                        disabled={!thesis || thesis.progress !== 'penelitian' || (seminarHasilStatus && seminarHasilStatus.status !== 'rejected' && seminarHasilStatus.status !== 'fail')} 
                                        attendanceCount={attendances.total}
                                        hasThesisTitle={!!thesis?.title}
                                    />
                                </div>
                            </GradientCard>
                        </div>

                        <GraduationChecklist 
                            checklists={checklists} 
                        />

                        {/* Pendadaran */}
                        <div className={`relative ${!isPendadaranUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {!isPendadaranUnlocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl gap-3 text-center px-4">
                                    <div className="bg-background p-3 rounded-full shadow-sm border">
                                        <Lock className="w-6 h-6 text-muted-foreground dark:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground dark:text-white max-w-[250px]">
                                            Lulus Seminar Hasil untuk membuka tahap ini.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <GradientCard className="flex flex-col" variant="sidang-skripsi">
                                <GradientCardHeader variant="sidang-skripsi">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <GradientCardTitle>Sidang Skripsi</GradientCardTitle>
                                            <GradientCardDescription>Permohonan dan status ujian sidang skripsi.</GradientCardDescription>
                                        </div>
                                    </div>
                                </GradientCardHeader>
                                <div className="p-5 space-y-5">
                                    {pendadaranStatus && (
                                        <SidangSkripsiMiniStepper 
                                            status={pendadaranStatus.status} 
                                            hasDocument={!!pendadaranStatus.surat_permohonan_pendadaran_url} 
                                        />
                                    )}

                                    {pendadaranStatus && renderSeminarStatusDetail(pendadaranStatus, 'primary', 'pendadaran')}
                                    
                                    {pendadaranStatus && (pendadaranStatus.status === 'pending_document' || (pendadaranStatus.status === 'rejected' && pendadaranStatus.surat_permohonan_pendadaran_url)) && (
                                        <SuratPermohonanWidget 
                                            thesisId={thesis?.id || ""}
                                            currentUrl={pendadaranStatus?.surat_permohonan_pendadaran_url || pendadaranStatus?.document_url || null}
                                            disabled={false}
                                        />
                                    )}

                                    {(!pendadaranStatus || (['rejected', 'fail'].includes(pendadaranStatus.status) && !pendadaranStatus.surat_permohonan_pendadaran_url)) && (
                                        <RequestPendadaran 
                                            studentNim={session.user.username} 
                                            disabled={!thesis || thesis.progress !== 'pendadaran'} 
                                            hasThesisTitle={!!thesis?.title}
                                        />
                                    )}
                                </div>
                            </GradientCard>
                        </div>
                    </div>

                    {/* Sidebar — desktop: column, mobile: FAB drawer */}
                    <div className="lg:col-span-1 min-w-0">
                        <DashboardSidebar>
                            <MultiRoleSwitcher />
                            {sidebarContent}
                        </DashboardSidebar>
                    </div>
                </div>
                </DashboardActionTrackerProvider>
            </main>
        </div>
    );
}
