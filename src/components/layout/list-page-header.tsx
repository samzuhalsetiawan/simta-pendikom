import * as React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { GradientCardVariant } from "@/components/shared/gradient-card";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface ListPageHeaderProps {
    breadcrumbs: BreadcrumbItem[];
    badgeIcon?: React.ReactNode;
    badgeLabel?: string;
    title?: string;
    description?: string;
    variant?: GradientCardVariant;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

const variantBadgeStyles: Record<GradientCardVariant, string> = {
    lulus: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "pengajuan-proposal": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    "seminar-proposal": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    konsultasi: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    penelitian: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "seminar-hasil": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    "sidang-skripsi": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
};

export function ListPageHeader({
    breadcrumbs,
    badgeIcon,
    badgeLabel,
    title,
    description,
    variant = "primary",
    action,
    children,
    className,
}: ListPageHeaderProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground flex-wrap">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
                    <Home className="h-3.5 w-3.5" />
                    <span>Home</span>
                </Link>
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <React.Fragment key={index}>
                            <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
                            {crumb.href && !isLast ? (
                                <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[180px]">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className={cn("truncate max-w-[240px]", isLast ? "text-foreground font-bold" : "")} title={crumb.label}>
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>

            {/* Header Content */}
            {(title || description || action) && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
                    <div className="space-y-2 max-w-3xl">
                        {title && (
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight text-foreground">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {action && (
                        <div className="shrink-0 flex items-center gap-2">
                            {action}
                        </div>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}
