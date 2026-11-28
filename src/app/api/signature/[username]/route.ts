import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        
        const [rows] = await db.execute('SELECT signature FROM user WHERE username = ?', [username]) as any[];
        
        if (rows.length === 0 || !rows[0].signature) {
            return NextResponse.json({ error: "Tanda tangan tidak ditemukan" }, { status: 404 });
        }

        const signatureVal: string = rows[0].signature;
        const blobKey = signatureVal.startsWith("/api/uploaded/")
            ? signatureVal.replace(/^\/api\/uploaded\//, "")
            : signatureVal;

        const blobResult = await get(blobKey, { access: "private" }).catch(() => null);
        if (blobResult && blobResult.statusCode === 200 && blobResult.stream) {
            return new NextResponse(blobResult.stream, {
                headers: {
                    "Content-Type": blobResult.blob.contentType || "image/png",
                    "Cache-Control": "private, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
                },
            });
        }

        // Fallback to local file system if present
        const relativePath = signatureVal.replace(/^\/api\//, '').replace(/^\//, '');
        const filePath = path.join(process.cwd(), relativePath);

        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json({ error: "File tanda tangan tidak ditemukan" }, { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "private, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
    }
}
