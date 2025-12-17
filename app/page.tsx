import { MainCarousel } from "@/components/main-carousel/main-carousel";
import { MainCalendar } from "@/components/main-calendar/main-calendar";
import { MainHero } from "@/components/hero/main-hero";

export default function Page() {
    return (
        <>
            <MainHero />
            <section className="w-screen h-screen bg-background"></section>
        </>
    );
}