import { db } from "@/lib/db";

export type GraduationChecklist = {
    nim: string;
    item_id: string;
    is_checked: boolean;
};

export async function getGraduationChecklists(nim: string): Promise<GraduationChecklist[]> {
    const [rows] = await db.execute(`
        SELECT nim, item_id, is_checked
        FROM student_graduation_checklists
        WHERE nim = ?
    `, [nim]) as any[];

    return rows.map((r: any) => ({
        nim: r.nim,
        item_id: r.item_id,
        is_checked: Boolean(r.is_checked)
    }));
}

export async function updateChecklistStatus(nim: string, item_id: string, is_checked: boolean): Promise<void> {
    await db.execute(`
        INSERT INTO student_graduation_checklists (nim, item_id, is_checked)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE is_checked = ?
    `, [nim, item_id, is_checked, is_checked]);
}
