"use client";

import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

type AutoplayCarouselProps = {
  className?: string;
  children: React.ReactNode;
};

export function AutoplayCarousel({
  className,
  children,
}: AutoplayCarouselProps) {
  return (
    <Carousel
      className={cn("w-screen overflow-x-hidden", className)}
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 4500,
          stopOnInteraction: false,
        }),
      ]}
    >
      {children}
    </Carousel>
  );
}
