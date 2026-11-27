"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LecturerListItem } from "@/lib/dal/lecturer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Badge } from "@/components/base/badge";
import { ListPageHeader } from "@/components/layout/list-page-header";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ListEmptyState } from "@/components/shared/list-empty-state";
import {
    GradientCard,
    GradientCardHeader,
} from "@/components/shared/gradient-card";
import {
    Users,
    ChevronRight,
    GraduationCap,
    Award,
    Mail,
} from "lucide-react";

interface DosenListViewProps {
    lecturers: LecturerListItem[];
    currentUsername?: string;
}

export default function DosenListView({
    lecturers,
    currentUsername,
}: DosenListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("semua");
    const [sortBy, setSortBy] = useState<string>("nama_asc");

    const filteredAndSortedLecturers = useMemo(() => {
        const filtered = lecturers.filter((l) => {
            // Role filter
            if (roleFilter !== "semua") {
                if (roleFilter === "pejabat") {
                    if (!l.staff_role || l.staff_role === "") return false;
                } else if (roleFilter === "pembimbing_aktif") {
                    if (l.total_supervised <= 0) return false;
                } else if (roleFilter === "penguji_aktif") {
                    if (l.total_examined <= 0) return false;
                }
            }

            // Search filter
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const nameMatch = l.name.toLowerCase().includes(q);
                const nipMatch = l.nip.toLowerCase().includes(q);
                const roleMatch = l.staff_role?.toLowerCase().includes(q) || false;
                if (!nameMatch && !nipMatch && !roleMatch) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "nama_desc":
                    return b.name.localeCompare(a.name);
                case "nip_asc":
                    return a.nip.localeCompare(b.nip);
                case "bimbingan_terbanyak":
                    return b.total_supervised - a.total_supervised;
                case "pengujian_terbanyak":
                    return b.total_examined - a.total_examined;
                case "nama_asc":
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [lecturers, roleFilter, searchQuery, sortBy]);

    const getRoleBadge = (role: string | null) => {
        if (!role) {
            return <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border font-medium px-2 py-0.5 text-[10px]">Dosen Pengajar</Badge>;
        }
        switch (role) {
            case "ketua_jurusan":
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold px-2.5 py-0.5 text-[10px]">Ketua Jurusan</Badge>;
            case "koordinator_program_studi":
                return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-bold px-2.5 py-0.5 text-[10px]">Koordinator Prodi</Badge>;
            default:
                return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold px-2 py-0.5 uppercase text-[10px]">{role.replace(/_/g, " ")}</Badge>;
        }
    };

    const hasActiveFilters = roleFilter !== "semua" || searchQuery.trim() !== "" || sortBy !== "nama_asc";

    const resetFilters = () => {
        setRoleFilter("semua");
        setSearchQuery("");
        setSortBy("nama_asc");
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
            <ListPageHeader
                breadcrumbs={[{ label: "Dosen" }]}
                variant="primary"
            />

            <ListToolbar
                variant="primary"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Cari nama atau NIP dosen..."
                filters={[
                    {
                        id: "role",
                        label: "Kategori Peran",
                        value: roleFilter,
                        onValueChange: setRoleFilter,
                        options: [
                            { label: "Semua Peran", value: "semua" },
                            { label: "Pejabat Prodi / Jurusan", value: "pejabat" },
                            { label: "Pembimbing Aktif", value: "pembimbing_aktif" },
                            { label: "Penguji Aktif", value: "penguji_aktif" },
                        ],
                    },
                ]}
                sortConfig={{
                    value: sortBy,
                    onValueChange: setSortBy,
                    options: [
                        { label: "Nama Dosen (A - Z)", value: "nama_asc" },
                        { label: "Nama Dosen (Z - A)", value: "nama_desc" },
                        { label: "NIP (Terkecil)", value: "nip_asc" },
                        { label: "Bimbingan Terbanyak", value: "bimbingan_terbanyak" },
                        { label: "Pengujian Terbanyak", value: "pengujian_terbanyak" },
                    ],
                }}
                hideCount={true}
                itemName="dosen"
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {filteredAndSortedLecturers.length === 0 ? (
                <ListEmptyState
                    icon={<Users className="h-10 w-10 text-primary/60" />}
                    title="Tidak Ditemukan Dosen"
                    description={
                        hasActiveFilters
                            ? "Tidak ada dosen yang sesuai dengan kriteria filter atau kata kunci pencarian Anda. Coba atur ulang filter."
                            : "Belum ada data dosen yang terdaftar di sistem."
                    }
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedLecturers.map((lecturer) => {
                        const isMe = currentUsername === lecturer.nip;

                        return (
                            <Link
                                key={lecturer.nip}
                                href={`/dosen/${lecturer.nip}`}
                                className="group block focus:outline-none"
                            >
                                <GradientCard
                                    variant="primary"
                                    className={`h-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                        isMe ? "border-primary ring-1 ring-primary/30" : "border-border/60 hover:border-primary/50"
                                    }`}
                                >
                                    <GradientCardHeader variant="primary" className="p-4">
                                        <div className="flex items-start justify-between gap-3 w-full">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-11 w-11 shrink-0 border-2 border-border/50 shadow-2xs">
                                                    <AvatarImage
                                                        src={lecturer.image || "/default_user_photo.png"}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                                                        {lecturer.name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {lecturer.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        NIP. {lecturer.nip}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getRoleBadge(lecturer.staff_role)}
                                            </div>
                                        </div>
                                    </GradientCardHeader>

                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        {/* Workload Stats */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="rounded-xl bg-muted/30 p-2.5 border border-border/40 text-center">
                                                <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                                                    <span>Bimbingan</span>
                                                </div>
                                                <p className="text-base font-extrabold text-foreground font-heading">
                                                    {lecturer.total_supervised}
                                                    <span className="text-[10px] font-normal text-muted-foreground ml-1">mhs</span>
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-muted/30 p-2.5 border border-border/40 text-center">
                                                <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                                    <Award className="h-3.5 w-3.5 text-indigo-500" />
                                                    <span>Pengujian</span>
                                                </div>
                                                <p className="text-base font-extrabold text-foreground font-heading">
                                                    {lecturer.total_examined}
                                                    <span className="text-[10px] font-normal text-muted-foreground ml-1">mhs</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        {lecturer.email && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                                <span className="truncate">{lecturer.email}</span>
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
