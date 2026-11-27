import { Branding } from "./branding";
import { MediaPreview } from "./media-preview";

export function HeroSection() {
   return (
      <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-16">
         <div className="container relative z-10 mx-auto px-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <Branding />
            <div className="hidden lg:block" /> {/* Spacer for grid */}
         </div>
         {/* Carousel: absolute background on mobile, right-aligned on desktop */}
         <div className="absolute inset-0 lg:inset-auto lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[55%] z-0">
            <MediaPreview />
         </div>
      </section>
   )
}