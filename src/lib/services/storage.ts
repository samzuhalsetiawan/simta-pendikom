import fs from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import path from "path";

export interface IStorageProvider {
    exists(key: string[] | string): Promise<boolean>;
    getStream(key: string[] | string): ReadableStream;
    getMimeType(key: string[] | string): string;
}

export class LocalFileSystemProvider implements IStorageProvider {
    private basePath: string;

    constructor(baseDir = "uploaded") {
        this.basePath = path.join(process.cwd(), baseDir);
    }

    private resolveSafePath(key: string[] | string): string {
        const pathArray = Array.isArray(key) ? key : [key];
        const safePath = path.join(...pathArray).replace(/^(\.\.[\/\\])+/, '');
        return path.join(this.basePath, safePath);
    }

    async exists(key: string[] | string): Promise<boolean> {
        try {
            await fs.access(this.resolveSafePath(key));
            return true;
        } catch {
            return false;
        }
    }

    getStream(key: string[] | string): ReadableStream {
        const nodeStream = createReadStream(this.resolveSafePath(key));
        return Readable.toWeb(nodeStream) as ReadableStream;
    }

    getMimeType(key: string[] | string): string {
        const filePath = Array.isArray(key) ? key[key.length - 1] : key;
        const ext = path.extname(filePath).toLowerCase();
        if (ext === ".pdf") return "application/pdf";
        if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
        if (ext === ".png") return "image/png";
        return "application/octet-stream";
    }
}

// Default injected provider (can be swapped for S3Provider/R2Provider in cloud production)
export const storageProvider: IStorageProvider = new LocalFileSystemProvider();

// Backward compatibility helpers
export function getSafeFilePath(pathArray: string[]): string {
    const safePath = path.join(...pathArray).replace(/^(\.\.[\/\\])+/, '');
    return path.join(process.cwd(), "uploaded", safePath);
}

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export function getFileMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") return "application/pdf";
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".png") return "image/png";
    return "application/octet-stream";
}

export function getFileWebStream(filePath: string): ReadableStream {
    const nodeStream = createReadStream(filePath);
    return Readable.toWeb(nodeStream) as ReadableStream;
}

