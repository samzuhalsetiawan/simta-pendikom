import { MainCarousel } from "@/components/main-carousel/main-carousel";
import { Button } from "@/components/ui/button";
import styles from "./home.module.css"
import { cn } from "@/lib/utils";
import { ScrollAwareSection } from "@/components/scroll-aware-section";

export default function Page() {
    return (
        <main className="">
            <ScrollAwareSection className={cn("relative w-screen aspect-square md:aspect-video")}>
                <MainCarousel className={cn(styles.fadeGradient)} />
                <div className="flex flex-col items-center justify-center gap-4 w-screen pt-2 pb-6 absolute top-0 bottom-0 left-0 right-0">
                    <div className="flex flex-col items-center justify-center lg:gap-4 mt-32 md:mt-14">
                        <h3 className="text-md lg:text-6xl font-bold">Pendaftaran Tugas Akhir</h3>
                        <p className="text-xs lg:text-xl text-center">kini telah dibuka, silahkan klik tombol di bawah ini untuk masuk ke dashboard</p>
                    </div>
                    <Button asChild variant={"default"} size={"lg"} className="lg:px-14 lg:py-6 hover:cursor-pointer lg:uppercase lg:bg-primary lg:text-background lg:border-border lg:hover:bg-muted lg:hover:text-primary lg:hover:border-primary lg:dark:text-primary lg:dark:bg-input/30 lg:dark:border-primary lg:dark:hover:border-transparent lg:dark:hover:bg-background lg:dark:hover:text-foreground">
                        <a href="/dashboard">Dashboard</a>
                    </Button>
                </div>
            </ScrollAwareSection>
            <section className="border-2 border-blue-500 w-screen aspect-square">
                <h1>Hello Bro 2</h1>
            </section>
            <section className="border-2 border-red-500 w-screen aspect-square">
                <h1>Hello Bro 3</h1>
            </section>
            <section className="border-2 border-green-500 w-screen aspect-square">
                <h1>Hello Bro 4</h1>
            </section>
        </main>
    );
}