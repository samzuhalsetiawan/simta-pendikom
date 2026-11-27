import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLecturerDashboardData, getLecturerInactiveStudents, getUpcomingAgendas, getLecturerPipelineStats } from "@/lib/dal/lecturer";
import { getLecturerSeminarApprovals } from "@/lib/dal/approval";
import { getLecturerConsultations } from "@/lib/dal/consultation";
import SupervisedStudentProgress from "../_components/lecturer/supervised-student-progress";
import ExaminedStudentProgress from "../_components/lecturer/examined-student-progress";
import EarlyWarningWidget from "../_components/shared/early-warning-widget";
import UpcomingAgendaWidget from "../_components/lecturer/upcoming-agenda";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";
import ImportantTasksWidget from "../_components/lecturer/important-tasks-widget";

import DashboardSidebar from "../_components/shared/dashboard-sidebar";
import { MultiRoleSwitcher } from "../_components/shared/multi-role-switcher";
import { DashboardActionTrackerProvider } from "../_components/shared/dashboard-action-tracker";

export default async function LecturerDashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/login");
    const roles = JSON.parse(session.user.role || "[]") as string[];
    if (!roles.includes("lecturer")) redirect("/");

    const nip = session.user.username;

    // Parallel data fetching for performance
    const [
        dashboardData,
        consultations,
        approvalTasks,
        pipelineStats,
        examinedPipelineStats,
        inactiveStudents,
        upcomingAgendas,
        proposalApprovalTasks,
    ] = await Promise.all([
        getLecturerDashboardData(nip),
        getLecturerConsultations(nip),
        getLecturerSeminarApprovals(nip, 'lecturer'),
        getLecturerPipelineStats(nip, 'supervisor'),
        getLecturerPipelineStats(nip, 'examiner'),
        getLecturerInactiveStudents(nip),
        getUpcomingAgendas(nip),
        import("@/lib/dal/proposal").then(m => m.getPendingProposalApprovals(nip, 'lecturer')),
    ]);
    const { activeSupervised, activeExamined } = dashboardData;
    const pendingConsultationsCount = consultations.filter(c => c.status === 'requested' || c.status === 'reschedule_requested').length;

    /* Sidebar content — shared between desktop column and mobile drawer */
    const sidebarContent = (
        <div className="space-y-6 flex flex-col h-full">
            <GradientCard className="flex flex-col">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        </div>
                        <div>
                            <GradientCardTitle>Penting</GradientCardTitle>
                            <GradientCardDescription>Informasi penting yang butuh perhatian anda</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
                <div className="p-5 flex-1 flex flex-col">
                    <ImportantTasksWidget 
                        proposalTasks={proposalApprovalTasks}
                        seminarTasks={approvalTasks}
                        consultations={consultations}
                    />
                </div>
            </GradientCard>
            <EarlyWarningWidget students={inactiveStudents} />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            
            <DashboardActionTrackerProvider>
                <main className="flex-1 container py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
                {/* 2-Column Layout: Main (2fr) + Sidebar (1fr) */}
                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* Today Agenda */}
                        <UpcomingAgendaWidget groups={upcomingAgendas} />

                        {/* Pipeline */}
                        <SupervisedStudentProgress stats={pipelineStats} students={activeSupervised} />
                        
                        {/* Examined Pipeline */}
                        <ExaminedStudentProgress stats={examinedPipelineStats} students={activeExamined} />

                        {/* Action Items */}
                        
                    </div>

                    {/* Sidebar — desktop: column, mobile: FAB drawer */}
                    <div className="lg:col-span-1 min-w-0">
                        <DashboardSidebar>
                            <MultiRoleSwitcher />
                            {sidebarContent}
                        </DashboardSidebar>
                    </div>
                </div>
            </main>
            </DashboardActionTrackerProvider>
        </div>
    );
}
