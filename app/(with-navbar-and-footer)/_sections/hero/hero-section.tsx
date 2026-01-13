import { ScrollAwareSection } from "@/components/provider/navbar-scroll/scroll-aware-section";
import { cn } from "@/lib/utils";
import styles from "./hero-section.module.css";
import { HeroCarousel } from "./components/carousel/hero-carousel";
import { DashboardButton } from "./components/dashboard-button";

export function HeroSection() {
    return (
        <ScrollAwareSection className={cn("relative w-screen aspect-square md:aspect-video")}>
            <HeroCarousel className={cn(styles.fadeGradient)} />
            <div className="flex flex-col items-center justify-center gap-4 w-screen pt-2 pb-6 absolute top-0 bottom-0 left-0 right-0 z-10 pointer-events-none">
                <div className="flex flex-col items-center justify-center lg:gap-4 mt-32 md:mt-14 pointer-events-auto">
                    <h3 className="text-md lg:text-6xl font-bold drop-shadow-md">Pendaftaran Tugas Akhir</h3>
                    <p className="text-xs lg:text-xl text-center drop-shadow-sm max-w-2xl px-4">
                        Sistem Informasi Manajemen Tugas Akhir Mahasiswa
                        <br />
                        Fakultas Ilmu Komputer
                    </p>
                </div>
                <DashboardButton />
            </div>
        </ScrollAwareSection>
    );
}