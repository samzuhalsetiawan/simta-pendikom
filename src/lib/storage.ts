import { put, del } from "@vercel/blob";
import { db } from "./db";

/**
 * Saves an avatar image to the local file system.
 * Uses a modular approach to allow easy transition to cloud storage.
 * 
 * @param username The unique username (NIM/NIP) of the user
 * @param buffer The image data as a Buffer
 * @param extension The file extension (jpg, jpeg, png)
 * @returns The virtual path used by the API route
 */
export async function saveAvatar(username: string, buffer: Buffer, extension: string): Promise<string> {
    try {
        const allowedExts = ["jpg", "jpeg", "png"];
        const ext = extension.toLowerCase();
        if (!allowedExts.includes(ext)) {
            throw new Error("Format file tidak diizinkan. Gunakan jpg, jpeg, atau png.");
        }

        const fileName = `avatar/avatar_${username}.${ext}`;
        const blob = await put(fileName, buffer, {
            access: "public",
            allowOverwrite: true,
        });

        return blob.url;
    } catch (error) {
        console.error("Error saving avatar:", error);
        throw new Error("Gagal menyimpan foto profil.");
    }
}

/**
 * Saves a signature image (PNG) to the local file system.
 * 
 * @param username The unique username (NIM/NIP) of the user
 * @param buffer The PNG image data as a Buffer
 * @returns The virtual path used by the API route
 */
export async function saveSignature(username: string, buffer: Buffer): Promise<string> {
    try {
        const fileName = `signature/signature_${username}.png`;
        const blob = await put(fileName, buffer, {
            access: "public",
            allowOverwrite: true,
        });

        await db.query('UPDATE "user" SET signature = $1 WHERE username = $2', [blob.url, username]);

        return blob.url;
    } catch (error) {
        console.error("Error saving signature:", error);
        throw new Error("Gagal menyimpan tanda tangan.");
    }
}

/**
 * Checks if a signature file exists for a given user.
 * 
 * @param username The unique username (NIM/NIP) of the user
 * @returns The virtual API path if exists, or null
 */
export async function getSignaturePath(username: string): Promise<string | null> {
    try {
        const [rows] = await db.execute('SELECT signature FROM user WHERE username = ?', [username]) as any[];
        if (rows.length > 0 && rows[0].signature) {
            return `/api/signature/${username}?t=${Date.now()}`;
        }
        return null;
    } catch (error) {
        console.error("Error getting signature path:", error);
        return null;
    }
}
