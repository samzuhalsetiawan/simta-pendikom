import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isFileAuthorized } from "@/lib/services/file-authorization";
import { storageProvider } from "@/lib/services/storage";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await context.params;
        const fileName = pathArray[pathArray.length - 1];

        const session = await auth.api.getSession({ headers: await headers() });
        const authorized = await isFileAuthorized(fileName, session);

        if (!authorized) {
            return NextResponse.json({ error: "Forbidden: Anda tidak memiliki akses ke dokumen ini" }, { status: 403 });
        }

        const exists = await storageProvider.exists(pathArray);
        if (!exists) {
            return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
        }

        const webStream = storageProvider.getStream(pathArray);
        const contentType = storageProvider.getMimeType(pathArray);

        return new NextResponse(webStream, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("File download error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
    }
}

export async function HEAD(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await context.params;
        const fileName = pathArray[pathArray.length - 1];

        const session = await auth.api.getSession({ headers: await headers() });
        const authorized = await isFileAuthorized(fileName, session);

        if (!authorized) {
            return new NextResponse(null, { status: 403 });
        }

        const exists = await storageProvider.exists(pathArray);
        if (!exists) {
            return new NextResponse(null, { status: 404 });
        }

        const contentType = storageProvider.getMimeType(pathArray);
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("File HEAD error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
