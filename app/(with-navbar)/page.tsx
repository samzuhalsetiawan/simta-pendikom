import { Suspense, use } from "react";
import { MainCarousel } from "@/components/main-carousel/main-carousel";
import { Button } from "@/components/ui/button";
import styles from "../home.module.css"
import { cn } from "@/lib/utils";
import { ScrollAwareSection } from "@/components/scroll-aware-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { HomeHeroButton } from "@/components/button/home-hero-button";

async function getStatsData() {
    // Simulasikan delay
    await new Promise(r => setTimeout(r, 500));
    return {
        theses: 120,
        graduates: 450,
        activeStudents: 85
    };
}

function CarouselSection() {
    return (
        <ScrollAwareSection className={cn("relative w-screen aspect-square md:aspect-video")}>
            <MainCarousel className={cn(styles.fadeGradient)} />
            <div className="flex flex-col items-center justify-center gap-4 w-screen pt-2 pb-6 absolute top-0 bottom-0 left-0 right-0 z-10 pointer-events-none">
                <div className="flex flex-col items-center justify-center lg:gap-4 mt-32 md:mt-14 pointer-events-auto">
                    <h3 className="text-md lg:text-6xl font-bold drop-shadow-md">Pendaftaran Tugas Akhir</h3>
                    <p className="text-xs lg:text-xl text-center drop-shadow-sm max-w-2xl px-4">
                        Sistem Informasi Manajemen Tugas Akhir Mahasiswa
                        <br />
                        Fakultas Ilmu Komputer
                    </p>
                </div>
                <HomeHeroButton />
            </div>
        </ScrollAwareSection>
    );
}

function StatsSection() {
    const stats = use(getStatsData());
    return (
        <section className="w-full py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                            <div className="p-4 bg-primary/10 rounded-full text-primary">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">{stats.theses}</h3>
                                <p className="text-muted-foreground mt-1">Judul Terdaftar</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">{stats.activeStudents}</h3>
                                <p className="text-muted-foreground mt-1">Mahasiswa Aktif</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">{stats.graduates}</h3>
                                <p className="text-muted-foreground mt-1">Lulusan</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

export default async function Page() {

    return (
        <main className="min-h-screen flex flex-col">
            <CarouselSection />
            <Suspense fallback={
                <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            }>
                <StatsSection />
            </Suspense>
        </main>
    );
}