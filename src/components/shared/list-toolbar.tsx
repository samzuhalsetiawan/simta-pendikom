"use client";

import * as React from "react";
import { Search, X, ArrowUpDown, Filter, RotateCcw, Loader2 } from "lucide-react";
import { Input } from "@/components/base/input";
import { Button } from "@/components/base/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/base/select";
import { GradientCardHeader, type GradientCardVariant } from "@/components/shared/gradient-card";
import { cn } from "@/lib/utils/utils";

export interface FilterSelectConfig {
    id: string;
    label: string;
    value: string;
    onValueChange: (val: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    icon?: React.ReactNode;
}

export interface SortSelectConfig {
    value: string;
    onValueChange: (val: string) => void;
    options: { label: string; value: string }[];
}

export interface TabConfig {
    id: string;
    label: string;
    count?: number;
}

export interface ListToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    searchPlaceholder?: string;
    tabs?: TabConfig[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    filters?: FilterSelectConfig[];
    sortConfig?: SortSelectConfig;
    filteredCount?: number;
    totalCount?: number;
    itemName?: string;
    hasActiveFilters?: boolean;
    onResetFilters?: () => void;
    variant?: GradientCardVariant;
    className?: string;
    customFilters?: React.ReactNode;
    children?: React.ReactNode;
    customCountText?: React.ReactNode;
    isLoading?: boolean;
    hideCount?: boolean;
}

export function ListToolbar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Cari data...",
    tabs,
    activeTab,
    onTabChange,
    filters = [],
    customFilters,
    sortConfig,
    filteredCount,
    totalCount,
    itemName = "data",
    hasActiveFilters,
    onResetFilters,
    variant = "primary",
    className,
    children,
    customCountText,
    isLoading,
    hideCount,
}: ListToolbarProps) {
    return (
        <GradientCardHeader
            variant={variant}
            rounded="none"
            className={cn("border-y p-4 sm:p-5 flex flex-col items-stretch gap-4 justify-start", className)}
        >
            {/* Top Row: Search & Tabs (if any) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Box - Modal Style */}
                <div className="relative flex-1 max-w-lg">
                    {isLoading ? (
                        <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-spin" />
                    ) : (
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    )}
                    <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-9 h-10 w-full rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs sm:text-sm placeholder:text-muted-foreground/60"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                            aria-label="Hapus pencarian"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Tabs / Segmented Control */}
                {tabs && tabs.length > 0 && onTabChange && (
                    <div className="flex flex-wrap items-center rounded-xl bg-muted/80 p-1 gap-1 self-start md:self-auto border border-border/40">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onTabChange(tab.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-xs font-bold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={cn(
                                            "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                                            isActive
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-muted-foreground/20 text-muted-foreground"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Middle Row: Filters & Sort Controls */}
            {(filters.length > 0 || sortConfig || hasActiveFilters) && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
                    {/* Left: Filter dropdowns - Modal Style */}
                    <div className="flex flex-wrap items-center gap-3">
                        {filters.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider pr-1">
                                <Filter className="h-3.5 w-3.5 text-primary" />
                                <span>Filter:</span>
                            </div>
                        )}
                        {filters.map((filter) => (
                            <div key={filter.id} className="min-w-[140px] sm:min-w-[170px]">
                                <Select value={filter.value} onValueChange={filter.onValueChange}>
                                    <SelectTrigger className="h-9 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 text-xs font-medium shadow-none focus:ring-0 focus-visible:ring-0 focus:border-primary transition-colors cursor-pointer">
                                        <SelectValue placeholder={filter.placeholder || filter.label} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-border/70 bg-popover shadow-xl backdrop-blur-md">
                                        {filter.options.map((opt) => (
                                             <SelectItem key={opt.value} value={opt.value} className="text-xs rounded-lg cursor-pointer">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        {customFilters}
                    </div>

                    {/* Right: Sort & Reset - Modal Style */}
                    <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                        {sortConfig && (
                            <div className="flex items-center gap-1.5">
                                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="min-w-[140px] sm:min-w-[170px]">
                                    <Select value={sortConfig.value} onValueChange={sortConfig.onValueChange}>
                                        <SelectTrigger className="h-9 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted px-3 text-xs font-medium shadow-none focus:ring-0 focus-visible:ring-0 focus:border-primary transition-colors cursor-pointer">
                                            <SelectValue placeholder="Urutkan..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border border-border/70 bg-popover shadow-xl backdrop-blur-md">
                                            {sortConfig.options.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="text-xs rounded-lg cursor-pointer">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {hasActiveFilters && onResetFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onResetFilters}
                                className="h-9 px-2.5 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none border-b border-transparent hover:border-destructive flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {children}

            {/* Bottom Row: Status / Results Count */}
            {!hideCount && (
                <div className="flex items-center justify-between border-t border-border/30 pt-2.5 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {customCountText ? (
                            customCountText
                        ) : (
                            <span>
                                Menampilkan <strong className="text-foreground font-bold">{filteredCount ?? 0}</strong> dari <strong className="text-foreground">{totalCount ?? 0}</strong> {itemName}
                            </span>
                        )}
                    </div>
                    {isLoading && (
                        <div className="inline-flex items-center gap-1.5 text-primary text-[11px] font-semibold animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                            <span>Memuat...</span>
                        </div>
                    )}
                </div>
            )}
        </GradientCardHeader>
    );
}
