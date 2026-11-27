import React from "react";
import { UsersInfoCardList, UserDisplayData, UsersInfoCardListProps } from "./users-info-card-list";
import { Users } from "lucide-react";

export interface LecturerDisplayData {
    image?: string | null;
    name: string;
    nip: string;
    roleLabel: string;
    originalData?: any;
}

export interface LecturersInfoCardListProps {
    lecturers: LecturerDisplayData[];
    renderAction?: (lecturer: LecturerDisplayData) => React.ReactNode;
    variant?: UsersInfoCardListProps["variant"];
    hideIcon?: boolean;
}

export function LecturersInfoCardList({ lecturers, renderAction, variant = "lulus", hideIcon = false }: LecturersInfoCardListProps) {
    const users: UserDisplayData[] = lecturers.map(l => ({
        image: l.image,
        name: l.name,
        idNumber: l.nip,
        label: l.roleLabel,
        originalData: l.originalData
    }));

    const handleRenderAction = (user: UserDisplayData) => {
        if (!renderAction) return null;
        // Reconstruct the LecturerDisplayData to pass back to the renderAction
        const lecturer: LecturerDisplayData = {
            image: user.image,
            name: user.name,
            nip: user.idNumber,
            roleLabel: user.label,
            originalData: user.originalData
        };
        return renderAction(lecturer);
    };

    return (
        <UsersInfoCardList
            headerIcon={hideIcon ? undefined : <Users className="h-4 w-4 text-primary" />}
            headerTitle="Dosen Pembimbing & Penguji"
            headerSubtitle="Daftar dosen yang bertugas"
            users={users}
            renderAction={renderAction ? handleRenderAction : undefined}
            variant={variant}
            emptyMessage="Belum ada dosen yang ditugaskan"
        />
    );
}
