/**
 * Konstan standar penilaian akademik & kelulusan seminar
 */

// Batas minimum kelulusan seminar (> 60 alias predikat C ke atas)
export const MIN_PASSING_SCORE = 60;

// Batas rentang nilai predikat alfabet
export const GRADE_THRESHOLDS = {
    A: 80, // > 80
    B: 70, // > 70 sampai 80
    C: 60, // > 60 sampai 70
    D: 0,  // > 0 sampai 60
    E: 0   // <= 0
} as const;
