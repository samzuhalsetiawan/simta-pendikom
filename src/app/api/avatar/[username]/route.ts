import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const allowedExts = ["jpg", "jpeg", "png"];

        for (const ext of allowedExts) {
            const blobKey = `avatar/avatar_${username}.${ext}`;
            const blobResult = await get(blobKey, { access: "private" }).catch(() => null);
            if (blobResult && blobResult.statusCode === 200 && blobResult.stream) {
                return new NextResponse(blobResult.stream, {
                    headers: {
                        "Content-Type": blobResult.blob.contentType || `image/${ext === "jpg" ? "jpeg" : ext}`,
                        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
                    },
                });
            }
        }

        const uploadDir = path.join(process.cwd(), "uploaded", "avatar");
        let filePath = "";
        let contentType = "";

        for (const ext of allowedExts) {
            const potentialPath = path.join(uploadDir, `avatar_${username}.${ext}`);
            try {
                await fs.access(potentialPath);
                filePath = potentialPath;
                contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;
                break;
            } catch {
                // Continue to next extension
            }
        }

        if (!filePath) {
            return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
    }
}
