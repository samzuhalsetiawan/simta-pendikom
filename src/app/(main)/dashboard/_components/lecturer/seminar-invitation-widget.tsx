"use client"

import { useState } from "react";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { 
    Calendar, 
    Clock,
    MapPin,
    Download,
    Loader2,
    Mail,
    User,
    BookOpen,
    Presentation,
    GraduationCap,
    Inbox,
    Check
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { fetchInvitationPDFData } from "@/lib/actions/pdf";
import SuratUndanganSeminar from "@/components/pdf/surat-undangan-seminar";
import { toast } from "sonner";
import type { SeminarInvitation } from "@/lib/dal/staff-seminar";
import type { EventType } from "@/lib/dal/pdf";
import { markInvitationAsRead } from "@/lib/actions/approval";
import { DashboardActionItem } from "../shared/dashboard-action-tracker";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Presentation; badgeClass: string }> = {
    seminar_proposal: { 
        label: "Seminar Proposal", 
        icon: Presentation,
        badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-transparent font-bold"
    },
    seminar_hasil: { 
        label: "Seminar Hasil", 
        icon: Presentation,
        badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-transparent font-bold"
    },
    pendadaran: { 
        label: "Sidang Skripsi", 
        icon: GraduationCap,
        badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border-transparent font-bold"
    },
};

interface SeminarInvitationWidgetProps {
    invitations: SeminarInvitation[];
    lecturerNip: string;
}

export default function SeminarInvitationWidget({ invitations, lecturerNip }: SeminarInvitationWidgetProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    const activeInvitations = invitations.filter(inv => !readIds.has(`${inv.type}-${inv.id}`));
    const hasActive = activeInvitations.length > 0;
    const actionRef = null; // Removed hook here

    const handleDownloadInvitation = async (invitation: SeminarInvitation) => {
        const key = `${invitation.type}-${invitation.id}`;
        setLoadingId(key);

        try {
            const result = await fetchInvitationPDFData(
                invitation.id,
                invitation.type as EventType,
                lecturerNip
            );

            if (result.error || !result.data) {
                toast.error(result.error || "Gagal mengambil data undangan.");
                return;
            }

            const doc = <SuratUndanganSeminar data={result.data} />;
            const blob = await pdf(doc).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Undangan_${invitation.type}_${invitation.student_nim}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Undangan berhasil didownload!");
        } catch (error) {
            console.error("Download invitation error:", error);
            toast.error("Terjadi kesalahan saat membuat PDF undangan.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleMarkAsRead = async (invitation: SeminarInvitation) => {
        const key = `${invitation.type}-${invitation.id}`;
        
        // Optimistic UI update
        setReadIds(prev => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });

        const result = await markInvitationAsRead(invitation.id, invitation.type);
        if (result.error) {
            toast.error(result.error);
            // Revert on error
            setReadIds(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        } else {
            toast.success("Undangan ditandai sudah dibaca");
        }
    };

    if (activeInvitations.length === 0) {
        return (
            <GradientCard className="">
                <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>
                                Undangan Seminar
                            </GradientCardTitle>
                            <GradientCardDescription>
                                Jadwal seminar sebagai penguji atau pembimbing.
                            </GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
                <div className="p-8 text-center">
                    <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Inbox className="h-7 w-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Belum ada undangan seminar</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Undangan akan muncul di sini jika ada seminar yang dijadwalkan.</p>
                </div>
            </GradientCard>
        );
    }

    return (
        <GradientCard className="">
            <GradientCardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <GradientCardTitle>
                            Undangan Seminar
                        </GradientCardTitle>
                            <GradientCardDescription>
                            Jadwal seminar sebagai penguji atau pembimbing.
                        </GradientCardDescription>
                        </div>
                    </div>
                </GradientCardHeader>
            
            <div className="p-5">
                <div className="divide-y divide-border/40">
                    {activeInvitations.map((inv) => {
                        const config = TYPE_CONFIG[inv.type] || {
                            label: inv.type,
                            icon: Presentation,
                            badgeClass: "bg-primary/10 text-primary border-transparent font-bold"
                        };
                        const key = `${inv.type}-${inv.id}`;
                        const isLoading = loadingId === key;

                        return (
                            <DashboardActionItem id={`seminar-inv-${key}`} isActive={true} key={key} className="relative py-5 first:pt-0 last:pb-0 hover:bg-muted/10 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        <div className="relative shrink-0 mt-0.5">
                                            <Avatar className="h-11 w-11 border border-border/50 shadow-sm rounded-xl">
                                                <AvatarImage src="" alt={inv.student_name} className="object-cover rounded-xl" />
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold rounded-xl">
                                                    {inv.student_name?.charAt(0) || "M"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${config.badgeClass}`}>
                                                        {config.label}
                                                    </Badge>
                                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] font-bold capitalize border-none">
                                                        {inv.lecturer_role === 'supervisor' ? 'Pembimbing' : 'Penguji'}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground flex-wrap">
                                                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                        <span>{inv.student_name}</span>
                                                        <span className="text-muted-foreground font-normal text-xs">({inv.student_nim})</span>
                                                    </div>
                                                    <div className="flex items-start gap-1.5">
                                                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                            {inv.thesis_title || "Judul belum ditentukan"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl space-y-1.5 border border-primary/10 w-full">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                                    <span className="font-bold text-foreground">
                                                        {new Date(inv.scheduled_date).toLocaleDateString('id-ID', { 
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(inv.scheduled_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                                                </div>
                                                {inv.venue && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                                        {inv.venue}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <Button 
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isLoading}
                                                    className="h-8 px-4 font-bold rounded-xl text-xs gap-1.5 border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 w-full sm:w-auto transition-colors"
                                                    onClick={() => handleDownloadInvitation(inv)}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Download className="h-3.5 w-3.5" />
                                                    )}
                                                    {isLoading ? "Membuat PDF..." : "Lihat Undangan"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-4 font-bold rounded-xl text-xs gap-1.5 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 w-full sm:w-auto transition-colors"
                                                    onClick={() => handleMarkAsRead(inv)}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Tandai Sudah Dibaca
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DashboardActionItem>
                        );
                    })}
                </div>
            </div>
        </GradientCard>
    );
}
