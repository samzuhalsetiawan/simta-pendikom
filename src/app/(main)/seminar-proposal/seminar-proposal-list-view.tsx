"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SeminarProposalWithDetails } from "@/lib/dal/seminar";
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
    Clock,
    MapPin,
    UserCheck,
    ChevronRight,
    Presentation,
    GraduationCap,
    X,
} from "lucide-react";

interface SeminarProposalListViewProps {
    proposals: SeminarProposalWithDetails[];
    currentUsername?: string;
}

export default function SeminarProposalListView({
    proposals,
    currentUsername,
}: SeminarProposalListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("semua");
    const [statusFilter, setStatusFilter] = useState<string>("semua");
    const [sortBy, setSortBy] = useState<string>("jadwal_terdekat");

    // Entity filter states
    const [selectedStudent, setSelectedStudent] = useState<UserPickerItem | null>(null);
    const [selectedLecturer, setSelectedLecturer] = useState<UserPickerItem | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);

    const getGroup = (proposal: SeminarProposalWithDetails): "hari_ini" | "mendatang" | "sebelumnya" => {
        if (!proposal.scheduled_date) return "mendatang";

        const now = new Date();
        const todayStr = now.toLocaleDateString("en-CA");
        const schedDate = new Date(proposal.scheduled_date);
        const schedStr = schedDate.toLocaleDateString("en-CA");

        if (schedStr === todayStr) return "hari_ini";
        if (schedStr < todayStr) return "sebelumnya";
        return "mendatang";
    };

    const counts = useMemo(() => {
        return {
            semua: proposals.length,
            hari_ini: proposals.filter((p) => getGroup(p) === "hari_ini").length,
            mendatang: proposals.filter((p) => getGroup(p) === "mendatang").length,
            sebelumnya: proposals.filter((p) => getGroup(p) === "sebelumnya").length,
        };
    }, [proposals]);

    const filteredAndSortedProposals = useMemo(() => {
        const filtered = proposals.filter((p) => {
            // Student entity filter
            if (selectedStudent && p.student_nim !== selectedStudent.identifier) {
                return false;
            }

            // Lecturer entity filter
            if (selectedLecturer && !p.lecturers.some((l) => l.nip === selectedLecturer.identifier)) {
                return false;
            }

            // Tab filter
            if (activeTab !== "semua") {
                if (getGroup(p) !== activeTab) return false;
            }

            // Status filter
            if (statusFilter !== "semua") {
                if (statusFilter === "pending") {
                    if (p.status !== "pending" && p.status !== "pending_approval") return false;
                } else if (statusFilter === "fail") {
                    if (p.status !== "fail" && p.status !== "rejected") return false;
                } else if (p.status !== statusFilter) {
                    return false;
                }
            }

            // Search filter - focused on thesis title
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                if (!p.thesis_title?.toLowerCase().includes(q)) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "jadwal_terjauh":
                    return new Date(b.scheduled_date || 0).getTime() - new Date(a.scheduled_date || 0).getTime();
                case "nama_asc":
                    return (a.student_name || "").localeCompare(b.student_name || "");
                case "judul_asc":
                    return (a.thesis_title || "").localeCompare(b.thesis_title || "");
                case "jadwal_terdekat":
                default: {
                    const timeA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : Infinity;
                    const timeB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : Infinity;
                    return timeA - timeB;
                }
            }
        });
    }, [proposals, selectedStudent, selectedLecturer, activeTab, statusFilter, searchQuery, sortBy]);

    const formatDateTime = (isoString: string | null) => {
        if (!isoString) return "Belum dijadwalkan";
        const d = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        }).format(d);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-2.5 py-0.5">Dijadwalkan</Badge>;
            case "pass":
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-2.5 py-0.5">Lulus</Badge>;
            case "fail":
            case "rejected":
                return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold px-2.5 py-0.5">Tidak Lulus</Badge>;
            case "pending":
            case "pending_approval":
            default:
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-2.5 py-0.5">Menunggu Persetujuan</Badge>;
        }
    };

    const hasActiveFilters =
        activeTab !== "semua" ||
        statusFilter !== "semua" ||
        searchQuery.trim() !== "" ||
        selectedStudent !== null ||
        selectedLecturer !== null ||
        sortBy !== "jadwal_terdekat";

    const resetFilters = () => {
        setActiveTab("semua");
        setStatusFilter("semua");
        setSearchQuery("");
        setSelectedStudent(null);
        setSelectedLecturer(null);
        setSortBy("jadwal_terdekat");
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
            <ListPageHeader
                breadcrumbs={[{ label: "Seminar Proposal" }]}
                variant="seminar-proposal"
            />

            <ListToolbar
                variant="seminar-proposal"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Cari judul skripsi/proposal..."
                tabs={[
                    { id: "semua", label: "Semua", count: counts.semua },
                    { id: "hari_ini", label: "Hari Ini", count: counts.hari_ini },
                    { id: "mendatang", label: "Mendatang", count: counts.mendatang },
                    { id: "sebelumnya", label: "Riwayat", count: counts.sebelumnya },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                filters={[
                    {
                        id: "status",
                        label: "Status Seminar",
                        value: statusFilter,
                        onValueChange: setStatusFilter,
                        options: [
                            { label: "Semua Status", value: "semua" },
                            { label: "Dijadwalkan", value: "approved" },
                            { label: "Lulus", value: "pass" },
                            { label: "Menunggu Persetujuan", value: "pending" },
                            { label: "Tidak Lulus / Ditolak", value: "fail" },
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
                                <GraduationCap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span>Mahasiswa: Semua</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                <Avatar className="h-5 w-5 border border-amber-500/30 shrink-0">
                                    <AvatarImage src={selectedStudent.image || "/default_user_photo.png"} />
                                    <AvatarFallback className="text-[9px] bg-amber-500/20 text-amber-600">
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
                        { label: "Jadwal (Terdekat)", value: "jadwal_terdekat" },
                        { label: "Jadwal (Terjauh)", value: "jadwal_terjauh" },
                        { label: "Nama Mahasiswa (A - Z)", value: "nama_asc" },
                        { label: "Judul Skripsi (A - Z)", value: "judul_asc" },
                    ],
                }}
                hideCount={true}
                itemName="seminar proposal"
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {filteredAndSortedProposals.length === 0 ? (
                <ListEmptyState
                    icon={<Presentation className="h-10 w-10 text-amber-500/60" />}
                    title="Tidak Ditemukan Seminar Proposal"
                    description={
                        hasActiveFilters
                            ? "Tidak ada seminar proposal yang sesuai dengan filter atau kata kunci pencarian Anda. Coba atur ulang filter."
                            : "Belum ada agenda pelaksanaan seminar proposal pada kategori ini."
                    }
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedProposals.map((proposal) => {
                        const myRole = currentUsername ? proposal.lecturers.find((l) => l.nip === currentUsername)?.role : undefined;

                        return (
                            <Link
                                key={proposal.id}
                                href={`/seminar-proposal/${proposal.id}`}
                                className="group block focus:outline-none"
                            >
                                <GradientCard
                                    variant="seminar-proposal"
                                    className="h-full border border-border/60 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <GradientCardHeader variant="seminar-proposal" className="p-4">
                                        <div className="flex items-start justify-between gap-3 w-full">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-11 w-11 shrink-0 border-2 border-border/50 shadow-2xs">
                                                    <AvatarImage src={proposal.student_image || "/default_user_photo.png"} className="object-cover" />
                                                    <AvatarFallback className="bg-amber-500/10 text-sm font-bold text-amber-600">
                                                        {proposal.student_name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                        {proposal.student_name}
                                                    </h4>
                                                    <p className="text-xs font-mono text-muted-foreground">
                                                        NIM. {proposal.student_nim}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getStatusBadge(proposal.status)}
                                            </div>
                                        </div>
                                    </GradientCardHeader>

                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        {/* Thesis Title */}
                                        <div className="rounded-xl bg-muted/30 p-3 border border-border/30">
                                            <p className="line-clamp-2 text-xs font-semibold text-foreground/90 leading-relaxed">
                                                {proposal.thesis_title || "Judul skripsi belum ditentukan"}
                                            </p>
                                        </div>

                                        {/* Lecturers preview */}
                                        {proposal.lecturers.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Dosen Pembimbing</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {proposal.lecturers.filter((l) => l.role === "supervisor").map((l) => (
                                                        <span key={l.nip} className="inline-block rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground truncate max-w-[200px]">
                                                            {l.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Schedule & Action */}
                                        <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
                                            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                    <span className="font-medium text-foreground/80 truncate">{formatDateTime(proposal.scheduled_date)}</span>
                                                </div>
                                                {proposal.venue && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                                        <span className="truncate">{proposal.venue}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-1 text-xs">
                                                {myRole ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                        <UserCheck className="h-3 w-3" />
                                                        {myRole === "supervisor" ? "Pembimbing" : "Penguji"}
                                                    </span>
                                                ) : (
                                                    <span />
                                                )}
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform ml-auto">
                                                    Detail Seminar <ChevronRight className="h-3.5 w-3.5" />
                                                </span>
                                            </div>
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
                description="Cari berdasarkan nama mahasiswa atau NIM untuk memfilter seminar proposal."
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
                description="Cari berdasarkan nama dosen atau NIP untuk memfilter seminar proposal."
                searchPlaceholder="Cari nama atau NIP dosen..."
                entityTypeLabel="Dosen"
                selectedId={selectedLecturer?.id}
                onSelect={setSelectedLecturer}
                fetcher={searchLecturersAction}
            />
        </div>
    );
}
