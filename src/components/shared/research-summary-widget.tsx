"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { BookOpen, Pencil, FileText, BrainCircuit, FileSearch, Clock, Link as LinkIcon, Download } from "lucide-react"
import { Button } from "@/components/base/button"
import { 
    GradientCard, 
    GradientCardHeader, 
    GradientCardTitle, 
    GradientCardDescription,
    type GradientCardVariant 
} from "@/components/shared/gradient-card"
import { Badge } from "@/components/base/badge"

export interface ResearchSummaryWidgetProps {
    title: string;
    description: string;
    data: {
        id?: string
        title: string | null
        research_type: string | null
        research_method: string | null
        approval_status?: string | null
        progress?: string | null
        proposal_url?: string | null
        thesis_url?: string | null
        updated_at?: string | Date | null
        created_at?: string | Date | null
    } | null;
    actionLink: string;
    actionLabel?: string;
    actionDisabled?: boolean;
    actionDisabledMessage?: string;
    icon?: React.ReactNode;
    variant?: GradientCardVariant;
    className?: string;
    children?: React.ReactNode;
}

export function ResearchSummaryWidget({ 
    title, 
    description, 
    data, 
    actionLink, 
    actionLabel,
    actionDisabled = false,
    actionDisabledMessage,
    icon = <BookOpen className="h-4 w-4 text-primary" />,
    variant,
    className,
    children
}: ResearchSummaryWidgetProps) {
    const renderStatus = () => {
        if (!data) return <span className="text-muted-foreground italic text-xs">Belum ada</span>;
        
        if (data.approval_status) {
            switch(data.approval_status) {
                case 'pending': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30">Menunggu Persetujuan</Badge>;
                case 'approved': return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">Disetujui</Badge>;
                case 'rejected': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/30">Ditolak</Badge>;
                default: return <Badge variant="outline" className="capitalize">{data.approval_status.replace(/_/g, ' ')}</Badge>;
            }
        }
        
        if (data.progress) {
            return <Badge variant="outline" className="capitalize text-primary border-primary/30 bg-primary/5">{data.progress.replace(/_/g, ' ')}</Badge>;
        }
        
        return <span className="text-muted-foreground italic text-xs">Belum ada</span>;
    };

    const getFileUrl = () => {
        if (!data) return null;
        return data.proposal_url || data.thesis_url || null;
    };

    const fileUrl = getFileUrl();

    const formatDate = (dateString?: string | Date | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const isActionDisabled = actionDisabled || !data || actionLink === "#";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={className}
        >
            <GradientCard className="flex flex-col shadow-sm" variant={variant}>
                <GradientCardHeader variant={variant}>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            {icon}
                        </div>
                        <div>
                            <GradientCardTitle>{title}</GradientCardTitle>
                            <GradientCardDescription>{description}</GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
            
                <div className="p-6">
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5 border-b border-border/40 pb-4">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary/70" />
                                Judul
                            </h4>
                            <p className="text-sm font-semibold leading-relaxed">
                                {data?.title || <span className="text-muted-foreground italic font-normal">Belum ada judul yang ditentukan</span>}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
                            <div className="space-y-1.5">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <BrainCircuit className="h-3.5 w-3.5 text-primary/70" />
                                    Jenis Penelitian
                                </h4>
                                <p className="text-xs font-medium text-foreground/90">
                                    {data?.research_type ? <span className="capitalize">{data.research_type}</span> : <span className="text-muted-foreground italic font-normal">Belum ada</span>}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <FileSearch className="h-3.5 w-3.5 text-primary/70" />
                                    Metode Penelitian
                                </h4>
                                <p className="text-xs font-medium text-foreground/90">
                                    {data?.research_method ? <span className="capitalize">{data.research_method}</span> : <span className="text-muted-foreground italic font-normal">Belum ada</span>}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                                    Status
                                </h4>
                                <div className="flex items-center">
                                    {renderStatus()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Download className="h-3.5 w-3.5 text-primary/70" />
                                    File Terakhir Diupload
                                </h4>
                                <div className="flex items-center text-xs h-[22px]">
                                    {fileUrl ? (
                                        <Link href={fileUrl} target="_blank" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                                            <LinkIcon className="h-3 w-3" />
                                            {formatDate(data?.updated_at || data?.created_at) || "Lihat File"}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground italic font-normal">Belum ada file</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <div>
                            {isActionDisabled ? (
                                <Button 
                                    disabled 
                                    variant="ghost"
                                    className="w-full h-12 rounded-xl font-bold justify-center gap-2 bg-primary/10 text-primary opacity-50 cursor-not-allowed"
                                >
                                    <FileText className="h-4 w-4" />
                                    {actionLabel || "Lihat Detail"}
                                </Button>
                            ) : (
                                <Button asChild variant="ghost" className="w-full h-12 rounded-xl font-bold justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all">
                                    <Link href={actionLink}>
                                        {actionLabel ? <FileText className="h-4 w-4" /> : (actionDisabled ? <FileText className="h-4 w-4" /> : <Pencil className="h-4 w-4" />)}
                                        {actionLabel || (actionDisabled ? "Lihat Detail" : "Ubah Data")}
                                    </Link>
                                </Button>
                            )}
                            
                            {actionDisabled && actionDisabledMessage && (
                                <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-3 font-medium">
                                    * {actionDisabledMessage}
                                </p>
                            )}
                        </div>
                        
                        {children}
                    </div>
                </div>
            </GradientCard>
        </motion.div>
    )
}

export default ResearchSummaryWidget;
