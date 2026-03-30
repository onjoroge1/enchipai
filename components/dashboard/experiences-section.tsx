"use client";

import { Clock, Users, Star, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const experiences = [
  {
    id: 1,
    title: "Morning Game Drive",
    duration: "4 hours",
    capacity: "6 guests max",
    rating: 4.9,
    price: "$150",
    image: "/images/wildlife.jpg",
    available: true,
  },
  {
    id: 2,
    title: "Bush Dinner Experience",
    duration: "3 hours",
    capacity: "8 guests max",
    rating: 5.0,
    price: "$200",
    image: "/images/dining.jpg",
    available: true,
  },
  {
    id: 3,
    title: "Maasai Village Visit",
    duration: "2 hours",
    capacity: "10 guests max",
    rating: 4.8,
    price: "$80",
    image: "/images/hero-safari.jpg",
    available: false,
  },
];

export function ExperiencesSection() {
  return (
    <Card id="experiences">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Available Experiences</CardTitle>
        <p className="text-sm text-muted-foreground">Book unique activities during your stay</p>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all"
            >
              <div
                className="h-32 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${exp.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white font-semibold text-sm">{exp.title}</span>
                  <div className="flex items-center gap-1 text-white text-xs">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    {exp.rating}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exp.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {exp.capacity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{exp.price}</span>
                  {exp.available ? (
                    <Button size="sm" className="rounded-full bg-primary text-primary-foreground text-xs h-8">
                      <Plus className="w-3 h-3 mr-1" />
                      Book
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Fully Booked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
