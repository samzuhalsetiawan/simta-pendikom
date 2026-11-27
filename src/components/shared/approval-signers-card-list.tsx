import React from "react";
import { UsersInfoCardList, UserDisplayData, UsersInfoCardListProps } from "./users-info-card-list";
import { CheckCircle2, Clock, XCircle, PenTool } from "lucide-react";
import { Badge } from "@/components/base/badge";

export interface ApprovalSignerData {
    id: string;
    lecturer_nip: string;
    lecturer_name: string;
    lecturer_image?: string | null;
    role: string;
    position?: number;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ApprovalSignersCardListProps {
    approvals: ApprovalSignerData[];
    variant?: UsersInfoCardListProps["variant"];
    hideIcon?: boolean;
}

export function ApprovalSignersCardList({ approvals, variant = "lulus", hideIcon = false }: ApprovalSignersCardListProps) {
    const getRoleLabel = (role: string, position?: number) => {
        switch (role) {
            case 'ketua_jurusan':
                return 'Ketua Jurusan';
            case 'koordinator_program_studi':
                return 'Koordinator Program Studi';
            case 'supervisor':
                return position ? `Pembimbing ${position}` : 'Dosen Pembimbing';
            case 'examiner':
                return position ? `Penguji ${position}` : 'Dosen Penguji';
            default:
                return role.replace(/_/g, ' ');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 rounded-md px-2 py-0.5 text-xs"><CheckCircle2 className="w-3 h-3" /> Disetujui</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 gap-1 rounded-md px-2 py-0.5 text-xs"><XCircle className="w-3 h-3" /> Ditolak</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 gap-1 rounded-md px-2 py-0.5 text-xs"><Clock className="w-3 h-3" /> Menunggu</Badge>;
        }
    };

    const users: UserDisplayData[] = approvals.map(app => ({
        image: app.lecturer_image,
        name: app.lecturer_name,
        idNumber: app.lecturer_nip,
        label: getRoleLabel(app.role, app.position),
        originalData: app
    }));

    const renderAction = (user: UserDisplayData) => {
        const app = user.originalData as ApprovalSignerData;
        return (
            <div className="mt-2">
                {getStatusBadge(app.status)}
            </div>
        );
    };

    return (
        <UsersInfoCardList
            headerIcon={hideIcon ? undefined : <PenTool className="h-4 w-4 text-primary" />}
            headerTitle="Pihak Penandatangan"
            headerSubtitle="Daftar dosen dan staff yang menyetujui"
            users={users}
            renderAction={renderAction}
            variant={variant}
            emptyMessage="Belum ada pihak penandatangan"
        />
    );
}
