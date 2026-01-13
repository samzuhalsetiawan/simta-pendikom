import { CarouselContent, CarouselItem } from "@/components/ui/carousel";
import carouselImage1 from "./img/carousel1.png";
import carouselImage2 from "./img/carousel2.png";
import carouselImage3 from "./img/carousel3.png";
import Image from "next/image";
import { AutoplayCarousel } from "./autoplay-carousel";

type HeroCarouselProps = {
  className?: string;
};

export function HeroCarousel({ className }: HeroCarouselProps) {
  return (
    <AutoplayCarousel className={className}>
      <CarouselContent>
        {[carouselImage1, carouselImage2, carouselImage3].map(
          (image, index) => {
            return (
              <CarouselItem key={index}>
                <Image src={image} alt="Carousel Image" />;
              </CarouselItem>
            );
          }
        )}
      </CarouselContent>
    </AutoplayCarousel>
  );
}
