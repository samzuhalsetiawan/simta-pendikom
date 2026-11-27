"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Button } from "@/components/base/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import {
    GradientCard,
    GradientCardHeader,
    GradientCardTitle,
    variantIconBadgeStyles,
} from "@/components/shared/gradient-card";
import { useDebounce } from "@/lib/utils/use-debounce";
import { UserPickerItem, UserPickerResponse } from "@/lib/actions/user-picker";
import { Search, X, Check, Loader2, GraduationCap, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface EntityPickerModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description?: string;
    searchPlaceholder?: string;
    entityTypeLabel: "Mahasiswa" | "Dosen" | string;
    selectedId?: string | null;
    onSelect: (item: UserPickerItem | null) => void;
    fetcher: (params: { query: string; page: number; limit: number }) => Promise<UserPickerResponse>;
}

export function EntityPickerModal({
    open = false,
    onOpenChange = () => {},
    title,
    description,
    searchPlaceholder = "Cari nama atau nomor induk...",
    entityTypeLabel,
    selectedId,
    onSelect,
    fetcher,
}: EntityPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [items, setItems] = useState<UserPickerItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initial load and on search change
    useEffect(() => {
        if (!open) return;

        let isCancelled = false;
        setIsLoading(true);
        setPage(1);

        fetcher({ query: debouncedSearch, page: 1, limit: 15 })
            .then((res) => {
                if (!isCancelled) {
                    setItems(res.items);
                    setHasMore(res.hasMore);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [open, debouncedSearch, fetcher]);

    // Load next page
    const loadMore = useCallback(() => {
        if (isLoading || isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        fetcher({ query: debouncedSearch, page: nextPage, limit: 15 })
            .then((res) => {
                setItems((prev) => [...prev, ...res.items]);
                setPage(nextPage);
                setHasMore(res.hasMore);
                setIsLoadingMore(false);
            })
            .catch(() => {
                setIsLoadingMore(false);
            });
    }, [page, hasMore, isLoading, isLoadingMore, debouncedSearch, fetcher]);

    // Scroll listener for lazy loading
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom =
            target.scrollHeight - target.scrollTop <= target.clientHeight + 60;

        if (reachedBottom && hasMore && !isLoading && !isLoadingMore) {
            loadMore();
        }
    };

    const handleClose = () => {
        setSearchQuery("");
        onOpenChange(false);
    };

    const HeaderIcon = entityTypeLabel.toLowerCase().includes("dosen")
        ? UserCheck
        : GraduationCap;

    const modalInner = (
        <GradientCard
            variant="konsultasi"
            rounded="bottom"
            className="w-full max-w-lg shadow-2xl border border-border/80 text-left overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]"
        >
            {/* Modal Header without subtitle */}
            <GradientCardHeader variant="konsultasi" rounded="none" className="p-4 sm:p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <HeaderIcon
                        className={cn(
                            "w-6 h-6 shrink-0",
                            variantIconBadgeStyles["konsultasi"]
                        )}
                    />
                    <GradientCardTitle className="text-base font-bold text-foreground">
                        {title}
                    </GradientCardTitle>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    aria-label="Tutup"
                >
                    <X className="w-4 h-4" />
                </button>
            </GradientCardHeader>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-hidden flex flex-col">
                {/* Search Bar */}
                <div className="relative shrink-0">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="pl-9 pr-9 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                        autoFocus
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                            aria-label="Hapus pencarian"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Status Bar / Clear selection option (no counter) */}
                {(isLoading || selectedId) && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5 shrink-0 min-h-[22px]">
                        <div>
                            {isLoading && (
                                <span className="flex items-center gap-1.5 text-primary text-xs font-medium">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Mencari data...</span>
                                </span>
                            )}
                        </div>
                        {selectedId && (
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(null);
                                    handleClose();
                                }}
                                className="text-destructive hover:underline text-xs font-semibold cursor-pointer flex items-center gap-1 ml-auto"
                            >
                                <UserX className="w-3 h-3" />
                                <span>Hapus Filter</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Results List - Seamless, unboxed, not rounded */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="divide-y divide-border/40 overflow-y-auto -mx-2 px-2 flex-1 max-h-[380px]"
                >
                    {/* Loading initial skeleton */}
                    {isLoading && (
                        <div className="space-y-2 py-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-2 rounded-xl animate-pulse bg-muted/30"
                                >
                                    <div className="h-9 w-9 rounded-full bg-muted" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-3.5 w-32 rounded-md bg-muted" />
                                        <div className="h-2.5 w-20 rounded-md bg-muted/70" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && items.length === 0 && (
                        <div className="text-center py-12 space-y-1.5 text-muted-foreground">
                            <p className="text-xs font-semibold text-foreground">
                                Tidak ditemukan {entityTypeLabel.toLowerCase()}
                            </p>
                            <p className="text-[11px]">
                                {searchQuery
                                    ? `Tidak ada hasil yang cocok dengan "${searchQuery}".`
                                    : `Belum ada data ${entityTypeLabel.toLowerCase()} yang terdaftar.`}
                            </p>
                        </div>
                    )}

                    {/* Items List */}
                    {!isLoading &&
                        items.map((item) => {
                            const isSelected = selectedId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item);
                                        handleClose();
                                    }}
                                    className={cn(
                                        "p-2.5 transition-colors flex items-center justify-between gap-3 cursor-pointer group rounded-lg",
                                        isSelected
                                            ? "bg-primary/10 hover:bg-primary/15"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-9 w-9 shrink-0 border border-border/50 shadow-2xs">
                                            <AvatarImage
                                                src={item.image || "/default_user_photo.png"}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-sky-500/10 text-xs font-bold text-sky-600">
                                                {item.name?.[0] || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <h4
                                                className={cn(
                                                    "text-xs font-bold transition-colors truncate",
                                                    isSelected
                                                        ? "text-primary"
                                                        : "text-foreground group-hover:text-primary"
                                                )}
                                            >
                                                {item.name}
                                            </h4>
                                            <p className="text-[11px] font-mono text-muted-foreground">
                                                {item.identifier}
                                            </p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    {/* Loading more indicator */}
                    {isLoadingMore && (
                        <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            <span>Memuat data berikutnya...</span>
                        </div>
                    )}

                    {/* Manual load more fallback */}
                    {!isLoading && hasMore && !isLoadingMore && (
                        <div className="pt-2 pb-2 text-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={loadMore}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                Muat lebih banyak...
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </GradientCard>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                hideCloseButton
                className="p-0 border-0 bg-transparent shadow-none w-[calc(100%-2.5rem)] max-w-lg focus:outline-none"
            >
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">{description || title}</DialogDescription>
                {modalInner}
            </DialogContent>
        </Dialog>
    );
}
