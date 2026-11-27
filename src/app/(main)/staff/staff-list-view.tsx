"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StaffListItem } from "@/lib/dal/staff";
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
    ShieldCheck,
    ChevronRight,
    Mail,
    Phone,
    UserCheck,
} from "lucide-react";

interface StaffListViewProps {
    staffMembers: StaffListItem[];
    currentUsername?: string;
}

export default function StaffListView({
    staffMembers,
    currentUsername,
}: StaffListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("semua");
    const [sortBy, setSortBy] = useState<string>("nama_asc");

    const filteredAndSortedStaff = useMemo(() => {
        const filtered = staffMembers.filter((s) => {
            // Role filter
            if (roleFilter !== "semua") {
                if (s.role !== roleFilter) return false;
            }

            // Search filter
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const nameMatch = s.name.toLowerCase().includes(q);
                const nipMatch = s.nip.toLowerCase().includes(q);
                const roleMatch = s.role.toLowerCase().includes(q);
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
                case "nama_asc":
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [staffMembers, roleFilter, searchQuery, sortBy]);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ketua_jurusan":
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold px-2.5 py-0.5 text-[10px]">Ketua Jurusan</Badge>;
            case "koordinator_program_studi":
                return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-bold px-2.5 py-0.5 text-[10px]">Koordinator Prodi</Badge>;
            case "admin":
                return <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 font-bold px-2.5 py-0.5 text-[10px]">Administrator</Badge>;
            default:
                return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold px-2 py-0.5 uppercase text-[10px]">{role.replace(/_/g, " ")}</Badge>;
        }
    };

    const formatRoleTitle = (role: string) => {
        switch (role) {
            case "ketua_jurusan": return "Ketua Jurusan Pendidikan MIPA / Komputer";
            case "koordinator_program_studi": return "Koordinator Program Studi Pendidikan Komputer";
            case "admin": return "Staf Administrasi & Akademik";
            default: return role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
                breadcrumbs={[{ label: "Staf" }]}
                variant="primary"
            />

            <ListToolbar
                variant="primary"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Cari nama atau NIP staf..."
                filters={[
                    {
                        id: "role",
                        label: "Jabatan / Peran",
                        value: roleFilter,
                        onValueChange: setRoleFilter,
                        options: [
                            { label: "Semua Jabatan", value: "semua" },
                            { label: "Koordinator Program Studi", value: "koordinator_program_studi" },
                            { label: "Ketua Jurusan", value: "ketua_jurusan" },
                            { label: "Staf Administrasi (Admin)", value: "admin" },
                        ],
                    },
                ]}
                sortConfig={{
                    value: sortBy,
                    onValueChange: setSortBy,
                    options: [
                        { label: "Nama Staf (A - Z)", value: "nama_asc" },
                        { label: "Nama Staf (Z - A)", value: "nama_desc" },
                        { label: "NIP (Terkecil)", value: "nip_asc" },
                    ],
                }}
                hideCount={true}
                itemName="staf"
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {filteredAndSortedStaff.length === 0 ? (
                <ListEmptyState
                    icon={<ShieldCheck className="h-10 w-10 text-primary/60" />}
                    title="Tidak Ditemukan Staf"
                    description={
                        hasActiveFilters
                            ? "Tidak ada staf yang sesuai dengan kriteria filter atau kata kunci pencarian Anda. Coba atur ulang filter."
                            : "Belum ada data staf yang terdaftar di sistem."
                    }
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedStaff.map((staff) => {
                        const isMe = currentUsername === staff.nip;

                        return (
                            <Link
                                key={staff.nip}
                                href={`/staff/${staff.nip}`}
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
                                                        src={staff.image || "/default_user_photo.png"}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                                                        {staff.name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {staff.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        NIP. {staff.nip}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getRoleBadge(staff.role)}
                                            </div>
                                        </div>
                                    </GradientCardHeader>

                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        {/* Position Title */}
                                        <div className="rounded-xl bg-muted/30 p-3 border border-border/40">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                                Penugasan
                                            </span>
                                            <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                                                {formatRoleTitle(staff.role)}
                                            </p>
                                        </div>

                                        {/* Contact Details */}
                                        <div className="space-y-1.5 text-xs text-muted-foreground">
                                            {staff.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                                    <span className="truncate">{staff.email}</span>
                                                </div>
                                            )}
                                            {staff.phone_number && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                                    <span>{staff.phone_number}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action */}
                                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                                            {isMe ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                                    <UserCheck className="h-3 w-3" /> Akun Anda
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
