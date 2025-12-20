"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function MainCarousel({
    className,
    ...props
}: React.ComponentProps<typeof Carousel>) {

    const plugin = React.useRef(
        Autoplay({ delay: 4500, stopOnInteraction: false })
    )

    return (
        <Carousel plugins={[plugin.current]} className={cn("w-screen overflow-x-hidden", className)} {...props}>
            <CarouselContent className="">
                {Array.from({ length: 3 }).map((_, index) => (
                    <CarouselItem className="" key={index}>
                        <div className="w-screen aspect-video overflow-hidden">
                            <img className={cn("w-full h-full object-cover object-center", index === 1 ? "scale-x-[-1]" : "")} src={`/carousel-dummy${index + 1}.png`} alt="Dummy Image" />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}
