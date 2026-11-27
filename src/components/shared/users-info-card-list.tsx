import React, { ReactNode } from "react";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription } from "@/components/shared/gradient-card";
import { User, IdCard } from "lucide-react";

export interface UserDisplayData {
    image?: string | null;
    name: string;
    idNumber: string;
    label: string;
    originalData?: any; // To hold any extra data that might be needed by custom render function
}

export interface UsersInfoCardListProps {
    headerIcon?: ReactNode;
    headerTitle: string;
    headerSubtitle: string;
    users: UserDisplayData[];
    renderAction?: (user: UserDisplayData) => React.ReactNode;
    variant?: "lulus" | "pengajuan-proposal" | "seminar-proposal" | "konsultasi" | "penelitian" | "seminar-hasil" | "sidang-skripsi";
    emptyMessage?: string;
}

const UsersInfoCardListHeader = ({ 
    icon, 
    title, 
    subtitle, 
    variant 
}: { 
    icon?: ReactNode, 
    title: string, 
    subtitle: string,
    variant?: UsersInfoCardListProps['variant']
}) => (
    <GradientCardHeader variant={variant}>
        <div className="flex items-start gap-3">
            {icon && (
                <div className="p-1.5 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                    {icon}
                </div>
            )}
            <div>
                <GradientCardTitle>{title}</GradientCardTitle>
                <GradientCardDescription>{subtitle}</GradientCardDescription>
            </div>
        </div>
    </GradientCardHeader>
);

const UsersInfoCardListItem = ({ user, renderAction }: { user: UserDisplayData, renderAction?: (user: UserDisplayData) => ReactNode }) => (
    <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground capitalize">{user.label}</p>
        <div className="flex items-start gap-3">
            {user.image ? (
                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-sm mt-0.5" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
                    {user.name.charAt(0)}
                </div>
            )}
            <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <p className="font-medium text-foreground leading-none">{user.name}</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <p className="text-xs text-muted-foreground/80 leading-none">{user.idNumber}</p>
                </div>
                {renderAction && (
                    <div className="mt-1">
                        {renderAction(user)}
                    </div>
                )}
            </div>
        </div>
    </div>
);

export function UsersInfoCardList({ 
    headerIcon, 
    headerTitle, 
    headerSubtitle, 
    users, 
    renderAction, 
    variant = "lulus",
    emptyMessage = "Belum ada data"
}: UsersInfoCardListProps) {
    return (
        <GradientCard variant={variant}>
            <UsersInfoCardListHeader 
                icon={headerIcon}
                title={headerTitle}
                subtitle={headerSubtitle}
                variant={variant}
            />
            <div className="p-5 flex flex-col gap-4">
                {users && users.length > 0 ? (
                    <div className="space-y-5">
                        {users.map((u, i) => (
                            <UsersInfoCardListItem key={i} user={u} renderAction={renderAction} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
                )}
            </div>
        </GradientCard>
    );
}
