"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StudentListItem } from "@/lib/dal/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { ListPageHeader } from "@/components/layout/list-page-header";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ListEmptyState } from "@/components/shared/list-empty-state";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardVariant,
} from "@/components/shared/gradient-card";
import {
    GraduationCap,
    ChevronRight,
} from "lucide-react";

interface MahasiswaListViewProps {
    students: StudentListItem[];
    generations: string[];
    currentUsername?: string;
}

export default function MahasiswaListView({
    students,
    generations,
    currentUsername,
}: MahasiswaListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [generationFilter, setGenerationFilter] = useState<string>("semua");
    const [progressFilter, setProgressFilter] = useState<string>("semua");
    const [sortBy, setSortBy] = useState<string>("nim_desc");

    const filteredAndSortedStudents = useMemo(() => {
        const filtered = students.filter((s) => {
            // Generation filter
            if (generationFilter !== "semua") {
                if (String(s.generation_year) !== generationFilter) return false;
            }

            // Progress filter
            if (progressFilter !== "semua") {
                if (progressFilter === "belum_skripsi") {
                    if (s.thesis_progress && s.thesis_progress !== "") return false;
                } else {
                    if (s.thesis_progress !== progressFilter) return false;
                }
            }

            // Search filter - name, NIM, or thesis title
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const nameMatch = s.name.toLowerCase().includes(q);
                const nimMatch = s.nim.toLowerCase().includes(q);
                const titleMatch = s.thesis_title?.toLowerCase().includes(q) || false;
                if (!nameMatch && !nimMatch && !titleMatch) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "nim_asc":
                    return a.nim.localeCompare(b.nim);
                case "nama_asc":
                    return a.name.localeCompare(b.name);
                case "nama_desc":
                    return b.name.localeCompare(a.name);
                case "nim_desc":
                default:
                    return b.nim.localeCompare(a.nim);
            }
        });
    }, [students, generationFilter, progressFilter, searchQuery, sortBy]);

    const getProgressBadge = (progress: string | null) => {
        if (!progress) {
            return <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-medium px-2 py-0.5 text-[10px]">Belum Skripsi</Badge>;
        }
        switch (progress) {
            case "lulus":
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-2.5 py-0.5 text-[10px]">Lulus</Badge>;
            case "pendadaran":
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold px-2.5 py-0.5 text-[10px]">Sidang Skripsi</Badge>;
            case "seminar_hasil":
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-bold px-2.5 py-0.5 text-[10px]">Seminar Hasil</Badge>;
            case "penelitian":
                return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-bold px-2.5 py-0.5 text-[10px]">Penelitian</Badge>;
            case "seminar_proposal":
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-2.5 py-0.5 text-[10px]">Seminar Proposal</Badge>;
            case "pengajuan_proposal":
            default:
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 font-bold px-2.5 py-0.5 text-[10px]">Pengajuan Proposal</Badge>;
        }
    };

    const getCardVariant = (progress: string | null): GradientCardVariant => {
        if (!progress) return "primary";
        switch (progress) {
            case "lulus": return "lulus";
            case "pendadaran": return "sidang-skripsi";
            case "seminar_hasil": return "seminar-hasil";
            case "penelitian": return "penelitian";
            case "seminar_proposal": return "seminar-proposal";
            case "pengajuan_proposal": return "pengajuan-proposal";
            default: return "primary";
        }
    };

    const hasActiveFilters = generationFilter !== "semua" || progressFilter !== "semua" || searchQuery.trim() !== "" || sortBy !== "nim_desc";

    const resetFilters = () => {
        setGenerationFilter("semua");
        setProgressFilter("semua");
        setSearchQuery("");
        setSortBy("nim_desc");
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
            <ListPageHeader
                breadcrumbs={[{ label: "Mahasiswa" }]}
                variant="primary"
            />

            <ListToolbar
                variant="primary"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Cari nama atau NIM mahasiswa..."
                filters={[
                    {
                        id: "generation",
                        label: "Angkatan",
                        value: generationFilter,
                        onValueChange: setGenerationFilter,
                        options: [
                            { label: "Semua Angkatan", value: "semua" },
                            ...generations.map((gen) => ({
                                label: `Angkatan ${gen}`,
                                value: gen,
                            })),
                        ],
                    },
                    {
                        id: "progress",
                        label: "Tahapan Skripsi",
                        value: progressFilter,
                        onValueChange: setProgressFilter,
                        options: [
                            { label: "Semua Tahapan", value: "semua" },
                            { label: "Belum Skripsi", value: "belum_skripsi" },
                            { label: "Pengajuan Proposal", value: "pengajuan_proposal" },
                            { label: "Seminar Proposal", value: "seminar_proposal" },
                            { label: "Penelitian", value: "penelitian" },
                            { label: "Seminar Hasil", value: "seminar_hasil" },
                            { label: "Sidang Skripsi", value: "pendadaran" },
                            { label: "Lulus Skripsi", value: "lulus" },
                        ],
                    },
                ]}
                sortConfig={{
                    value: sortBy,
                    onValueChange: setSortBy,
                    options: [
                        { label: "NIM (Terbaru)", value: "nim_desc" },
                        { label: "NIM (Terkecil)", value: "nim_asc" },
                        { label: "Nama Mahasiswa (A - Z)", value: "nama_asc" },
                        { label: "Nama Mahasiswa (Z - A)", value: "nama_desc" },
                    ],
                }}
                hideCount={true}
                itemName="mahasiswa"
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {filteredAndSortedStudents.length === 0 ? (
                <ListEmptyState
                    icon={<GraduationCap className="h-10 w-10 text-primary/60" />}
                    title="Tidak Ditemukan Mahasiswa"
                    description={
                        hasActiveFilters
                            ? "Tidak ada mahasiswa yang sesuai dengan filter atau kata kunci pencarian Anda. Coba atur ulang filter."
                            : "Belum ada data mahasiswa yang terdaftar di sistem."
                    }
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedStudents.map((student) => {
                        const isMe = currentUsername === student.nim;
                        const cardVariant = getCardVariant(student.thesis_progress);

                        return (
                            <Link
                                key={student.nim}
                                href={`/mahasiswa/${student.nim}`}
                                className="group block focus:outline-none"
                            >
                                <GradientCard
                                    variant={cardVariant}
                                    className={`h-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                        isMe ? "border-primary ring-1 ring-primary/30" : "border-border/60 hover:border-primary/50"
                                    }`}
                                >
                                    <GradientCardHeader variant={cardVariant} className="p-4">
                                        <div className="flex items-start justify-between gap-3 w-full">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-11 w-11 shrink-0 border-2 border-border/50 shadow-2xs">
                                                    <AvatarImage
                                                        src={student.image || "/default_user_photo.png"}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                                                        {student.name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {student.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                        <span>{student.nim}</span>
                                                        {student.generation_year && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-sans font-medium">Angkatan {student.generation_year}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getProgressBadge(student.thesis_progress)}
                                            </div>
                                        </div>
                                    </GradientCardHeader>

                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        {/* Thesis Preview */}
                                        {student.thesis_title ? (
                                            <div className="rounded-xl bg-muted/30 p-3 border border-border/30 space-y-1.5">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                                    Judul Tugas Akhir
                                                </span>
                                                <p className="line-clamp-2 text-xs font-semibold text-foreground/90 leading-relaxed">
                                                    {student.thesis_title}
                                                </p>
                                                {student.lecturers && student.lecturers.length > 0 && (
                                                    <div className="pt-2 border-t border-border/30 flex flex-wrap gap-1">
                                                        {student.lecturers.filter((l) => l.role === "supervisor").map((l) => (
                                                            <span
                                                                key={l.nip}
                                                                className="inline-block rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground truncate max-w-[190px]"
                                                            >
                                                                {l.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl bg-muted/20 p-4 border border-dashed border-border/40 text-center">
                                                <p className="text-xs text-muted-foreground italic">
                                                    Belum mengajukan tugas akhir
                                                </p>
                                            </div>
                                        )}

                                        {/* Bottom Action */}
                                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                                            {isMe ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                                    Akun Anda
                                                </span>
                                            ) : (
                                                <span />
                                            )}
                                            <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform ml-auto">
                                                Profil Lengkap <ChevronRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </GradientCard>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
