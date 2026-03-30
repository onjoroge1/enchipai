"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Camera, Users, Moon, Clock, ArrowRight } from "lucide-react";

const experiences = [
  {
    icon: Sunrise,
    title: "Morning Game Drives",
    description:
      "Embark on early morning safaris to witness the Mara awakening with its incredible wildlife including the Big Five.",
    duration: "4 hours",
    price: 150,
    image: "/images/wildlife.jpg",
    tag: "Most Popular",
  },
  {
    icon: Camera,
    title: "Photography Safaris",
    description:
      "Capture stunning images of African wildlife with guidance from experienced naturalists and photographers.",
    duration: "6 hours",
    price: 220,
    image: "/images/blog-leopard.jpg",
    tag: "Expert Led",
  },
  {
    icon: Users,
    title: "Maasai Cultural Visits",
    description:
      "Immerse yourself in the rich traditions of the Maasai people through village visits and cultural exchanges.",
    duration: "3 hours",
    price: 95,
    image: "/images/blog-maasai.jpg",
    tag: "Cultural",
  },
  {
    icon: Moon,
    title: "Bush Dinners",
    description:
      "Enjoy exquisite dining under the African stars with gourmet meals prepared by our talented chefs.",
    duration: "3 hours",
    price: 180,
    image: "/images/dining.jpg",
    tag: "Romantic",
  },
];

export function ExperiencesSection() {
  return (
    <section id="experiences" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mt-4 leading-tight text-balance">
            More Than The Usual Safari
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            From thrilling game drives to intimate cultural encounters,
            Enchipai offers a curated selection of authentic African experiences.
            Book individually or let us craft a bespoke itinerary for your stay.
          </p>
        </div>

        {/* Experiences Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {experiences.map((experience) => (
            <div
              key={experience.title}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="grid sm:grid-cols-[1fr_1.2fr]">
                {/* Image */}
                <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[260px]">
                  <Image
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0 text-xs">
                    {experience.tag}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <experience.icon className="w-5 h-5 text-primary" />
                  </div>

                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    {experience.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {experience.description}
                  </p>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{experience.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">From </span>
                      <span className="text-lg font-serif text-foreground font-medium">
                        ${experience.price}
                      </span>
                      <span className="text-xs text-muted-foreground"> / person</span>
                    </div>
                    <Link href={`/tents/book?experience=${encodeURIComponent(experience.title)}`}>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 text-xs"
                      >
                        Book Now
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
