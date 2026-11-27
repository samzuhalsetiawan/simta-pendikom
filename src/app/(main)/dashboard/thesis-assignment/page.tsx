import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStudentsData, getLecturersData, getGenerations } from "@/lib/dal/thesis";
import ThesisAssignmentClient from "../_components/staff/thesis-assignment-client";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/base/button";

export default async function ThesisAssignmentPage(props: {
    searchParams: Promise<{ year?: string }>;
}) {
    const searchParams = await props.searchParams;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/login");
    const { getActiveRoleCookie } = await import("@/lib/actions/cookies");
    let activeRole = await getActiveRoleCookie();
    
    // Fallback to the single role if cookie is not set
    if (!activeRole) {
        try {
            const roles = JSON.parse(session.user.role || "[]") as string[];
            if (roles.length === 1) activeRole = roles[0];
        } catch (e) {}
    }

    if (activeRole !== 'staff') {
        const { Forbidden403 } = await import("@/components/forbidden-403");
        return <Forbidden403 />;
    }

    const generations = await getGenerations();
    const currentGeneration = searchParams.year || generations[0] || "";

    const [students, lecturers] = await Promise.all([
        getStudentsData(currentGeneration),
        getLecturersData()
    ]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            
            <main className="flex-1 container py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
                <div>
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                            <Home className="h-3 w-3" /> Dashboard
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">Penugasan Skripsi</span>
                    </nav>
                </div>

                <ThesisAssignmentClient 
                    students={students} 
                    lecturers={lecturers} 
                    generations={generations}
                    currentGeneration={currentGeneration}
                />
            </main>
        </div>
    );
}
