"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"

type ActionState = {
    id: string
    isActive: boolean
    isIntersecting: boolean
    isAbove: boolean
    isBelow: boolean
    node: HTMLElement
}

type DashboardActionTrackerContextType = {
    registerAction: (id: string, isActive: boolean, node: HTMLElement) => void
    unregisterAction: (id: string) => void
    updateActionActiveState: (id: string, isActive: boolean) => void
}

const DashboardActionTrackerContext = createContext<DashboardActionTrackerContextType | null>(null)

export function DashboardActionTrackerProvider({ children }: { children: React.ReactNode }) {
    const [actions, setActions] = useState<Record<string, ActionState>>({})

    const updateActionPosition = useCallback(() => {
        setActions(prev => {
            let hasChanges = false;
            const next = { ...prev };
            
            Object.values(next).forEach(action => {
                if (!action.node || !action.isActive) return;
                
                const rect = action.node.getBoundingClientRect();
                const vh = window.innerHeight || document.documentElement.clientHeight;
                
                const isIntersecting = rect.top < vh && rect.bottom > 0;
                const isAbove = rect.bottom <= 0;
                const isBelow = rect.top >= vh;
                
                if (
                    action.isIntersecting !== isIntersecting ||
                    action.isAbove !== isAbove ||
                    action.isBelow !== isBelow
                ) {
                    hasChanges = true;
                    next[action.id] = { ...action, isIntersecting, isAbove, isBelow };
                }
            });
            
            return hasChanges ? next : prev;
        });
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(updateActionPosition);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        
        // Initial check
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [updateActionPosition]);

    const registerAction = useCallback((id: string, isActive: boolean, node: HTMLElement) => {
        setActions(prev => {
            if (prev[id]?.node === node && prev[id]?.isActive === isActive) return prev;
            return {
                ...prev,
                [id]: { id, isActive, node, isIntersecting: true, isAbove: false, isBelow: false }
            }
        });
        // Trigger a position check right after registration
        requestAnimationFrame(updateActionPosition);
    }, [updateActionPosition]);

    const unregisterAction = useCallback((id: string) => {
        setActions(prev => {
            if (!prev[id]) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    const updateActionActiveState = useCallback((id: string, isActive: boolean) => {
        setActions(prev => {
            if (!prev[id] || prev[id].isActive === isActive) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], isActive }
            }
        });
        requestAnimationFrame(updateActionPosition);
    }, [updateActionPosition]);

    // Calculate if we need to show top or bottom arrows
    const activeActions = Object.values(actions).filter(a => a.isActive);
    const hasUnseenAbove = activeActions.some(a => !a.isIntersecting && a.isAbove);
    const hasUnseenBelow = activeActions.some(a => !a.isIntersecting && a.isBelow);

    const scrollToFirstBelow = () => {
        const belowActions = activeActions.filter(a => !a.isIntersecting && a.isBelow);
        if (belowActions.length > 0) {
            // Sort by top offset to find the closest one below
            belowActions.sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top);
            belowActions[0].node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const scrollToFirstAbove = () => {
        const aboveActions = activeActions.filter(a => !a.isIntersecting && a.isAbove);
        if (aboveActions.length > 0) {
            // Sort by bottom offset to find the closest one above (highest bottom value)
            aboveActions.sort((a, b) => b.node.getBoundingClientRect().bottom - a.node.getBoundingClientRect().bottom);
            aboveActions[0].node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <DashboardActionTrackerContext.Provider value={{ registerAction, unregisterAction, updateActionActiveState }}>
            {children}
            
            {/* Top Indicator */}
            <AnimatePresence>
                {hasUnseenAbove && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <button 
                            onClick={scrollToFirstAbove}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg shadow-red-500/30 transition-colors animate-bounce flex flex-col items-center justify-center cursor-pointer"
                            title="Ada aksi di atas"
                        >
                            <ChevronUp className="h-5 w-5" strokeWidth={3} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Indicator */}
            <AnimatePresence>
                {hasUnseenBelow && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <button 
                            onClick={scrollToFirstBelow}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg shadow-red-500/30 transition-colors animate-bounce flex flex-col items-center justify-center cursor-pointer"
                            title="Ada aksi di bawah"
                        >
                            <ChevronDown className="h-5 w-5" strokeWidth={3} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardActionTrackerContext.Provider>
    )
}

export function useDashboardAction(id: string, isActive: boolean) {
    const context = useContext(DashboardActionTrackerContext);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!context) return;
        
        if (ref.current) {
            context.registerAction(id, isActive, ref.current);
        }
        
        return () => {
            context.unregisterAction(id);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only re-register if ID changes

    useEffect(() => {
        if (!context) return;
        context.updateActionActiveState(id, isActive);
    }, [id, isActive, context]);

    return ref;
}

export function DashboardActionItem({ 
    id, 
    isActive, 
    children, 
    className 
}: { 
    id: string; 
    isActive: boolean; 
    children: React.ReactNode; 
    className?: string; 
}) {
    const ref = useDashboardAction(id, isActive) as React.RefObject<HTMLDivElement>;
    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
