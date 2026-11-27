import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

export interface DocumentDetailLayoutProps {
    breadcrumbs: {
        label: string;
        href?: string;
    }[];
    title: string;
    subtitle?: string;
    leftNode: React.ReactNode;
    rightNode: React.ReactNode;
}

export function DocumentDetailLayout({
    breadcrumbs,
    title,
    subtitle,
    leftNode,
    rightNode,
}: DocumentDetailLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <main className="container mx-auto max-w-5xl px-4 py-6 sm:px-8 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 flex-wrap">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                    </Link>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
                            {crumb.href ? (
                                <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className={`truncate ${index === breadcrumbs.length - 1 ? "text-foreground font-medium max-w-xs" : "max-w-[150px]"}`} title={crumb.label}>
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                        {subtitle && <p className="text-xs sm:text-sm font-semibold text-primary mb-1 uppercase tracking-wider">{subtitle}</p>}
                        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight break-words">{title}</h1>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info Cards & Actions */}
                    <div className="space-y-6">
                        {leftNode}
                    </div>

                    {/* Right Column: Main Content (PDF Preview) */}
                    <div className="lg:col-span-2 space-y-6">
                        {rightNode}
                    </div>
                </div>
            </main>
        </div>
    );
}
