import fs from "fs/promises";
import path from "path";

/**
 * Reads a signature image from the local file system and converts it to a Base64 data URL.
 * @param signatureRelativePath The relative path stored in the database (e.g. '/uploads/signatures/xyz.png')
 * @returns The Base64 data URL, or null if the signature cannot be loaded.
 */
export async function getSignatureBuffer(signatureRelativePath: string | null): Promise<Buffer | null> {
    if (!signatureRelativePath) return null;

    try {
        const cleanedPath = signatureRelativePath.replace(/^\/api\//, '').replace(/^\//, '');
        const sigPath = path.join(process.cwd(), cleanedPath);
        const fileBuffer = await fs.readFile(sigPath);
        return fileBuffer;
    } catch (e) {
        console.error("Failed to load signature file at", signatureRelativePath, e);
        return null;
    }
}
