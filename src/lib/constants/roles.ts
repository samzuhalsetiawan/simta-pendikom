export type StaffRole = 'admin' | 'ketua_jurusan' | 'koordinator_program_studi' | 'admin_prodi';

export const STAFF_ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    ketua_jurusan: "Ketua Jurusan",
    koordinator_program_studi: "Koordinator Program Studi",
    admin_prodi: "Admin Program Studi",
};

export const BASE_ROLE_LABELS: Record<string, string> = {
    student: "Mahasiswa",
    lecturer: "Dosen",
    staff: "Staff",
};

/**
 * Formats a staff role from database value (e.g. 'ketua_jurusan')
 * to user-friendly display string (e.g. 'Ketua Jurusan').
 */
export function formatStaffRole(role?: string | null): string {
    if (!role) return "Staff";
    if (STAFF_ROLE_LABELS[role]) {
        return STAFF_ROLE_LABELS[role];
    }
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Formats a role badge for the profile page.
 * If the role is 'staff', it displays the specific staff role formatted properly.
 */
export function formatRoleBadge(
    role: string,
    staffRole?: string | null
): string {
    if (role === 'staff') {
        return formatStaffRole(staffRole);
    }
    if (BASE_ROLE_LABELS[role]) {
        return BASE_ROLE_LABELS[role];
    }
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
