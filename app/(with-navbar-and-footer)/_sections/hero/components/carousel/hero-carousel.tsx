import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { AutoplayCarousel } from "./autoplay-carousel"

export function HeroCarousel({
    ...props
}: React.ComponentProps<typeof Carousel>) {

    return (
        <AutoplayCarousel >
            <CarouselContent {...props}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <CarouselItem className="" key={index}>
                        <div className="w-screen aspect-video overflow-hidden">
                            <img className={cn("w-full h-full object-cover object-center", index === 1 ? "scale-x-[-1]" : "")} src={`/carousel-dummy${index + 1}.png`} alt="Dummy Image" />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </AutoplayCarousel>
    )
}
