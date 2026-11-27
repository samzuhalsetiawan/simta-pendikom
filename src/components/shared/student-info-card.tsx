import React from "react";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";
import { getStudentInfoCardData } from "@/lib/dal/student";

export interface StudentInfoCardProps {
    nim: string;
    variant?: "lulus" | "pengajuan-proposal" | "seminar-proposal" | "konsultasi" | "penelitian" | "seminar-hasil" | "sidang-skripsi";
}

export async function StudentInfoCard({ nim, variant = "lulus" }: StudentInfoCardProps) {
    if (!nim) return null;
    const studentData = await getStudentInfoCardData(nim);
    
    if (!studentData) return null;

    return (
        <GradientCard variant={variant}>
            <GradientCardHeader variant={variant}>
                <div>
                    <GradientCardTitle>Informasi Mahasiswa</GradientCardTitle>
                    <GradientCardDescription>Data mahasiswa pengusul</GradientCardDescription>
                </div>
            </GradientCardHeader>
            <div className="p-5 flex flex-col gap-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Nama</p>
                    <div className="flex items-center gap-3">
                        {studentData.student_image ? (
                            <img src={studentData.student_image} alt={studentData.student_name || "Mahasiswa"} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm">
                                {studentData.student_name ? studentData.student_name.charAt(0) : '?'}
                            </div>
                        )}
                        <p className="font-medium text-foreground">{studentData.student_name}</p>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">NIM</p>
                    <p className="font-medium text-foreground">{studentData.nim}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Angkatan</p>
                    <p className="font-medium text-foreground">{studentData.generation_year || '-'}</p>
                </div>
                {studentData.progress && (
                    <div>
                        <p className="text-sm text-muted-foreground">Progress Saat Ini</p>
                        <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary capitalize">
                                {studentData.progress.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </GradientCard>
    );
}
