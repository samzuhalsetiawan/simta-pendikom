import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPendingSeminarRequests } from "@/lib/dal/staff-seminar";
import StaffSeminarRequestSection from "../_components/staff/seminar-request-section";
import ProposalApprovalManager from "../_components/shared/proposal-approval-manager";
import { getPendingProposalApprovals } from "@/lib/dal/proposal";
import { 
    getStaffDashboardData, 
    getStaffGraduationStats, 
    getStaffInactiveStudents, 
    getLecturerWorkloads,
    getStaffRole
} from "@/lib/dal/staff";
import DashboardSidebar from "../_components/shared/dashboard-sidebar";
import GlobalProgressOverview from "../_components/staff/global-progress-overview";

import EarlyWarningWidget from "../_components/shared/early-warning-widget";
import LecturerWorkloadWidget from "../_components/staff/lecturer-workload-widget";

import { MultiRoleSwitcher } from "../_components/shared/multi-role-switcher";
import { DashboardActionTrackerProvider } from "../_components/shared/dashboard-action-tracker";

export default async function StaffDashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/login");
    const roles = JSON.parse(session.user.role || "[]") as string[];
    if (!roles.includes("staff")) redirect("/");

    const staffRole = await getStaffRole(session.user.username);
    const isAdminProdi = staffRole === 'admin_prodi';
    
    const [
        pendingSeminarRequests,
        dashboardData,
        graduationStats,
        inactiveStudents,
        lecturerWorkloads,
        proposalApprovalTasks
    ] = await Promise.all([
        isAdminProdi ? getPendingSeminarRequests() : Promise.resolve([]),
        getStaffDashboardData(),
        getStaffGraduationStats(),
        getStaffInactiveStudents(),
        getLecturerWorkloads(),
        getPendingProposalApprovals(session.user.username, 'staff')
    ]);

    const { allThesisStudents, activeStudents, graduatedStudents } = dashboardData;

    const pendingSempro = pendingSeminarRequests.filter(r => r.type === 'seminar_proposal');
    const pendingSemhas = pendingSeminarRequests.filter(r => r.type === 'seminar_hasil');
    const pendingSidang = pendingSeminarRequests.filter(r => r.type === 'pendadaran');

    return (
        <div className="flex flex-col min-h-screen bg-background">
            
            <main className="flex-1 container py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
                <DashboardActionTrackerProvider>
                {/* 2-Column Layout */}
                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* Global Progress Pipeline */}
                        <GlobalProgressOverview 
                            activeStudents={activeStudents}
                            totalStudents={allThesisStudents.length}
                            graduatedCount={graduatedStudents.length}
                        />

                        <ProposalApprovalManager tasks={proposalApprovalTasks} />

                        {isAdminProdi && (
                            <>
                                <StaffSeminarRequestSection
                                    title="Permohonan Seminar Proposal"
                                    description="Tinjau dan jadwalkan permohonan seminar proposal."
                                    type="seminar_proposal"
                                    variant="seminar-proposal"
                                    requests={pendingSempro}
                                />
                                <StaffSeminarRequestSection
                                    title="Permohonan Seminar Hasil"
                                    description="Tinjau dan jadwalkan permohonan seminar hasil."
                                    type="seminar_hasil"
                                    variant="seminar-hasil"
                                    requests={pendingSemhas}
                                />
                                <StaffSeminarRequestSection
                                    title="Permohonan Sidang Skripsi"
                                    description="Tinjau verifikasi berkas dan jadwalkan permohonan sidang skripsi."
                                    type="pendadaran"
                                    variant="sidang-skripsi"
                                    requests={pendingSidang}
                                />
                            </>
                        )}

                        {/* Dosen dan Bimbingan Aktif */}
                        <LecturerWorkloadWidget workloads={lecturerWorkloads} />

                    </div>
                    <div className="lg:col-span-1 min-w-0">
                        <DashboardSidebar>
                            <MultiRoleSwitcher />

                            <EarlyWarningWidget 
                                students={inactiveStudents} 
                                title="Keaktifan Mahasiswa Prodi" 
                                description="Pantau skor keaktifan seluruh mahasiswa"
                                maxItems={6} 
                                viewAllHref="/mahasiswa" 
                            />

                        </DashboardSidebar>
                    </div>
                </div>
                </DashboardActionTrackerProvider>
            </main>
        </div>
    );
}
