import { Thesis } from "@/types/thesis";

export function calculateProgress(thesis: Thesis[]) {
  if (thesis.length === 0) return 0;
  const totalScore = thesis.reduce((acc, t) => {
    let weight;
    switch (t.progress) {
      case "Pengajuan Judul":
        weight = 1;
        break;
      case "Seminar Proposal":
        weight = 2;
        break;
      case "Penelitian":
        weight = 3;
        break;
      case "Seminar Hasil":
        weight = 4;
        break;
      case "Sidang Akhir":
        weight = 5;
        break;
      case "Selesai":
        weight = 6;
        break;
      default:
        weight = 0;
        break;
    }
    return acc + (weight / 6) * 100;
  }, 0);
  return Math.round(totalScore / thesis.length);
}
