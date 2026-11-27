import { GRADE_THRESHOLDS } from "@/lib/constants/scoring";

export function getGradeFromScore(score?: number | null): string {
    if (score === undefined || score === null) return '-';
    if (isNaN(score)) return '-';
    if (score <= GRADE_THRESHOLDS.E) return 'E';
    if (score <= GRADE_THRESHOLDS.C) return 'D';
    if (score <= GRADE_THRESHOLDS.B) return 'C';
    if (score <= GRADE_THRESHOLDS.A) return 'B';
    return 'A';
}

export function calculateAverageScore(scores: (number | null | undefined)[]): number | null {
    if (!scores || scores.length === 0) return null;
    const validScores = scores.filter((s): s is number => typeof s === 'number' && !isNaN(s));
    if (validScores.length === 0) return null;
    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / validScores.length);
}
