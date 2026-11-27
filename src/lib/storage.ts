import fs from "fs/promises";
import path from "path";
import { db } from "./db";

const AVATAR_DIR = path.join(process.cwd(), "uploaded", "avatar");
const SIGNATURE_DIR = path.join(process.cwd(), "uploaded", "signature");

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
        await fs.mkdir(AVATAR_DIR, { recursive: true });

        const allowedExts = ["jpg", "jpeg", "png"];
        if (!allowedExts.includes(extension.toLowerCase())) {
            throw new Error("Format file tidak diizinkan. Gunakan jpg, jpeg, atau png.");
        }

        const fileName = `avatar_${username}.${extension.toLowerCase()}`;
        const filePath = path.join(AVATAR_DIR, fileName);

        // Delete other possible extensions for this user to avoid "ghost" files
        for (const ext of allowedExts) {
            if (ext !== extension.toLowerCase()) {
                const oldFile = path.join(AVATAR_DIR, `avatar_${username}.${ext}`);
                try {
                    await fs.unlink(oldFile);
                } catch (e) {
                    // Ignore if file doesn't exist
                }
            }
        }

        await fs.writeFile(filePath, buffer);

        return `/api/avatar/${username}?t=${Date.now()}`;
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
        await fs.mkdir(SIGNATURE_DIR, { recursive: true });

        const fileName = `signature_${username}.png`;
        const filePath = path.join(SIGNATURE_DIR, fileName);

        await fs.writeFile(filePath, buffer);

        const dbPath = `/api/uploaded/signature/${fileName}`;
        await db.execute('UPDATE user SET signature = ? WHERE username = ?', [dbPath, username]);

        return `/api/signature/${username}?t=${Date.now()}`;
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
