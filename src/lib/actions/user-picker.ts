"use server";

import { db } from "@/lib/db";

export interface UserPickerItem {
    id: string; // NIM or NIP
    name: string;
    identifier: string; // NIM or NIP
    image: string | null;
}

export interface UserPickerResponse {
    items: UserPickerItem[];
    totalCount: number;
    hasMore: boolean;
}

export async function searchStudentsAction(params: {
    query?: string;
    page?: number;
    limit?: number;
}): Promise<UserPickerResponse> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 15));
    const offset = (page - 1) * limit;
    const query = (params.query || "").trim();

    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (query !== "") {
        const q = `%${query}%`;
        conditions.push("(u.name LIKE ? OR s.nim LIKE ?)");
        queryParams.push(q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count
    const [countRows] = await db.execute(
        `SELECT COUNT(*) as total FROM student s JOIN user u ON s.nim = u.username ${whereClause}`,
        queryParams
    ) as any[];
    const totalCount = Number(countRows[0]?.total || 0);

    // Data
    const [rows] = await db.execute(
        `SELECT s.nim, u.name, u.image
         FROM student s
         JOIN user u ON s.nim = u.username
         ${whereClause}
         ORDER BY u.name ASC
         LIMIT ${limit} OFFSET ${offset}`,
        queryParams
    ) as any[];

    const items: UserPickerItem[] = rows.map((r: any) => ({
        id: r.nim,
        name: r.name || r.nim,
        identifier: r.nim,
        image: r.image || null,
    }));

    return {
        items,
        totalCount,
        hasMore: offset + items.length < totalCount,
    };
}

export async function searchLecturersAction(params: {
    query?: string;
    page?: number;
    limit?: number;
}): Promise<UserPickerResponse> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 15));
    const offset = (page - 1) * limit;
    const query = (params.query || "").trim();

    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (query !== "") {
        const q = `%${query}%`;
        conditions.push("(u.name LIKE ? OR l.nip LIKE ?)");
        queryParams.push(q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count
    const [countRows] = await db.execute(
        `SELECT COUNT(*) as total FROM lecturer l JOIN user u ON l.nip = u.username ${whereClause}`,
        queryParams
    ) as any[];
    const totalCount = Number(countRows[0]?.total || 0);

    // Data
    const [rows] = await db.execute(
        `SELECT l.nip, u.name, u.image
         FROM lecturer l
         JOIN user u ON l.nip = u.username
         ${whereClause}
         ORDER BY u.name ASC
         LIMIT ${limit} OFFSET ${offset}`,
        queryParams
    ) as any[];

    const items: UserPickerItem[] = rows.map((r: any) => ({
        id: r.nip,
        name: r.name || r.nip,
        identifier: r.nip,
        image: r.image || null,
    }));

    return {
        items,
        totalCount,
        hasMore: offset + items.length < totalCount,
    };
}

export async function getStudentByNim(nim: string): Promise<UserPickerItem | null> {
    const [rows] = await db.execute(
        `SELECT s.nim, u.name, u.image
         FROM student s
         JOIN user u ON s.nim = u.username
         WHERE s.nim = ?
         LIMIT 1`,
        [nim]
    ) as any[];

    if (!rows || rows.length === 0) return null;
    return {
        id: rows[0].nim,
        name: rows[0].name || rows[0].nim,
        identifier: rows[0].nim,
        image: rows[0].image || null,
    };
}

export async function getLecturerByNip(nip: string): Promise<UserPickerItem | null> {
    const [rows] = await db.execute(
        `SELECT l.nip, u.name, u.image
         FROM lecturer l
         JOIN user u ON l.nip = u.username
         WHERE l.nip = ?
         LIMIT 1`,
        [nip]
    ) as any[];

    if (!rows || rows.length === 0) return null;
    return {
        id: rows[0].nip,
        name: rows[0].name || rows[0].nip,
        identifier: rows[0].nip,
        image: rows[0].image || null,
    };
}
