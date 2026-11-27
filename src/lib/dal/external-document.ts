import { db } from "@/lib/db";

// === Types ===
export type ExternalDocumentUrl = {
    name: string;
    url: string;
};

// === Queries ===
/**
 * Mengambil daftar URL dokumen eksternal dari database.
 * Mengembalikan objek map berupa key-value pair { [name]: url }
 * untuk memudahkan akses O(1) pada layer presentasi.
 */
export async function getExternalDocumentUrls(): Promise<Record<string, string>> {
    try {
        const [rows] = await db.execute("SELECT name, url FROM external_document_url") as any[];
        
        const urlMap: Record<string, string> = {};
        for (const row of rows) {
            urlMap[row.name] = row.url;
        }
        
        return urlMap;
    } catch (error) {
        console.error("Error fetching external document URLs:", error);
        return {};
    }
}
