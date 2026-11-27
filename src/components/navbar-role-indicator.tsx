"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { 
    GraduationCap, 
    BookOpen, 
    ShieldCheck, 
    ChevronDown, 
    Check, 
    Loader2 
} from "lucide-react";
import { setActiveRoleCookie } from "@/lib/actions/cookies";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

interface Props {
    roleString?: string | null;
    activeRoleProp?: string | null;
    staffTitle?: string | null;
}

export function NavbarRoleIndicator({ roleString, activeRoleProp, staffTitle }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    let roles: string[] = [];
    try {
        roles = JSON.parse(roleString || "[]");
    } catch {
        roles = [];
    }

    if (roles.length === 0) return null;

    // Fallback to single role if activeRoleProp not set
    let currentActiveRole = activeRoleProp;
    if (!currentActiveRole) {
        if (roles.length === 1) currentActiveRole = roles[0];
        else if (roles.includes("lecturer")) currentActiveRole = "lecturer";
        else currentActiveRole = roles[0];
    }

    const getRoleMeta = (role: string) => {
        if (role === "student") {
            return {
                label: "Mahasiswa",
                shortLabel: "Mahasiswa",
                icon: GraduationCap,
                pillClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                dotClass: "bg-blue-500",
            };
        }
        if (role === "lecturer") {
            return {
                label: "Dosen Pembimbing/Penguji",
                shortLabel: "Dosen",
                icon: BookOpen,
                pillClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                dotClass: "bg-emerald-500",
            };
        }
        if (role === "staff") {
            const formatted = staffTitle 
                ? staffTitle.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                : "Staff Prodi";
            return {
                label: formatted,
                shortLabel: formatted,
                icon: ShieldCheck,
                pillClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
                dotClass: "bg-indigo-500",
            };
        }
        return {
            label: role,
            shortLabel: role,
            icon: ShieldCheck,
            pillClass: "bg-muted text-muted-foreground border-border",
            dotClass: "bg-muted-foreground",
        };
    };

    const activeMeta = getRoleMeta(currentActiveRole || roles[0]);
    const ActiveIcon = activeMeta.icon;

    // If user has only 1 role: display static pill badge
    if (roles.length <= 1) {
        return (
            <div 
                className={cn(
                    "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors select-none",
                    activeMeta.pillClass
                )}
                title={`Peran akun: ${activeMeta.label}`}
            >
                <ActiveIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{activeMeta.shortLabel}</span>
            </div>
        );
    }

    // Multi-role: display interactive DropdownMenu switcher
    const handleSwitchRole = (roleId: string, roleLabel: string) => {
        if (roleId === currentActiveRole) return;
        startTransition(async () => {
            await setActiveRoleCookie(roleId);
            toast.success(`Beralih ke peran ${roleLabel}`);
            router.refresh();
        });
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    disabled={isPending}
                    className={cn(
                        "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        activeMeta.pillClass,
                        isPending && "opacity-75 cursor-wait"
                    )}
                    title="Klik untuk beralih peran akun"
                >
                    {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    ) : (
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", activeMeta.dotClass)} />
                    )}
                    <ActiveIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[130px] font-bold">
                        {isPending ? "Mengganti..." : activeMeta.shortLabel}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-[14rem] overflow-hidden rounded-2xl border bg-popover p-2 text-popover-foreground shadow-lg animate-in fade-in zoom-in-95"
                >
                    <div className="px-3 py-2 border-b border-border/40">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                            Beralih Peran Akun
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pilih konteks peran yang ingin digunakan:
                        </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                        {roles.map((role) => {
                            const meta = getRoleMeta(role);
                            const Icon = meta.icon;
                            const isSelected = role === currentActiveRole;

                            return (
                                <DropdownMenu.Item
                                    key={role}
                                    onSelect={() => handleSwitchRole(role, meta.shortLabel)}
                                    className={cn(
                                        "relative flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors cursor-pointer select-none",
                                        isSelected 
                                            ? "bg-primary/10 text-primary font-bold" 
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={cn("p-1 rounded-lg shrink-0", meta.pillClass)}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="truncate">{meta.label}</span>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                    )}
                                </DropdownMenu.Item>
                            );
                        })}
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
