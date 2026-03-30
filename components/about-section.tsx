import Image from "next/image";
import { Tent, Eye, Mountain, Shield } from "lucide-react";

const highlights = [
  {
    icon: Tent,
    title: "5 Luxury Tents",
    description: "Intimate and exclusive with only five luxury tents",
  },
  {
    icon: Eye,
    title: "Panoramic Views",
    description: "Breathtaking vistas of the Mara from your verandah",
  },
  {
    icon: Mountain,
    title: "Escarpment Location",
    description: "Strategically positioned on Esoit Oloololo escarpment",
  },
  {
    icon: Shield,
    title: "Mara Triangle",
    description: "Prime location north of the Mara Triangle boundary",
  },
];

export function AboutSection() {
  return (
    <section id="location" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <Image
                src="/images/wildlife.jpg"
                alt="African elephant in the Masai Mara savannah"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl border border-border max-w-xs hidden lg:block">
              <p className="font-serif text-lg text-card-foreground italic">
                {'"Enchipai" in Maa Language translates to "a place of happiness"'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              About Enchipai
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mt-4 leading-tight text-balance">
              Hidden Under the Indigenous Canopy
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Hidden under the indigenous canopy of the Esoit Oloololo escarpment, 
              Enchipai Luxury Camp offers one of the most exclusive safari experiences 
              in the Maasai Mara. Our camp&apos;s location was carefully identified and 
              strategically engineered with a perfect view of the Mara.
            </p>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              The tents are well designed with both contemporary and local rustic touch 
              to offer all our guests comfort, relaxation, and exciting game viewing in 
              the vast savannah Mara right from your tent or verandah. Wild animals 
              roam around the camp 24/7 — Enchipai Camp truly offers more than the usual!
            </p>

            {/* Highlights Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
