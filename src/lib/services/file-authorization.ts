import { db } from "@/lib/db";

export interface DocumentAuthPolicy {
    matches(fileName: string): boolean;
    checkOwnership(fileName: string, username: string): Promise<boolean>;
}

class ProposalAuthPolicy implements DocumentAuthPolicy {
    matches(fileName: string): boolean {
        return fileName.startsWith("proposal_");
    }

    async checkOwnership(fileName: string, username: string): Promise<boolean> {
        const fileId = fileName.replace("proposal_", "").replace(".pdf", "");
        if (!fileId || fileId.length !== 36) return false;

        const [rows] = await db.execute(`
            SELECT nim FROM thesis 
            WHERE id = UUID_TO_BIN(?) OR proposal_url LIKE ?
        `, [fileId, `%${fileId}%`]) as any[];
        return rows.length > 0 && rows[0].nim === username;
    }
}

class LaporanAuthPolicy implements DocumentAuthPolicy {
    matches(fileName: string): boolean {
        return fileName.startsWith("laporan_");
    }

    async checkOwnership(fileName: string, username: string): Promise<boolean> {
        const fileId = fileName.replace("laporan_", "").replace(".pdf", "");
        if (!fileId || fileId.length !== 36) return false;

        const [rows] = await db.execute(`
            SELECT t.nim 
            FROM thesis t
            LEFT JOIN seminar_hasil sh ON t.id = sh.thesis_id AND sh.id = UUID_TO_BIN(?)
            LEFT JOIN pendadaran p ON t.id = p.thesis_id AND p.id = UUID_TO_BIN(?)
            WHERE sh.id IS NOT NULL OR p.id IS NOT NULL
        `, [fileId, fileId]) as any[];

        return rows.length > 0 && rows[0].nim === username;
    }
}

// Registry of document authorization policies
const authPolicies: DocumentAuthPolicy[] = [
    new ProposalAuthPolicy(),
    new LaporanAuthPolicy(),
];

export async function registerAuthPolicy(policy: DocumentAuthPolicy) {
    authPolicies.push(policy);
}

export async function isFileAuthorized(fileName: string, session: any): Promise<boolean> {
    const isSkripsiPdf = fileName.startsWith("skripsi_");
    if (isSkripsiPdf) return true;

    if (!session || !session.user || !session.user.username) {
        return false;
    }

    const username = session.user.username;

    // Check if user is the direct owner (starts with their NIM/username)
    let isOwner = fileName.startsWith(username);

    // Check if user is an admin or coordinator
    let isStaff = session.user.role === "coordinator" || session.user.role === "admin";

    // Double check staff status in DB
    if (!isStaff) {
        const [staffRows] = await db.execute("SELECT role FROM staff WHERE nip = ?", [username]) as any[];
        if (staffRows.length > 0) isStaff = true;
    }

    // Check if user is a lecturer (allow them to view documents)
    if (!isStaff) {
        const [lecturerRows] = await db.execute("SELECT nip FROM lecturer WHERE nip = ?", [username]) as any[];
        if (lecturerRows.length > 0) isStaff = true;
    }

    if (!isOwner && !isStaff) {
        for (const policy of authPolicies) {
            if (policy.matches(fileName)) {
                isOwner = await policy.checkOwnership(fileName, username);
                if (isOwner) break;
            }
        }
    }

    return isOwner || isStaff;
}

