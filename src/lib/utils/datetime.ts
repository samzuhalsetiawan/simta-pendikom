export const INDO_MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
];

export const INDO_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const INDO_DAYS_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * Formats a Date object to Indonesian datetime string format:
 * e.g. "Rabu 31 Maret 2023 16:00"
 */
export function formatIndoDateTime(date: Date): string {
    const dayName = INDO_DAYS_FULL[date.getDay()];
    const day = date.getDate();
    const month = INDO_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${dayName} ${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Formats a Date object to Indonesian date format:
 * e.g. "Rabu, 21 Januari 2023"
 */
export function formatIndoDate(date: Date): string {
    const dayName = INDO_DAYS_FULL[date.getDay()];
    const day = date.getDate();
    const month = INDO_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Parses an Indonesian date string (e.g. "Rabu, 21 Januari 2023", "21 Januari 2023", "2023-01-21", "21/01/2023") into a Date object.
 */
export function parseIndoDate(value: string): Date | null {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();

    // Match optional day name with comma/space, day number, month name, year
    const regex = /^(?:([a-zA-Z]+)[,\s]+)?(\d{1,2})[\/\s]+([a-zA-Z]+)[\/\s]+(\d{4})$/;
    const match = trimmed.match(regex);
    if (match) {
        const day = parseInt(match[2], 10);
        const monthStr = match[3].toLowerCase();
        const year = parseInt(match[4], 10);

        const monthIndex = INDO_MONTHS.findIndex(
            (m) => m.toLowerCase() === monthStr || m.toLowerCase().startsWith(monthStr)
        );

        if (monthIndex !== -1 && day >= 1 && day <= 31) {
            const date = new Date(year, monthIndex, day);
            if (!isNaN(date.getTime())) return date;
        }
    }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        if (!isNaN(date.getTime())) return date;
    }

    // DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split("/").map(Number);
        const date = new Date(y, m - 1, d);
        if (!isNaN(date.getTime())) return date;
    }

    return parseIndoDateTime(trimmed);
}

/**
 * Parses a string (Indonesian formatted "Rabu 31 Maret 2023 16:00", "31 Maret 2023 16:00",
 * "31/Maret/2023,16:00" or ISO "2023-03-31T16:00") into a valid Date object, or returns null if invalid.
 */
export function parseIndoDateTime(value: string): Date | null {
    if (!value || typeof value !== "string") return null;

    const trimmed = value.trim();

    // Match optional day name, day number, month name, year, hour, minute
    const regex = /^(?:([a-zA-Z]+)[,\s]+)?(\d{1,2})[\/\s]+([a-zA-Z]+)[\/\s]+(\d{4})[,\s]+(\d{1,2}):(\d{2})$/;
    const match = trimmed.match(regex);
    if (match) {
        const day = parseInt(match[2], 10);
        const monthStr = match[3].toLowerCase();
        const year = parseInt(match[4], 10);
        const hours = parseInt(match[5], 10);
        const minutes = parseInt(match[6], 10);

        const monthIndex = INDO_MONTHS.findIndex(
            (m) => m.toLowerCase() === monthStr || m.toLowerCase().startsWith(monthStr)
        );

        if (monthIndex !== -1 && day >= 1 && day <= 31 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            const date = new Date(year, monthIndex, day, hours, minutes);
            if (!isNaN(date.getTime())) return date;
        }
    }

    // Fallback: try parsing as standard date / ISO string
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) {
        return fallback;
    }

    return null;
}

/**
 * Converts a Date object to ISO string format (YYYY-MM-DDTHH:mm)
 */
export function toIsoDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts a Date object to MySQL datetime format (YYYY-MM-DD HH:mm:ss)
 */
export function toMySQLDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}
