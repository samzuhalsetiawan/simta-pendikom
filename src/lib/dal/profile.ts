import { db } from "@/lib/db";
import { getSignaturePath } from "@/lib/storage";

// === Base Profile Types ===

export type ProfileData = {
    name: string;
    username: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    roles: string[];
    phone_number: string | null;
    address: string | null;
    signaturePath: string | null;
    hasSignature?: boolean;
    studentDetails?: {
        generation_year: string;
        thesis?: {
            id?: string;
            title: string | null;
            progress: string;
            research_type: string | null;
            research_method: string | null;
            research_location?: string | null;
            thesis_url?: string | null;
        };
    };
    lecturerDetails?: {
        supervising_count: number;
        examining_count: number;
    };
    staffDetails?: {
        role: 'admin' | 'ketua_jurusan' | 'koordinator_program_studi' | 'admin_prodi';
    };
};

// === Specialized Profile Types ===

export type StudentProfileData = ProfileData & {
    studentDetails: {
        generation_year: string;
        thesis: {
            id: string;
            title: string | null;
            progress: string;
            research_type: string | null;
            research_method: string | null;
            research_location: string | null;
            thesis_url: string | null;
            updated_at?: string | Date | null;
            created_at?: string | Date | null;
        } | null;
        supervisors: {
            nip: string;
            name: string;
            image: string | null;
            position: number;
        }[];
        examiners: {
            nip: string;
            name: string;
            image: string | null;
            position: number;
        }[];
        consultations_count: number;
        recent_activities: {
            category: string;
            description: string;
            created_at: string;
        }[];
    };
};

export type SupervisedStudentItem = {
    nim: string;
    name: string;
    image: string | null;
    generation_year: string;
    thesis_id: string;
    thesis_title: string | null;
    progress: string;
    position: number;
};

export type ExaminedStudentItem = {
    nim: string;
    name: string;
    image: string | null;
    generation_year: string;
    thesis_id: string;
    thesis_title: string | null;
    progress: string;
    position: number;
};

export type LecturerProfileData = ProfileData & {
    lecturerDetails: {
        supervising_count: number;
        supervising_active_count: number;
        supervising_graduated_count: number;
        examining_count: number;
        staff_role: string | null;
        supervised_students: SupervisedStudentItem[];
        examined_students: ExaminedStudentItem[];
    };
};

export type StaffProfileData = ProfileData & {
    staffDetails: {
        role: 'admin' | 'ketua_jurusan' | 'koordinator_program_studi' | 'admin_prodi';
        stats: {
            total_students: number;
            total_lecturers: number;
            active_theses: number;
            graduated_theses: number;
        };
    };
};

// === Queries ===

export async function getProfileData(username: string): Promise<ProfileData | null> {
    const [users] = await db.execute("SELECT name, username, email, emailVerified, image, role, phone_number, address FROM user WHERE username = ?", [username]) as any[];
    
    if (users.length === 0) return null;
    
    const user = users[0];
    const roles = JSON.parse(user.role || "[]") as string[];
    
    const signaturePath = await getSignaturePath(username);

    const profile: ProfileData = {
        name: user.name,
        username: user.username,
        email: user.email,
        emailVerified: !!user.emailVerified,
        image: user.image,
        roles,
        phone_number: user.phone_number,
        address: user.address,
        signaturePath,
        hasSignature: !!signaturePath,
    };

    if (roles.includes("student")) {
        const [students] = await db.execute("SELECT generation_year FROM student WHERE nim = ?", [username]) as any[];
        if (students.length > 0) {
            const [theses] = await db.execute("SELECT BIN_TO_UUID(id) as id, title, progress, research_type, research_method, research_location, thesis_url FROM thesis WHERE nim = ?", [username]) as any[];
            profile.studentDetails = {
                generation_year: String(students[0].generation_year),
                thesis: theses.length > 0 ? theses[0] : undefined
            };
        }
    }

    if (roles.includes("lecturer")) {
        const [supervising] = await db.execute("SELECT COUNT(*) as count FROM thesis_lecturer WHERE lecturer_nip = ? AND role = 'supervisor'", [username]) as any[];
        const [examining] = await db.execute("SELECT COUNT(*) as count FROM thesis_lecturer WHERE lecturer_nip = ? AND role = 'examiner'", [username]) as any[];
        
        profile.lecturerDetails = {
            supervising_count: supervising[0].count,
            examining_count: examining[0].count
        };
    }

    if (roles.includes("staff")) {
        const [staffs] = await db.execute("SELECT role FROM staff WHERE nip = ?", [username]) as any[];
        if (staffs.length > 0) {
            profile.staffDetails = {
                role: staffs[0].role
            };
        } else {
            profile.staffDetails = {
                role: 'admin'
            };
        }
    }

    return profile;
}

export async function getStudentProfile(nim: string): Promise<StudentProfileData | null> {
    const [users] = await db.execute(
        "SELECT name, username, email, emailVerified, image, role, phone_number, address FROM user WHERE username = ?",
        [nim]
    ) as any[];

    if (users.length === 0) return null;

    const user = users[0];
    const roles = JSON.parse(user.role || "[]") as string[];
    if (!roles.includes("student")) return null;

    const [students] = await db.execute(
        "SELECT generation_year FROM student WHERE nim = ?",
        [nim]
    ) as any[];

    const generation_year = students.length > 0 ? String(students[0].generation_year) : "-";

    const [theses] = await db.execute(
        "SELECT BIN_TO_UUID(id) as id, title, progress, research_type, research_method, research_location, thesis_url, updatedAt as updated_at, createdAt as created_at FROM thesis WHERE nim = ?",
        [nim]
    ) as any[];

    const thesis = theses.length > 0 ? {
        id: theses[0].id,
        title: theses[0].title,
        progress: theses[0].progress,
        research_type: theses[0].research_type,
        research_method: theses[0].research_method,
        research_location: theses[0].research_location,
        thesis_url: theses[0].thesis_url,
        updated_at: theses[0].updated_at,
        created_at: theses[0].created_at,
    } : null;

    let supervisors: StudentProfileData['studentDetails']['supervisors'] = [];
    let examiners: StudentProfileData['studentDetails']['examiners'] = [];

    if (thesis) {
        const [lecturers] = await db.execute(`
            SELECT 
                tl.lecturer_nip as nip,
                u.name,
                u.image,
                tl.role,
                tl.position
            FROM thesis_lecturer tl
            JOIN user u ON tl.lecturer_nip = u.username
            WHERE tl.thesis_id = UUID_TO_BIN(?)
            ORDER BY tl.position ASC
        `, [thesis.id]) as any[];

        supervisors = lecturers
            .filter((l: any) => l.role === 'supervisor')
            .map((l: any) => ({
                nip: l.nip,
                name: l.name,
                image: l.image,
                position: l.position || 1
            }));

        examiners = lecturers
            .filter((l: any) => l.role === 'examiner')
            .map((l: any) => ({
                nip: l.nip,
                name: l.name,
                image: l.image,
                position: l.position || 1
            }));
    }

    const [consultations] = await db.execute(
        "SELECT COUNT(*) as count FROM consultation WHERE student_nim = ?",
        [nim]
    ) as any[];
    const consultations_count = consultations[0]?.count || 0;

    const [activityLogs] = await db.execute(
        "SELECT activity_category as category, description, created_at FROM student_activity_logs WHERE student_nim = ? ORDER BY created_at DESC LIMIT 6",
        [nim]
    ) as any[];

    const signaturePath = await getSignaturePath(nim);

    return {
        name: user.name,
        username: user.username,
        email: user.email,
        emailVerified: !!user.emailVerified,
        image: user.image,
        roles,
        phone_number: user.phone_number,
        address: user.address,
        signaturePath,
        hasSignature: !!signaturePath,
        studentDetails: {
            generation_year,
            thesis,
            supervisors,
            examiners,
            consultations_count,
            recent_activities: activityLogs.map((a: any) => ({
                category: a.category,
                description: a.description,
                created_at: String(a.created_at),
            })),
        }
    };
}

export async function getLecturerProfile(nip: string): Promise<LecturerProfileData | null> {
    const [users] = await db.execute(
        "SELECT name, username, email, emailVerified, image, role, phone_number, address FROM user WHERE username = ?",
        [nip]
    ) as any[];

    if (users.length === 0) return null;

    const user = users[0];
    const roles = JSON.parse(user.role || "[]") as string[];
    if (!roles.includes("lecturer")) return null;

    // Check staff role if any
    const [staffRows] = await db.execute("SELECT role FROM staff WHERE nip = ?", [nip]) as any[];
    const staff_role = staffRows.length > 0 ? staffRows[0].role : null;

    // Supervised students
    const [supervised] = await db.execute(`
        SELECT 
            s.nim,
            u.name,
            u.image,
            s.generation_year,
            BIN_TO_UUID(t.id) as thesis_id,
            t.title as thesis_title,
            t.progress,
            tl.position
        FROM thesis_lecturer tl
        JOIN thesis t ON tl.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND tl.role = 'supervisor'
        ORDER BY s.generation_year DESC, s.nim ASC
    `, [nip]) as any[];

    // Examined students
    const [examined] = await db.execute(`
        SELECT 
            s.nim,
            u.name,
            u.image,
            s.generation_year,
            BIN_TO_UUID(t.id) as thesis_id,
            t.title as thesis_title,
            t.progress,
            tl.position
        FROM thesis_lecturer tl
        JOIN thesis t ON tl.thesis_id = t.id
        JOIN student s ON t.nim = s.nim
        JOIN user u ON s.nim = u.username
        WHERE tl.lecturer_nip = ? AND tl.role = 'examiner'
        ORDER BY s.generation_year DESC, s.nim ASC
    `, [nip]) as any[];

    const supervisedStudents: SupervisedStudentItem[] = supervised.map((s: any) => ({
        nim: s.nim,
        name: s.name,
        image: s.image,
        generation_year: String(s.generation_year || ""),
        thesis_id: s.thesis_id,
        thesis_title: s.thesis_title,
        progress: s.progress,
        position: s.position || 1
    }));

    const examinedStudents: ExaminedStudentItem[] = examined.map((s: any) => ({
        nim: s.nim,
        name: s.name,
        image: s.image,
        generation_year: String(s.generation_year || ""),
        thesis_id: s.thesis_id,
        thesis_title: s.thesis_title,
        progress: s.progress,
        position: s.position || 1
    }));

    const supervising_active_count = supervisedStudents.filter(s => s.progress !== 'lulus').length;
    const supervising_graduated_count = supervisedStudents.filter(s => s.progress === 'lulus').length;

    const signaturePath = await getSignaturePath(nip);

    return {
        name: user.name,
        username: user.username,
        email: user.email,
        emailVerified: !!user.emailVerified,
        image: user.image,
        roles,
        phone_number: user.phone_number,
        address: user.address,
        signaturePath,
        hasSignature: !!signaturePath,
        staffDetails: staff_role ? { role: staff_role as any } : undefined,
        lecturerDetails: {
            supervising_count: supervisedStudents.length,
            supervising_active_count,
            supervising_graduated_count,
            examining_count: examinedStudents.length,
            staff_role,
            supervised_students: supervisedStudents,
            examined_students: examinedStudents,
        }
    };
}

export async function getStaffProfile(nip: string): Promise<StaffProfileData | null> {
    const [users] = await db.execute(
        "SELECT name, username, email, emailVerified, image, role, phone_number, address FROM user WHERE username = ?",
        [nip]
    ) as any[];

    if (users.length === 0) return null;

    const user = users[0];
    const roles = JSON.parse(user.role || "[]") as string[];
    if (!roles.includes("staff")) return null;

    const [staffRows] = await db.execute("SELECT role FROM staff WHERE nip = ?", [nip]) as any[];
    const role = staffRows.length > 0 ? staffRows[0].role : 'admin';

    // Global Stats
    const [studentsCount] = await db.execute("SELECT COUNT(*) as count FROM student") as any[];
    const [lecturersCount] = await db.execute("SELECT COUNT(*) as count FROM user WHERE role LIKE '%lecturer%'") as any[];
    const [activeTheses] = await db.execute("SELECT COUNT(*) as count FROM thesis WHERE progress != 'lulus'") as any[];
    const [graduatedTheses] = await db.execute("SELECT COUNT(*) as count FROM thesis WHERE progress = 'lulus'") as any[];

    const signaturePath = await getSignaturePath(nip);

    return {
        name: user.name,
        username: user.username,
        email: user.email,
        emailVerified: !!user.emailVerified,
        image: user.image,
        roles,
        phone_number: user.phone_number,
        address: user.address,
        signaturePath,
        hasSignature: !!signaturePath,
        staffDetails: {
            role,
            stats: {
                total_students: studentsCount[0]?.count || 0,
                total_lecturers: lecturersCount[0]?.count || 0,
                active_theses: activeTheses[0]?.count || 0,
                graduated_theses: graduatedTheses[0]?.count || 0,
            }
        }
    };
}
