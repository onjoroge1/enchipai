"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle } from "lucide-react";

export function TentsBookingCta() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-primary rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 400" fill="none">
              <circle cx="700" cy="50" r="200" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
              <circle cx="100" cy="350" r="150" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
              <circle cx="400" cy="200" r="300" stroke="currentColor" strokeWidth="0.3" className="text-primary-foreground" />
            </svg>
          </div>

          <div className="relative z-10 p-8 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl text-primary-foreground font-medium leading-tight text-balance">
                  Ready to Experience the Mara Like Never Before?
                </h2>
                <p className="mt-4 text-primary-foreground/80 leading-relaxed">
                  Our camp manager will personally assist you with selecting the perfect 
                  tent, crafting your itinerary, and arranging all transfers. With only 
                  five tents, we recommend booking early to secure your preferred dates.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base font-semibold">
                    <Link href="/tents/book">Book Your Stay</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full px-8 py-6 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  >
                    Request a Quote
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider font-medium">Call Us</p>
                    <p className="text-primary-foreground font-medium">+254 700 123 456</p>
                  </div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider font-medium">Email</p>
                    <p className="text-primary-foreground font-medium">reservations@enchipai.com</p>
                  </div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider font-medium">WhatsApp</p>
                    <p className="text-primary-foreground font-medium">+254 700 123 456</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
