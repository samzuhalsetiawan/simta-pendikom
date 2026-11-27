/**
 * Konstan standar untuk visualisasi dan logika Halaman Kalender Akademik (/kalender)
 */

// Durasi default (dalam menit) untuk agenda seminar atau pendadaran yang tidak memiliki jam selesai eksplisit
export const DEFAULT_EVENT_DURATION_MINUTES = 90;

// Jam default yang berada di tepi atas grid saat pertama kali kalender dimuat (First Look)
export const CALENDAR_FIRST_LOOK_HOUR = 7;

// Tinggi per baris jam (dalam pixel) di grid kalender (1 jam = 80px)
export const HOUR_ROW_HEIGHT_PX = 80;

// Lebar minimum kolom per hari (dalam pixel) pada tampilan grid horizontal agar mudah dibaca di mobile/desktop
export const MIN_COLUMN_WIDTH_PX = 260;

// Batas maksimal pembagian kolom (split) jika terjadi jadwal tumpang tindih (overlapping) pada waktu yang sama
// Jika lebih dari 2, maka kolom pertama untuk event utama dan kolom kedua untuk badge "+n lainnya"
export const MAX_OVERLAP_SPLIT = 2;

export type CalendarEventType = 'proposal' | 'hasil' | 'pendadaran' | 'konsultasi';

export type CalendarViewMode = 'day_hour' | 'month';
