import React from 'react';
import { Badge } from '@/components/base/badge';

export type Approval = {
    lecturer_name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
};

interface ApprovalStatusListProps {
    approvals: Approval[];
    includeStaffNode?: boolean;
    staffStatus?: 'pending' | 'scheduled' | 'approved';
}

export function ApprovalStatusList({ approvals, includeStaffNode, staffStatus = 'pending' }: ApprovalStatusListProps) {
    return (
        <div className="space-y-2 mt-2">
            {approvals.map((app, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-background px-3 py-3 sm:py-2 rounded-lg border border-border/50 gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-semibold text-foreground text-xs leading-tight truncate">{app.lecturer_name}</span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                            {app.role === 'supervisor' ? 'Dosen Pembimbing' : (app.role === 'examiner' ? 'Dosen Penguji' : (app.role ? app.role.replace(/_/g, ' ') : 'Dosen Pembimbing'))}
                        </span>
                    </div>
                    {app.status === 'pending' ? (
                        <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2.5 py-0.5 border-none font-bold shrink-0">Menunggu</Badge>
                    ) : app.status === 'approved' ? (
                        <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] px-2.5 py-0.5 border-none font-bold shrink-0">Disetujui</Badge>
                    ) : (
                        <Badge className="bg-rose-500/10 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] px-2.5 py-0.5 border-none font-bold shrink-0">Ditolak</Badge>
                    )}
                </div>
            ))}
            {includeStaffNode && (
                <div className="flex items-center justify-between text-xs bg-background px-3 py-3 sm:py-2 rounded-lg border border-border/50 gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-semibold text-foreground text-xs leading-tight">Staff Program Studi</span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                            Administrasi
                        </span>
                    </div>
                    {staffStatus === 'approved' ? (
                        <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] px-2.5 py-0.5 border-none font-bold shrink-0">Disetujui</Badge>
                    ) : staffStatus === 'scheduled' ? (
                        <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] px-2.5 py-0.5 border-none font-bold shrink-0">Dijadwalkan</Badge>
                    ) : (
                        <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] px-2.5 py-0.5 border-none font-bold shrink-0">Menunggu</Badge>
                    )}
                </div>
            )}
        </div>
    );
}
