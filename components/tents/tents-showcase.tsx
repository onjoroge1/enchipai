"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bath,
  Wifi,
  Coffee,
  Eye,
  BedDouble,
  Maximize,
  Users,
  Star,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tents = [
  {
    id: 1,
    slug: "ndovu-tent",
    name: "Ndovu Tent",
    tagline: "The Elephant — Expansive & Luxurious",
    description:
      "Named after the mighty elephant, the Ndovu Tent is expansive and luxurious. Enjoy sweeping views of the Mara from your private viewing deck, with king-size beds dressed in fine linen and an en-suite bathroom. This tent embodies the grandeur and majesty of its namesake.",
    image: "/images/luxury-tent.jpg",
    price: 396,
    size: "55 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    rating: 4.9,
    reviews: 48,
    amenities: [
      "En-suite Bathroom",
      "Private Viewing Deck",
      "King-size Bed",
      "Fine Linen",
      "Solar Power",
      "Mini Bar",
    ],
    highlights: ["Expansive luxury layout", "Sweeping Mara views", "Named after the elephant"],
  },
  {
    id: 2,
    slug: "chui-tent",
    name: "Chui Tent",
    tagline: "The Leopard — Secluded & Tranquil",
    description:
      "Named after the elusive leopard, the Chui Tent offers seclusion and tranquility with panoramic views of the savannah. Nestled under the indigenous canopy, this tent is perfect for those seeking peace, privacy, and stunning vistas of the Mara plains.",
    image: "/images/tent-escarpment.jpg",
    price: 396,
    size: "55 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    rating: 4.8,
    reviews: 36,
    amenities: [
      "En-suite Bathroom",
      "Panoramic Views",
      "Private Viewing Deck",
      "King-size Bed",
      "Fine Linen",
      "Binoculars",
    ],
    highlights: ["Most secluded position", "Panoramic savannah views", "Named after the leopard"],
  },
  {
    id: 3,
    slug: "kifaru-tent",
    name: "Kifaru Tent",
    tagline: "The Rhino — Intimate & Comfortable",
    description:
      "Named after the rhinoceros, the Kifaru Tent offers intimate comfort with views of roaming wildlife. Thoughtfully designed with both contemporary and local rustic touches for the perfect balance of luxury and authenticity in the heart of the Mara.",
    image: "/images/tent-honeymoon.jpg",
    price: 396,
    size: "55 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    rating: 4.9,
    reviews: 29,
    amenities: [
      "En-suite Bathroom",
      "Private Viewing Deck",
      "King-size Bed",
      "Fine Linen",
      "Writing Desk",
      "Turndown Service",
    ],
    highlights: ["Intimate wildlife views", "Contemporary-rustic design", "Named after the rhino"],
  },
  {
    id: 4,
    slug: "simba-tent",
    name: "Simba Tent",
    tagline: "The Lion — Spacious & Romantic",
    description:
      "Named after the king of the jungle, the Simba Tent is spacious, romantic, and perfect for couples. With a private deck overlooking the Mara plains, every evening becomes a private spectacle of colour as the African sun sets over the savannah.",
    image: "/images/tent-sunset.jpg",
    price: 396,
    size: "55 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    rating: 5.0,
    reviews: 41,
    amenities: [
      "En-suite Bathroom",
      "Private Viewing Deck",
      "King-size Bed",
      "Fine Linen",
      "Champagne Service",
      "Sundowner Kit",
    ],
    highlights: ["Most romantic tent", "Complimentary sundowner kit", "Named after the lion"],
  },
  {
    id: 5,
    slug: "twiga-tent",
    name: "Twiga Tent",
    tagline: "The Giraffe — Family Suite",
    description:
      "Named after the graceful giraffe, the Twiga Tent is a light-filled family suite with a generous layout perfect for groups. Spacious enough to accommodate the whole family with interconnecting areas, flexible bedding, and a junior ranger kit for the little ones.",
    image: "/images/tent-mara.jpg",
    price: 1426,
    size: "85 sqm",
    guests: "2 Adults + 2 Kids",
    bed: "King + Twin Beds",
    rating: 4.8,
    reviews: 22,
    amenities: [
      "En-suite Bathroom",
      "Private Viewing Deck",
      "Family Layout",
      "Interconnecting Rooms",
      "Junior Ranger Kit",
      "Board Games",
    ],
    highlights: ["Family-friendly design", "Junior ranger programme", "Named after the giraffe"],
  },
  {
    id: 6,
    slug: "kiboko-tent",
    name: "Kiboko Tent",
    tagline: "The Hippo — Family Retreat",
    description:
      "Named after the hippopotamus, the Kiboko Tent is the most spacious at Enchipai, sleeping 4+ guests with a large deck ideal for families. Generous living space and premium comfort ensure the whole family enjoys an unforgettable safari experience together.",
    image: "/images/tent-mara.jpg",
    price: 1584,
    size: "95 sqm",
    guests: "4+ Guests",
    bed: "King + Twin Beds",
    rating: 4.9,
    reviews: 18,
    amenities: [
      "En-suite Bathroom",
      "Large Private Deck",
      "Family Layout",
      "Interconnecting Rooms",
      "Junior Ranger Kit",
      "Butler Service",
    ],
    highlights: ["Most spacious tent", "Sleeps 4+ guests", "Named after the hippo"],
  },
  {
    id: 7,
    slug: "nyati-tent",
    name: "Nyati Tent",
    tagline: "The Buffalo — Sturdy & Stylish",
    description:
      "Named after the buffalo, the Nyati Tent is sturdy, stylish, and ideal for adventure seekers. Delivering the full Enchipai experience with all essential comforts at an accessible rate — perfect for travellers who want authentic luxury without compromise.",
    image: "/images/luxury-tent.jpg",
    price: 356,
    size: "50 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    rating: 4.7,
    reviews: 32,
    amenities: [
      "En-suite Bathroom",
      "Private Viewing Deck",
      "King-size Bed",
      "Fine Linen",
      "Solar Power",
      "Writing Desk",
    ],
    highlights: ["Best value tent", "Full Enchipai experience", "Named after the buffalo"],
  },
];

export function TentsShowcase() {
  const [activeTent, setActiveTent] = useState(0);
  const tent = tents[activeTent];

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tent Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {tents.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTent(i)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeTent === i
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Active Tent Display */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <Image
                src={tent.image || "/placeholder.svg"}
                alt={`${tent.name} at Enchipai Mara Camp`}
                fill
                className="object-cover transition-all duration-500"
              />
              <Badge className="absolute top-4 left-4 bg-white/90 text-foreground backdrop-blur-sm border-0 px-3 py-1.5 text-xs font-medium">
                {tent.tagline}
              </Badge>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-semibold text-foreground">{tent.rating}</span>
                <span className="text-xs text-muted-foreground">({tent.reviews})</span>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {tents.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTent(i)}
                  className={cn(
                    "relative flex-1 aspect-[3/2] rounded-xl overflow-hidden transition-all duration-300",
                    activeTent === i
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  <Image
                    src={t.image || "/placeholder.svg"}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tent Details */}
          <div className="space-y-8 lg:sticky lg:top-28">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground font-medium">
                {tent.name}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-base">
                {tent.description}
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary rounded-2xl p-4 text-center">
                <Maximize className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{tent.size}</p>
                <p className="text-xs text-muted-foreground">Size</p>
              </div>
              <div className="bg-secondary rounded-2xl p-4 text-center">
                <BedDouble className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{tent.bed}</p>
                <p className="text-xs text-muted-foreground">Bed Type</p>
              </div>
              <div className="bg-secondary rounded-2xl p-4 text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{tent.guests}</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Highlights
              </h4>
              <div className="space-y-2">
                {tent.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {tent.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif text-foreground font-medium">
                    ${tent.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ night</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Full board inclusive</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-5 border-border text-foreground flex-1 sm:flex-none bg-transparent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Virtual Tour
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-5 flex-1 sm:flex-none">
                  <Link href={`/tents/book?tent=${tent.slug}`}>
                    Book This Tent
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
