"use server"

import { db } from "@/lib/db";
import { saveAvatar, saveSignature } from "@/lib/storage";
import { revalidatePath } from "next/cache";

function revalidateProfile(username: string) {
    revalidatePath(`/mahasiswa/${username}`);
    revalidatePath(`/dosen/${username}`);
    revalidatePath(`/staff/${username}`);
    revalidatePath("/", "layout");
}

export async function updateAvatar(formData: FormData) {
    try {
        const username = formData.get("username") as string;
        const file = formData.get("file") as File | null;
        if (!username || !file) throw new Error("Data tidak lengkap.");

        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const allowedExts = ["jpg", "jpeg", "png"];
        if (!allowedExts.includes(extension)) {
            throw new Error("Format file tidak didukung. Gunakan JPG atau PNG.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = await saveAvatar(username, buffer, extension);
        await db.execute("UPDATE user SET image = ? WHERE username = ?", [path, username]);
        revalidateProfile(username);
        return { success: true, path };
    } catch (error: any) {
        return { error: error.message || "Gagal update foto profil" };
    }
}

export async function updateEmail(username: string, newEmail: string) {
    try {
        const [existing] = await db.execute("SELECT id FROM user WHERE email = ? AND username != ?", [newEmail, username]) as any[];
        if (existing.length > 0) {
            return { error: "Email sudah digunakan oleh akun lain." };
        }
        await db.execute("UPDATE user SET email = ?, emailVerified = 0 WHERE username = ?", [newEmail, username]);
        revalidateProfile(username);
        return { success: true };
    } catch {
        return { error: "Gagal mengubah email." };
    }
}

export async function updatePhoneNumber(username: string, phone: string | null) {
    try {
        await db.execute("UPDATE user SET phone_number = ? WHERE username = ?", [phone || null, username]);
        revalidateProfile(username);
        return { success: true };
    } catch {
        return { error: "Gagal mengubah nomor HP." };
    }
}

export async function updateAddress(username: string, address: string | null) {
    try {
        await db.execute("UPDATE user SET address = ? WHERE username = ?", [address || null, username]);
        revalidateProfile(username);
        return { success: true };
    } catch {
        return { error: "Gagal mengubah alamat." };
    }
}

export async function updateSignature(formData: FormData) {
    try {
        const username = formData.get("username") as string;
        const file = formData.get("file") as File | null;
        if (!username || !file) throw new Error("Data tidak lengkap.");

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = await saveSignature(username, buffer);
        revalidateProfile(username);
        return { success: true, path };
    } catch (error: any) {
        return { error: error.message || "Gagal menyimpan tanda tangan." };
    }
}
