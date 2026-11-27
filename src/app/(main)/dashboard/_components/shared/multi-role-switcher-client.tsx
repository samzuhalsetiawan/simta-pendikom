"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { setActiveRoleCookie } from "@/lib/actions/cookies"
import * as Select from "@radix-ui/react-select"
import { ChevronDown, Check } from "lucide-react"
import { GradientCard } from "@/components/shared/gradient-card"

interface Props {
    options: { id: string, label: string, hasNotification?: boolean }[]
    activeRole: string | null
}

export function RoleSwitcherClient({ options, activeRole }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleRoleChange = (roleId: string) => {
        if (roleId === activeRole) return;
        startTransition(async () => {
            await setActiveRoleCookie(roleId);
            router.refresh();
        });
    }

    const activeOption = options.find(o => o.id === activeRole);
    const currentLabel = activeOption?.label || "Pilih Role";
    const hasAnyOtherNotification = options.some(o => o.id !== activeRole && o.hasNotification);

    return (
        <GradientCard className="mb-6">
            <div className="p-5 flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground">Anda sedang melihat dashboard sebagai:</p>
                
                <Select.Root value={activeRole || ""} onValueChange={handleRoleChange} disabled={isPending}>
                    <Select.Trigger className="inline-flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold bg-background border border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary gap-2 w-full transition-colors relative">
                        {hasAnyOtherNotification && (
                            <span className="absolute -top-1 -left-1 flex h-3 w-3 rounded-full bg-destructive z-10" />
                        )}
                        <div className="flex items-center gap-2">
                            <Select.Value>{isPending ? "Mengganti role..." : currentLabel}</Select.Value>
                        </div>
                        <Select.Icon>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content className="overflow-hidden bg-popover rounded-xl border border-border shadow-lg z-[100] animate-in fade-in zoom-in-95">
                            <Select.Viewport className="p-1">
                                {options.map((option) => (
                                    <Select.Item 
                                        key={option.id} 
                                        value={option.id}
                                        className="relative flex items-center pl-8 pr-4 py-2.5 text-sm font-medium rounded-none hover:bg-primary/10 hover:text-primary cursor-pointer focus:bg-primary/10 focus:text-primary focus:outline-none select-none data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Select.ItemText>{option.label}</Select.ItemText>
                                            {option.hasNotification && option.id !== activeRole && (
                                                <span className="flex h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                                            )}
                                        </div>
                                        <Select.ItemIndicator className="absolute left-2.5 inline-flex items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            </div>
        </GradientCard>
    )
}
