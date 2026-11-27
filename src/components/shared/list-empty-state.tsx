import * as React from "react";
import { FolderSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils/utils";

export interface ListEmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    hasActiveFilters?: boolean;
    onResetFilters?: () => void;
    resetButtonLabel?: string;
    className?: string;
    action?: React.ReactNode;
}

export function ListEmptyState({
    icon,
    title,
    description,
    hasActiveFilters,
    onResetFilters,
    resetButtonLabel = "Reset Filter & Pencarian",
    className,
    action,
}: ListEmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 p-8 sm:p-14 text-center backdrop-blur-xs",
            className
        )}>
            <div className="mb-4 rounded-2xl bg-muted/60 p-4 text-muted-foreground/60 shadow-2xs border border-border/40">
                {icon || <FolderSearch className="h-8 w-8 sm:h-10 sm:w-10" />}
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-foreground tracking-tight">
                {title}
            </h3>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
            {hasActiveFilters && onResetFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetFilters}
                    className="mt-5 rounded-xl text-xs font-bold gap-1.5 shadow-2xs"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{resetButtonLabel}</span>
                </Button>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
