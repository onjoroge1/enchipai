"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, BedDouble, Maximize, Users, ArrowRight, Loader2 } from "lucide-react";

interface Tent {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  size: string;
  beds: string;
  maxGuests: number;
  images: Array<{ url: string }>;
  isFeatured: boolean;
}

export function AccommodationSection() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTents() {
      try {
        const response = await fetch("/api/tents?featured=true");
        if (!response.ok) throw new Error("Failed to fetch tents");
        const data = await response.json();
        setTents(data.data || []);
      } catch (err) {
        console.error("Tents fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTents();
  }, []);

  if (loading) {
    return (
      <section id="accommodation" className="py-20 lg:py-32 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    );
  }

  if (tents.length === 0) {
    return null;
  }

  const featuredTent = tents.find((t) => t.isFeatured) || tents[0];
  const otherTents = tents.filter((t) => t.id !== featuredTent.id).slice(0, 4);
  const tentImage = featuredTent.images?.[0]?.url || "/images/luxury-tent.jpg";
  return (
    <section id="accommodation" className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Accommodation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mt-4 leading-tight text-balance">
              Five Tents, Five Stories
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Each tent at Enchipai is a unique sanctuary, blending contemporary elegance with authentic 
              African character on the Esoit Oloololo escarpment.
            </p>
          </div>
          <Link href="/tents">
            <Button
              variant="outline"
              className="rounded-full px-6 py-5 border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              View All Tents
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Featured Tent - Large Card */}
        <Link href={`/tents/book?tent=${featuredTent.slug}`} className="group block mb-8">
          <div className="relative rounded-3xl overflow-hidden bg-card border border-border">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={tentImage}
                  alt={featuredTent.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground border-0 px-3 py-1.5">
                  Featured
                </Badge>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="font-serif text-2xl lg:text-3xl text-foreground font-medium">
                  {featuredTent.name}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {featuredTent.description}
                </p>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{featuredTent.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{featuredTent.beds}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{featuredTent.maxGuests} Guests</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-2xl font-serif text-foreground font-medium">
                      ${Number(featuredTent.price).toLocaleString()}
                      <span className="text-sm font-sans text-muted-foreground ml-1">/ night</span>
                    </p>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-5">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Other Tents Grid */}
        {otherTents.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {otherTents.map((tent) => {
              const tentImg = tent.images?.[0]?.url || "/images/luxury-tent.jpg";
              return (
                <Link href={`/tents/book?tent=${tent.slug}`} key={tent.id} className="group">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={tentImg}
                        alt={tent.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif text-lg text-foreground font-medium">
                          {tent.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                        {tent.description}
                      </p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                        <span>{tent.size}</span>
                        <span>{tent.beds}</span>
                        <span>{tent.maxGuests} Guests</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-lg font-serif text-foreground font-medium">
                          ${Number(tent.price).toLocaleString()}
                          <span className="text-xs font-sans text-muted-foreground ml-1">/ night</span>
                        </p>
                        <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
                          Book <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
