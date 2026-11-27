"use client"

import { PanelRight } from "lucide-react"
import { Button } from "@/components/base/button"
import MobileSidebarDrawer from "./mobile-sidebar-drawer"

interface Props {
    children: React.ReactNode
}

export default function DashboardSidebar({ children }: Props) {
    return (
        <>
            {/* Desktop: shown as column */}
            <aside className="hidden lg:block space-y-6">
                {children}
            </aside>

            {/* Mobile: hidden, accessible via drawer */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                <MobileSidebarDrawer
                    triggerButton={
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <PanelRight className="h-5 w-5" />
                        </Button>
                    }
                >
                    {children}
                </MobileSidebarDrawer>
            </div>
        </>
    )
}
