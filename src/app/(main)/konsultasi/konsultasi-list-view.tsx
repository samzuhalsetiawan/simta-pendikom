"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Consultation } from "@/lib/dal/consultation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { DatePicker } from "@/components/base/date-picker";
import { ListPageHeader } from "@/components/layout/list-page-header";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ListEmptyState } from "@/components/shared/list-empty-state";
import { Pagination } from "@/components/shared/pagination";
import { EntityPickerModal } from "@/components/shared/entity-picker-modal";
import {
    searchStudentsAction,
    searchLecturersAction,
    UserPickerItem,
} from "@/lib/actions/user-picker";
import {
    GradientCard,
    GradientCardHeader,
} from "@/components/shared/gradient-card";
import { useDebounce } from "@/lib/utils/use-debounce";
import { cn } from "@/lib/utils/utils";
import {
    MessageSquare,
    Clock,
    Calendar,
    ChevronRight,
    MapPin,
    UserCheck,
    GraduationCap,
    X,
} from "lucide-react";

interface KonsultasiListViewProps {
    consultations: Consultation[];
    paginationMeta: {
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    initialFilters: {
        search: string;
        status: string;
        dateFilter: string;
        startDate: string;
        endDate: string;
        sortBy: string;
        studentNim?: string;
        lecturerNip?: string;
    };
    initialSelectedStudent?: UserPickerItem | null;
    initialSelectedLecturer?: UserPickerItem | null;
    currentUsername?: string;
    currentUserRole?: string;
}

export default function KonsultasiListView({
    consultations,
    paginationMeta,
    initialFilters,
    initialSelectedStudent,
    initialSelectedLecturer,
    currentUsername,
}: KonsultasiListViewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Local states
    const [searchQuery, setSearchQuery] = useState(initialFilters.search);
    const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status);
    const [dateFilter, setDateFilter] = useState<string>(initialFilters.dateFilter);
    const [startDate, setStartDate] = useState<string>(initialFilters.startDate);
    const [endDate, setEndDate] = useState<string>(initialFilters.endDate);
    const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy);

    // Entity filter states
    const [selectedStudent, setSelectedStudent] = useState<UserPickerItem | null>(
        initialSelectedStudent || null
    );
    const [selectedLecturer, setSelectedLecturer] = useState<UserPickerItem | null>(
        initialSelectedLecturer || null
    );
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);

    // Sync when initialFilters change (e.g. browser back/forward)
    useEffect(() => {
        setSearchQuery(initialFilters.search);
        setStatusFilter(initialFilters.status);
        setDateFilter(initialFilters.dateFilter);
        setStartDate(initialFilters.startDate);
        setEndDate(initialFilters.endDate);
        setSortBy(initialFilters.sortBy);
        setSelectedStudent(initialSelectedStudent || null);
        setSelectedLecturer(initialSelectedLecturer || null);
    }, [
        initialFilters.search,
        initialFilters.status,
        initialFilters.dateFilter,
        initialFilters.startDate,
        initialFilters.endDate,
        initialFilters.sortBy,
        initialSelectedStudent,
        initialSelectedLecturer,
    ]);

    // Helper to update URL params via Next.js router transition
    const updateQueryParams = (
        updates: Record<string, string | null | undefined>,
        mode: "replace" | "push" = "replace"
    ) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                (key === "page" && value === "1") ||
                (key === "limit" && value === "12") ||
                (key === "status" && value === "semua") ||
                (key === "date" && value === "semua") ||
                (key === "sortBy" && value === "terbaru")
            ) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;

        startTransition(() => {
            if (mode === "push") {
                router.push(url);
            } else {
                router.replace(url);
            }
        });
    };

    // Debounced search for title / topic
    const debouncedSearch = useDebounce(searchQuery, 350);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (debouncedSearch !== initialFilters.search) {
            updateQueryParams({ q: debouncedSearch, page: "1" });
        }
    }, [debouncedSearch]);

    // Filter Handlers
    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        updateQueryParams({ status: val, page: "1" });
    };

    const handleDateFilterChange = (val: string) => {
        setDateFilter(val);
        if (val !== "rentang") {
            setStartDate("");
            setEndDate("");
            updateQueryParams({ date: val, startDate: null, endDate: null, page: "1" });
        } else {
            updateQueryParams({ date: val, page: "1" });
        }
    };

    const handleStartDateChange = (iso: string) => {
        setStartDate(iso);
        updateQueryParams({ startDate: iso || null, page: "1" });
    };

    const handleEndDateChange = (iso: string) => {
        setEndDate(iso);
        updateQueryParams({ endDate: iso || null, page: "1" });
    };

    const handleSortChange = (val: string) => {
        setSortBy(val);
        updateQueryParams({ sortBy: val, page: "1" });
    };

    const handleSelectStudent = (student: UserPickerItem | null) => {
        setSelectedStudent(student);
        updateQueryParams({ student: student?.id || null, page: "1" });
    };

    const handleSelectLecturer = (lecturer: UserPickerItem | null) => {
        setSelectedLecturer(lecturer);
        updateQueryParams({ lecturer: lecturer?.id || null, page: "1" });
    };

    const handlePageChange = (newPage: number) => {
        updateQueryParams({ page: String(newPage) }, "push");
    };

    const handlePageSizeChange = (newSize: number) => {
        updateQueryParams({ limit: String(newSize), page: "1" });
    };

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("semua");
        setDateFilter("semua");
        setStartDate("");
        setEndDate("");
        setSortBy("terbaru");
        setSelectedStudent(null);
        setSelectedLecturer(null);
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasActiveFilters =
        statusFilter !== "semua" ||
        dateFilter !== "semua" ||
        !!startDate ||
        !!endDate ||
        searchQuery.trim() !== "" ||
        sortBy !== "terbaru" ||
        !!selectedStudent ||
        !!selectedLecturer;

    const formatDateTime = (
        isoDate: Date | string | null | undefined,
        createdDate?: Date | string
    ) => {
        if (isoDate) {
            const d = new Date(isoDate);
            return new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(d);
        }

        if (createdDate) {
            const d = new Date(createdDate);
            return `Diajukan ${new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }).format(d)}`;
        }

        return "Belum dijadwalkan";
    };

    const getStatusBadge = (item: Consultation) => {
        const now = new Date();
        const consultDate = item.consultation_date ? new Date(item.consultation_date) : null;

        if (item.status === "completed") {
            return (
                <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-2.5 py-0.5"
                >
                    Selesai
                </Badge>
            );
        }

        if (item.status === "approved" || item.status === "scheduled") {
            if (consultDate && consultDate <= now) {
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-2.5 py-0.5"
                    >
                        Belum Selesai
                    </Badge>
                );
            }
            return (
                <Badge
                    variant="outline"
                    className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 font-bold px-2.5 py-0.5"
                >
                    Dijadwalkan
                </Badge>
            );
        }

        if (item.status === "requested") {
            return (
                <Badge
                    variant="outline"
                    className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 font-bold px-2.5 py-0.5"
                >
                    Menunggu Konfirmasi
                </Badge>
            );
        }

        if (item.status === "reschedule_requested") {
            return (
                <Badge
                    variant="outline"
                    className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold px-2.5 py-0.5"
                >
                    Jadwal Ulang
                </Badge>
            );
        }

        if (item.status === "rejected") {
            return (
                <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-2.5 py-0.5"
                >
                    Ditolak
                </Badge>
            );
        }

        if (item.status === "missed") {
            return (
                <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-border font-bold px-2.5 py-0.5"
                >
                    Terlewat
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="font-bold px-2.5 py-0.5">
                {item.status}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
            <ListPageHeader
                breadcrumbs={[{ label: "Bimbingan & Konsultasi" }]}
                variant="konsultasi"
            />

            {/* Standardized List Toolbar */}
            <ListToolbar
                variant="konsultasi"
                searchQuery={searchQuery}
                onSearchChange={(q) => setSearchQuery(q)}
                searchPlaceholder="Cari judul skripsi/proposal..."
                filters={[
                    {
                        id: "status",
                        label: "Status",
                        value: statusFilter,
                        onValueChange: handleStatusChange,
                        options: [
                            { label: "Semua Status", value: "semua" },
                            { label: "Dijadwalkan", value: "dijadwalkan" },
                            { label: "Belum Selesai", value: "belum_selesai" },
                            { label: "Selesai", value: "selesai" },
                        ],
                    },
                    {
                        id: "date",
                        label: "Rentang Hari",
                        value: dateFilter,
                        onValueChange: handleDateFilterChange,
                        options: [
                            { label: "Semua Hari", value: "semua" },
                            { label: "Hari Ini", value: "hari_ini" },
                            { label: "Rentang Hari", value: "rentang" },
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
                                <GraduationCap className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                                <span>Mahasiswa: Semua</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300">
                                <Avatar className="h-5 w-5 border border-sky-500/30 shrink-0">
                                    <AvatarImage src={selectedStudent.image || "/default_user_photo.png"} />
                                    <AvatarFallback className="text-[9px] bg-sky-500/20 text-sky-600">
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
                                    onClick={() => handleSelectStudent(null)}
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
                                    onClick={() => handleSelectLecturer(null)}
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
                    onValueChange: handleSortChange,
                    options: [
                        { label: "Tanggal (Terbaru)", value: "terbaru" },
                        { label: "Tanggal (Terlama)", value: "terlama" },
                        { label: "Jadwal (Terdekat)", value: "jadwal_terdekat" },
                        { label: "Jadwal (Terjauh)", value: "jadwal_terjauh" },
                        { label: "Nama Mahasiswa (A - Z)", value: "nama_asc" },
                        { label: "Nama Mahasiswa (Z - A)", value: "nama_desc" },
                        { label: "Judul Skripsi (A - Z)", value: "judul_asc" },
                    ],
                }}
                hideCount={true}
                isLoading={isPending}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            >
                {/* Date range picker row if selected */}
                {dateFilter === "rentang" && (
                    <div className="flex flex-wrap items-center gap-2 bg-muted/80 px-2.5 py-1.5 border-t border-border/40 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-[11px] font-semibold">Dari:</span>
                            <div className="min-w-[170px] sm:min-w-[190px]">
                                <DatePicker
                                    value={startDate}
                                    onChange={(_, iso) => handleStartDateChange(iso)}
                                    placeholder="Pilih tanggal"
                                    className="h-8 px-2 text-xs bg-muted/60 border-0 border-b border-border rounded-none shadow-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-[11px] font-semibold">s/d:</span>
                            <div className="min-w-[170px] sm:min-w-[190px]">
                                <DatePicker
                                    value={endDate}
                                    onChange={(_, iso) => handleEndDateChange(iso)}
                                    placeholder="Pilih tanggal"
                                    className="h-8 px-2 text-xs bg-muted/60 border-0 border-b border-border rounded-none shadow-none focus:border-primary"
                                />
                            </div>
                        </div>
                        {(startDate || endDate) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                    updateQueryParams({ startDate: null, endDate: null, page: "1" });
                                }}
                                className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                                title="Hapus rentang tanggal"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </ListToolbar>

            {/* Standardized Content List Grid */}
            {consultations.length === 0 ? (
                <ListEmptyState
                    icon={<MessageSquare className="h-10 w-10 text-sky-500/60" />}
                    title="Tidak Ditemukan Sesi Bimbingan"
                    description={
                        hasActiveFilters
                            ? "Tidak ada sesi bimbingan yang sesuai dengan filter atau kata kunci pencarian Anda. Coba atur ulang filter."
                            : "Belum ada riwayat bimbingan atau konsultasi pada kategori ini."
                    }
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            ) : (
                <>
                    <div
                        className={cn(
                            "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200",
                            isPending && "opacity-60 pointer-events-none"
                        )}
                    >
                        {consultations.map((item) => {
                            const isStudent = currentUsername && item.student_nim === currentUsername;
                            const isLecturer = currentUsername && item.lecturer_nip === currentUsername;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/konsultasi/${item.id}`}
                                    className="group block focus:outline-none"
                                >
                                    <GradientCard
                                        variant="konsultasi"
                                        className="h-full border border-border/60 hover:border-sky-500/50 hover:shadow-md transition-all duration-200"
                                    >
                                        <GradientCardHeader variant="konsultasi" className="p-4">
                                            <div className="flex items-start justify-between gap-3 w-full">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar className="h-11 w-11 shrink-0 border-2 border-border/50 shadow-2xs">
                                                        <AvatarImage
                                                            src={item.student_image || "/default_user_photo.png"}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="bg-sky-500/10 text-sm font-bold text-sky-600">
                                                            {item.student_name?.[0] || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <h4 className="truncate text-sm font-bold text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                                            {item.student_name || "Mahasiswa"}
                                                        </h4>
                                                        <p className="text-xs font-mono text-muted-foreground">
                                                            NIM. {item.student_nim}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {getStatusBadge(item)}
                                                </div>
                                            </div>
                                        </GradientCardHeader>

                                        <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                                            {/* Judul Skripsi / Proposal */}
                                            <div className="space-y-1">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {item.is_thesis ? "Judul Skripsi" : "Judul Proposal"}
                                                </span>
                                                <h5 className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                                                    {item.thesis_title || "Judul skripsi belum ditentukan"}
                                                </h5>
                                            </div>

                                            {/* Footer Details */}
                                            <div className="pt-3 border-t border-border/40 space-y-2.5">
                                                {/* Lecturer Info */}
                                                <div className="flex items-center justify-between gap-2 text-xs">
                                                    <div className="flex items-center gap-1.5 min-w-0 text-muted-foreground">
                                                        <Avatar className="h-5 w-5 shrink-0 border border-border/40">
                                                            <AvatarImage
                                                                src={item.lecturer_image || "/default_user_photo.png"}
                                                                className="object-cover"
                                                            />
                                                            <AvatarFallback className="bg-sky-500/10 text-[9px] font-bold text-sky-600">
                                                                {item.lecturer_name?.[0] || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-foreground truncate">
                                                            {item.lecturer_name || "Dosen Pembimbing"}
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 text-[10px] font-medium px-2 py-0 border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5"
                                                    >
                                                        {item.lecturer_role === "examiner"
                                                            ? "Dosen Penguji"
                                                            : "Dosen Pembimbing"}
                                                    </Badge>
                                                </div>

                                                {/* Schedule & Venue Meta */}
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                                                        <span className="truncate">
                                                            {formatDateTime(item.consultation_date, item.created_at)}
                                                        </span>
                                                    </div>
                                                    {item.venue && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                            <span className="truncate">{item.venue}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-1 text-xs">
                                                    {isStudent || isLecturer ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                                                            <UserCheck className="h-3 w-3" />
                                                            {isStudent ? "Sesi Anda" : "Bimbingan Anda"}
                                                        </span>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <span className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform ml-auto">
                                                        Detail Sesi <ChevronRight className="h-3.5 w-3.5" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </GradientCard>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {paginationMeta.totalCount > 0 && (
                        <div className="pt-4 border-t border-border/30">
                            <Pagination
                                currentPage={paginationMeta.page}
                                totalPages={paginationMeta.totalPages}
                                totalCount={paginationMeta.totalCount}
                                pageSize={paginationMeta.limit}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                itemName="sesi bimbingan"
                            />
                        </div>
                    )}
                </>
            )}

            {/* Student Picker Modal */}
            <EntityPickerModal
                open={isStudentModalOpen}
                onOpenChange={setIsStudentModalOpen}
                title="Pilih Mahasiswa"
                description="Cari berdasarkan nama mahasiswa atau NIM untuk memfilter sesi bimbingan."
                searchPlaceholder="Cari nama atau NIM mahasiswa..."
                entityTypeLabel="Mahasiswa"
                selectedId={selectedStudent?.id}
                onSelect={handleSelectStudent}
                fetcher={searchStudentsAction}
            />

            {/* Lecturer Picker Modal */}
            <EntityPickerModal
                open={isLecturerModalOpen}
                onOpenChange={setIsLecturerModalOpen}
                title="Pilih Dosen"
                description="Cari berdasarkan nama dosen atau NIP untuk memfilter sesi bimbingan."
                searchPlaceholder="Cari nama atau NIP dosen..."
                entityTypeLabel="Dosen"
                selectedId={selectedLecturer?.id}
                onSelect={handleSelectLecturer}
                fetcher={searchLecturersAction}
            />
        </div>
    );
}
