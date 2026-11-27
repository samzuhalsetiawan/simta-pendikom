"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/base/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/base/select";
import { cn } from "@/lib/utils/utils";

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
    itemName?: string;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [12, 24, 48],
    itemName = "data",
    className,
}: PaginationProps) {
    // If there is no data, don't show pagination
    if (totalCount === 0) return null;

    const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
    const endItem = Math.min(currentPage * pageSize, totalCount);

    // Generate page numbers with smart ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show page 1
            pages.push(1);

            if (currentPage <= 4) {
                // Near start: 1, 2, 3, 4, 5, ..., totalPages
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push("ellipsis-end");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Near end: 1, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages
                pages.push("ellipsis-start");
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Middle: 1, ..., current-1, current, current+1, ..., totalPages
                pages.push("ellipsis-start");
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push("ellipsis-end");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav
            role="navigation"
            aria-label="Navigasi Halaman"
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-muted-foreground",
                className
            )}
        >
            {/* Left: Summary text */}
            <div className="flex items-center gap-2 text-xs font-medium">
                <span>
                    Menampilkan <strong className="text-foreground font-bold">{startItem}–{endItem}</strong> dari{" "}
                    <strong className="text-foreground font-bold">{totalCount}</strong> {itemName}
                </span>
            </div>

            {/* Right: Controls (Page size selector & Navigation buttons) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                {/* Page Size Selector Dropdown */}
                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 mr-1">
                        <span className="text-[11px] text-muted-foreground font-medium hidden xs:inline">
                            Per hal:
                        </span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(val) => onPageSizeChange(Number(val))}
                        >
                            <SelectTrigger className="h-8 w-[72px] px-2 text-xs font-medium bg-muted/80 hover:bg-muted border-border/70 rounded-lg cursor-pointer">
                                <SelectValue placeholder={String(pageSize)} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-border/70 bg-popover shadow-lg">
                                {pageSizeOptions.map((opt) => (
                                    <SelectItem
                                        key={opt}
                                        value={String(opt)}
                                        className="text-xs rounded-lg cursor-pointer"
                                    >
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Mobile view of pagination: "Halaman X dari Y" with Prev/Next */}
                <div className="flex items-center gap-1 sm:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="h-8 px-2 rounded-lg cursor-pointer"
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-xs font-semibold text-foreground">
                        {currentPage} / {totalPages || 1}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="h-8 px-2 rounded-lg cursor-pointer"
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Desktop view of pagination buttons */}
                <div className="hidden sm:flex items-center gap-1">
                    {/* Previous Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="h-8 px-2.5 gap-1 rounded-lg border-border/70 bg-background hover:bg-muted font-medium cursor-pointer"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Sebelumnya</span>
                    </Button>

                    {/* Page Numbers */}
                    {pageNumbers.map((p, idx) => {
                        if (typeof p === "string") {
                            return (
                                <div
                                    key={`ellipsis-${idx}`}
                                    className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </div>
                            );
                        }

                        const isActive = p === currentPage;
                        return (
                            <Button
                                key={p}
                                type="button"
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(p)}
                                className={cn(
                                    "h-8 min-w-8 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                                        : "border-border/70 bg-background hover:bg-muted text-foreground"
                                )}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {p}
                            </Button>
                        );
                    })}

                    {/* Next Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="h-8 px-2.5 gap-1 rounded-lg border-border/70 bg-background hover:bg-muted font-medium cursor-pointer"
                    >
                        <span>Berikutnya</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
