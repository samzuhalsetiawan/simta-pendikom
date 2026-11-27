"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ThesisListItem } from "@/lib/dal/thesis";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { ListPageHeader } from "@/components/layout/list-page-header";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ListEmptyState } from "@/components/shared/list-empty-state";
import {
    GradientCard,
    GradientCardHeader,
} from "@/components/shared/gradient-card";
import { EntityPickerModal } from "@/components/shared/entity-picker-modal";
import {
    searchStudentsAction,
    searchLecturersAction,
    UserPickerItem,
} from "@/lib/actions/user-picker";
import {
    BookOpen,
    UserCheck,
    ChevronRight,
    GraduationCap,
    X,
} from "lucide-react";

interface SkripsiListViewProps {
    theses: ThesisListItem[];
    generations: string[];
    currentUsername?: string;
}

export default function SkripsiListView({
    theses,
    generations,
    currentUsername,
}: SkripsiListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [generationFilter, setGenerationFilter] = useState<string>("semua");
    const [progressFilter, setProgressFilter] = useState<string>("semua");
    const [researchTypeFilter, setResearchTypeFilter] = useState<string>("semua");
    const [sortBy, setSortBy] = useState<string>("terbaru");

    // Entity filter states
    const [selectedStudent, setSelectedStudent] = useState<UserPickerItem | null>(null);
    const [selectedLecturer, setSelectedLecturer] = useState<UserPickerItem | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);

    const filteredAndSortedTheses = useMemo(() => {
        const filtered = theses.filter((t) => {
            // Student entity filter
            if (selectedStudent && t.nim !== selectedStudent.identifier) {
                return false;
            }

            // Lecturer entity filter
            if (selectedLecturer && !t.lecturers?.some((l) => l.nip === selectedLecturer.identifier)) {
                return false;
            }

            // Generation filter
            if (generationFilter !== "semua") {
                if (String(t.generation_year) !== generationFilter) return false;
            }

            // Progress filter
            if (progressFilter !== "semua") {
                if (t.progress !== progressFilter) return false;
            }

            // Research type filter
            if (researchTypeFilter !== "semua") {
                if ((t.research_type || "").toLowerCase() !== researchTypeFilter) return false;
            }

            // Search filter - focused on thesis title
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                if (!t.title?.toLowerCase().includes(q)) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "terlama":
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case "judul_asc":
                    return (a.title || "").localeCompare(b.title || "");
                case "judul_desc":
                    return (b.title || "").localeCompare(a.title || "");
                case "nama_asc":
                    return (a.student_name || "").localeCompare(b.student_name || "");
                case "nama_desc":
                    return (b.student_name || "").localeCompare(a.student_name || "");
                case "terbaru":
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [theses, selectedStudent, selectedLecturer, generationFilter, progressFilter, researchTypeFilter, searchQuery, sortBy]);

    const getProgressBadge = (progress: string) => {
        switch (progress) {
            case "lulus":
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-2.5 py-0.5">Lulus</Badge>;
            case "pendadaran":
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold px-2.5 py-0.5">Sidang Skripsi</Badge>;
            case "seminar_hasil":
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-bold px-2.5 py-0.5">Seminar Hasil</Badge>;
            case "penelitian":
                return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-bold px-2.5 py-0.5">Penelitian</Badge>;
            case "seminar_proposal":
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-2.5 py-0.5">Seminar Proposal</Badge>;
            case "pengajuan_proposal":
            default:
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 font-bold px-2.5 py-0.5">Pengajuan Proposal</Badge>;
        }
    };

    const getCardVariant = (progress: string): "lulus" | "sidang-skripsi" | "seminar-hasil" | "seminar-proposal" | "pengajuan-proposal" => {
        switch (progress) {
            case "lulus":
                return "lulus";
            case "pendadaran":
                return "sidang-skripsi";
            case "seminar_hasil":
            case "penelitian":
                return "seminar-hasil";
            case "seminar_proposal":
                return "seminar-proposal";
            case "pengajuan_proposal":
            default:
                return "pengajuan-proposal";
        }
    };

    const hasActiveFilters =
        generationFilter !== "semua" ||
        progressFilter !== "semua" ||
        researchTypeFilter !== "semua" ||
        searchQuery.trim() !== "" ||
        selectedStudent !== null ||
        selectedLecturer !== null ||
        sortBy !== "terbaru";

    const resetFilters = () => {
        setGenerationFilter("semua");
        setProgressFilter("semua");
        setResearchTypeFilter("semua");
        setSearchQuery("");
        setSelectedStudent(null);
        setSelectedLecturer(null);
        setSortBy("terbaru");
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
            <ListPageHeader
                breadcrumbs={[{ label: "Skripsi" }]}
                variant="lulus"
            />

            <ListToolbar
                variant="lulus"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Cari judul skripsi/proposal..."
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
                        label: "Tahapan",
                        value: progressFilter,
                        onValueChange: setProgressFilter,
                        options: [
                            { label: "Semua Tahapan", value: "semua" },
                            { label: "Pengajuan Proposal", value: "pengajuan_proposal" },
                            { label: "Seminar Proposal", value: "seminar_proposal" },
                            { label: "Penelitian", value: "penelitian" },
                            { label: "Seminar Hasil", value: "seminar_hasil" },
                            { label: "Sidang Skripsi", value: "pendadaran" },
                            { label: "Lulus Skripsi", value: "lulus" },
                        ],
                    },
                    {
                        id: "researchType",
                        label: "Jenis Penelitian",
                        value: researchTypeFilter,
                        onValueChange: setResearchTypeFilter,
                        options: [
                            { label: "Semua Jenis Penelitian", value: "semua" },
                            { label: "Kuantitatif", value: "kuantitatif" },
                            { label: "Kualitatif", value: "kualitatif" },
                            { label: "Pengembangan (R&D)", value: "pengembangan" },
                            { label: "Campuran (Mixed)", value: "campuran" },
                        ],
                    },
                ]}
                customFilters={
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Student Filter Trigger Button / Active Chip */}
                        {!selectedStudent ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsStudentModalOpen(true)}
                                className="h-9 px-3 text-xs font-medium rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer shadow-none"
                            >
                                <GraduationCap className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span>Mahasiswa: Semua</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                <Avatar className="h-5 w-5 border border-emerald-500/30 shrink-0">
                                    <AvatarImage src={selectedStudent.image || "/default_user_photo.png"} />
                                    <AvatarFallback className="text-[9px] bg-emerald-500/20 text-emerald-600">
                                        {selectedStudent.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={() => setIsStudentModalOpen(true)}
                                    className="truncate max-w-[120px] sm:max-w-[150px] hover:underline cursor-pointer"
                                    title={`Ganti mahasiswa (${selectedStudent.name})`}
                                >
                                    {selectedStudent.name}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-0.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer ml-0.5"
                                    title="Hapus filter mahasiswa"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {/* Lecturer Filter Trigger Button / Active Chip */}
                        {!selectedLecturer ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsLecturerModalOpen(true)}
                                className="h-9 px-3 text-xs font-medium rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer shadow-none"
                            >
                                <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span>Dosen: Semua</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                <Avatar className="h-5 w-5 border border-emerald-500/30 shrink-0">
                                    <AvatarImage src={selectedLecturer.image || "/default_user_photo.png"} />
                                    <AvatarFallback className="text-[9px] bg-emerald-500/20 text-emerald-600">
                                        {selectedLecturer.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={() => setIsLecturerModalOpen(true)}
                                    className="truncate max-w-[120px] sm:max-w-[150px] hover:underline cursor-pointer"
                                    title={`Ganti dosen (${selectedLecturer.name})`}
                                >
                                    {selectedLecturer.name}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLecturer(null)}
                                    className="p-0.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer ml-0.5"
                                    title="Hapus filter dosen"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                }
                sortConfig={{
                    value: sortBy,
                    onValueChange: setSortBy,
                    options: [
                        { label: "Tanggal (Terbaru)", value: "terbaru" },
                        { label: "Tanggal (Terlama)", value: "terlama" },
                        { label: "Judul Skripsi (A - Z)", value: "judul_asc" },
                        { label: "Judul Skripsi (Z - A)", value: "judul_desc" },
                        { label: "Nama Mahasiswa (A - Z)", value: "nama_asc" },
                        { label: "Nama Mahasiswa (Z - A)", value: "nama_desc" },
                    ],
                }}
                hideCount={true}
                itemName="skripsi"
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {filteredAndSortedTheses.length === 0 ? (
                <ListEmptyState
                    icon={<BookOpen className="h-10 w-10 text-emerald-500/60" />}
                    title="Tidak Ada Skripsi Ditemukan"
                    description={
                        hasActiveFilters
                            ? "Tidak ada skripsi yang sesuai dengan kriteria filter dan kata kunci pencarian Anda. Coba atur ulang filter."
                            : "Belum ada data skripsi mahasiswa yang terdaftar di sistem."
                    }
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedTheses.map((thesis) => {
                        const myRole = currentUsername
                            ? thesis.lecturers?.find((l) => l.nip === currentUsername)?.role
                            : undefined;
                        const cardVariant = getCardVariant(thesis.progress);

                        return (
                            <Link
                                key={thesis.id}
                                href={`/skripsi/${thesis.id}`}
                                className="group block focus:outline-none"
                            >
                                <GradientCard
                                    variant={cardVariant}
                                    className="h-full border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <GradientCardHeader variant={cardVariant} className="p-4">
                                        <div className="flex items-start justify-between gap-3 w-full">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-11 w-11 shrink-0 border-2 border-border/50 shadow-2xs">
                                                    <AvatarImage
                                                        src={thesis.student_image || "/default_user_photo.png"}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                                                        {thesis.student_name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {thesis.student_name}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                        <span>{thesis.nim}</span>
                                                        {thesis.generation_year && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-sans font-medium">Angkatan {thesis.generation_year}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getProgressBadge(thesis.progress)}
                                            </div>
                                        </div>
                                    </GradientCardHeader>

                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        {/* Thesis Title */}
                                        <div className="rounded-xl bg-muted/30 p-3 border border-border/30 space-y-1.5">
                                            {thesis.research_type && (
                                                <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                                    {thesis.research_type}
                                                </span>
                                            )}
                                            <p className="line-clamp-2 text-xs font-semibold text-foreground/90 leading-relaxed">
                                                {thesis.title || "Judul skripsi belum ditentukan"}
                                            </p>
                                        </div>

                                        {/* Lecturers preview */}
                                        {thesis.lecturers && thesis.lecturers.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                                    Dosen Pembimbing
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {thesis.lecturers.filter((l) => l.role === "supervisor").map((l) => (
                                                        <span
                                                            key={l.nip}
                                                            className="inline-block rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground truncate max-w-[200px]"
                                                        >
                                                            {l.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Action */}
                                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                                            {myRole ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    {myRole === "supervisor" ? "Pembimbing" : "Penguji"}
                                                </span>
                                            ) : (
                                                <span />
                                            )}
                                            <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform ml-auto">
                                                Lihat Detail <ChevronRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </GradientCard>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Student Picker Modal */}
            <EntityPickerModal
                open={isStudentModalOpen}
                onOpenChange={setIsStudentModalOpen}
                title="Pilih Mahasiswa"
                description="Cari berdasarkan nama mahasiswa atau NIM untuk memfilter skripsi."
                searchPlaceholder="Cari nama atau NIM mahasiswa..."
                entityTypeLabel="Mahasiswa"
                selectedId={selectedStudent?.id}
                onSelect={setSelectedStudent}
                fetcher={searchStudentsAction}
            />

            {/* Lecturer Picker Modal */}
            <EntityPickerModal
                open={isLecturerModalOpen}
                onOpenChange={setIsLecturerModalOpen}
                title="Pilih Dosen"
                description="Cari berdasarkan nama dosen atau NIP untuk memfilter skripsi."
                searchPlaceholder="Cari nama atau NIP dosen..."
                entityTypeLabel="Dosen"
                selectedId={selectedLecturer?.id}
                onSelect={setSelectedLecturer}
                fetcher={searchLecturersAction}
            />
        </div>
    );
}
