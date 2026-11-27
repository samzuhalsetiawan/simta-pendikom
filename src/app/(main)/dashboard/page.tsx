import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getActiveRoleCookie, setActiveRoleCookie } from "@/lib/actions/cookies"
import { getStaffRole } from "@/lib/dal/staff"
import { GlobalRoleSelector, RoleOption } from "@/components/role-selector"

import StudentDashboardView from "./_views/student-dashboard-view"
import LecturerDashboardView from "./_views/lecturer-dashboard-view"
import StaffDashboardView from "./_views/staff-dashboard-view"

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) redirect("/login")

    let roles: string[] = []
    try {
        roles = JSON.parse(session.user.role || "[]") as string[]
    } catch (e) {
        roles = []
    }

    if (roles.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Akun Anda belum memiliki akses ke sistem ini.</p>
            </div>
        )
    }

    let activeRole = await getActiveRoleCookie()

    // If user has only 1 role, use it automatically
    if (roles.length === 1) {
        activeRole = roles[0]
    }

    // If user has multiple roles and no active role is chosen, show role picker
    if (roles.length > 1 && !activeRole) {
        const options: RoleOption[] = []
        for (const role of roles) {
            if (role === 'student') options.push({ id: 'student', label: 'Mahasiswa' })
            else if (role === 'lecturer') options.push({ id: 'lecturer', label: 'Dosen Pembimbing/Penguji' })
            else if (role === 'staff') {
                const staffTitle = await getStaffRole(session.user.username)
                const formattedTitle = staffTitle 
                    ? staffTitle.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
                    : 'Staff Akademik'
                options.push({ id: 'staff', label: formattedTitle })
            }
        }
        return <GlobalRoleSelector options={options} />
    }

    // If activeRole is somehow invalid for this user, force them to pick again
    if (activeRole && !roles.includes(activeRole)) {
        return <GlobalRoleSelector options={roles.map(r => ({ id: r, label: r }))} /> // Fallback, handled properly above in real flow
    }

    // Render the appropriate view
    if (activeRole === 'student') return <StudentDashboardView />
    if (activeRole === 'lecturer') return <LecturerDashboardView />
    if (activeRole === 'staff') return <StaffDashboardView />

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <p className="text-muted-foreground text-center">Terjadi kesalahan. Peran tidak valid.</p>
        </div>
    )
}
