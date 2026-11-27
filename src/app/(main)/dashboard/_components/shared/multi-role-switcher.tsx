import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getStaffRole } from "@/lib/dal/staff"
import { getActiveRoleCookie } from "@/lib/actions/cookies"
import { RoleSwitcherClient } from "./multi-role-switcher-client"
import { getPendingProposalApprovals } from "@/lib/dal/proposal"
import { getLecturerSeminarApprovals } from "@/lib/dal/approval"
import { getLecturerConsultations } from "@/lib/dal/consultation"
import { getPendingSeminarRequests } from "@/lib/dal/staff-seminar"

async function hasLecturerNotifications(nip: string) {
    const [proposals, seminars, consultations] = await Promise.all([
        getPendingProposalApprovals(nip, 'lecturer'),
        getLecturerSeminarApprovals(nip, 'lecturer'),
        getLecturerConsultations(nip)
    ]);
    const pendingConsultations = consultations.filter(c => c.status === 'requested' || c.status === 'reschedule_requested');
    return proposals.length > 0 || seminars.length > 0 || pendingConsultations.length > 0;
}

async function hasStaffNotifications(nip: string, staffTitle: string | null) {
    const proposals = await getPendingProposalApprovals(nip, 'staff');
    if (proposals.length > 0) return true;
    if (staffTitle === 'admin_prodi') {
        const seminars = await getPendingSeminarRequests();
        if (seminars.length > 0) return true;
    }
    return false;
}

export async function MultiRoleSwitcher() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    
    if (!session) return null

    let roles: string[] = []
    try {
        roles = JSON.parse(session.user.role || "[]")
    } catch (e) {
        return null
    }

    if (roles.length <= 1) return null

    const activeRole = await getActiveRoleCookie()

    const options = []
    for (const role of roles) {
        if (role === 'student') {
            options.push({ id: 'student', label: 'Mahasiswa', hasNotification: false })
        }
        else if (role === 'lecturer') {
            const hasNotif = await hasLecturerNotifications(session.user.username)
            options.push({ id: 'lecturer', label: 'Dosen Pembimbing/Penguji', hasNotification: hasNotif })
        }
        else if (role === 'staff') {
            const staffTitle = await getStaffRole(session.user.username)
            const formattedTitle = staffTitle 
                ? staffTitle.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
                : 'Staff Akademik'
            const hasNotif = await hasStaffNotifications(session.user.username, staffTitle)
            options.push({ id: 'staff', label: formattedTitle, hasNotification: hasNotif })
        }
    }

    return <RoleSwitcherClient options={options} activeRole={activeRole || null} />
}
