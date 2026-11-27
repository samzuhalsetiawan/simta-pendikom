"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, GraduationCap, Building2, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { setActiveRoleCookie } from "@/lib/actions/cookies"

export type RoleOption = {
    id: string; // 'student' | 'lecturer' | 'staff'
    label: string;
}

interface Props {
    options: RoleOption[];
}

export function GlobalRoleSelector({ options }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleSelect = async (roleId: string) => {
        setIsLoading(roleId)
        try {
            await setActiveRoleCookie(roleId)
            router.refresh()
        } catch (error) {
            console.error("Failed to set role", error)
            setIsLoading(null)
        }
    }

    const getIcon = (roleId: string) => {
        switch (roleId) {
            case 'student': return <GraduationCap className="h-6 w-6" />
            case 'lecturer': return <Users className="h-6 w-6" />
            case 'staff': return <Building2 className="h-6 w-6" />
            default: return <Users className="h-6 w-6" />
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 sm:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden"
            >
                <div className="p-8 text-center border-b border-border/50 bg-muted/20">
                    <h2 className="text-xl font-heading font-extrabold mb-2 text-foreground">
                        Masuk ke halaman dashboard sebagai:
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Akun Anda memiliki lebih dari satu akses peran. Silakan pilih salah satu.
                    </p>
                </div>
                
                <div className="p-6 space-y-3">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            disabled={isLoading !== null}
                            className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                                ${isLoading === opt.id 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'bg-card border-border/50 hover:border-primary/50 hover:bg-muted/50 text-foreground'
                                }
                                ${isLoading && isLoading !== opt.id ? 'opacity-50 pointer-events-none' : ''}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl transition-colors duration-300
                                    ${isLoading === opt.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}
                                `}>
                                    {getIcon(opt.id)}
                                </div>
                                <span className="font-semibold capitalize text-left">
                                    {opt.label}
                                </span>
                            </div>
                            
                            {isLoading === opt.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isLoading === opt.id ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary group-hover:translate-x-1'}`} />
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
