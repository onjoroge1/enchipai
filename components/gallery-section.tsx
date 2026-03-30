import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GallerySection() {
  return (
    <section id="gallery" className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Gallery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mt-4 leading-tight">
              Moments at Enchipai
            </h2>
          </div>
          <Link href="/tents">
            <Button
              variant="outline"
              className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              View All Photos
            </Button>
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Large Image */}
          <div className="col-span-2 row-span-2 relative aspect-square rounded-3xl overflow-hidden group">
            <Image
              src="/images/hero-safari.jpg"
              alt="Safari tent at golden hour"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Smaller Images */}
          <div className="relative aspect-square rounded-2xl overflow-hidden group">
            <Image
              src="/images/luxury-tent.jpg"
              alt="Luxury tent interior"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden group">
            <Image
              src="/images/wildlife.jpg"
              alt="African wildlife"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden group">
            <Image
              src="/images/dining.jpg"
              alt="Bush dinner experience"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* CTA Card */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary flex flex-col items-center justify-center p-6 text-center">
            <p className="font-serif text-2xl text-primary-foreground font-medium mb-2">
              Ready for Adventure?
            </p>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Book your unforgettable safari experience
            </p>
            <Link href="/contact">
              <Button
                variant="secondary"
                className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
