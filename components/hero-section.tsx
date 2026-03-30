"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, MapPin, TreeDeciduous, Eye, Loader2, Home, Calendar, Users, Search } from "lucide-react";

const features = [
  { icon: TreeDeciduous, label: "Indigenous Canopy" },
  { icon: Eye, label: "Wildlife 24/7" },
  { icon: MapPin, label: "Mara Triangle" },
];

interface Tent {
  id: string;
  name: string;
  slug: string;
}

export function HeroSection() {
  const router = useRouter();
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTent, setSelectedTent] = useState<string>("");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<string>("2");

  useEffect(() => {
    fetchTents();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fiveDaysLater = new Date(tomorrow);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

    setCheckIn(tomorrow.toISOString().split("T")[0]);
    setCheckOut(fiveDaysLater.toISOString().split("T")[0]);
  }, []);

  // Auto-adjust checkout when checkin changes
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (outDate <= inDate) {
        const newOut = new Date(inDate);
        newOut.setDate(newOut.getDate() + 1);
        setCheckOut(newOut.toISOString().split("T")[0]);
      }
    }
  }, [checkIn]);

  async function fetchTents() {
    try {
      setLoading(true);
      const response = await fetch("/api/tents");
      if (!response.ok) throw new Error("Failed to fetch tents");
      const data = await response.json();
      const tentsList = data.data || [];
      setTents(tentsList);
      if (tentsList.length > 0) {
        setSelectedTent(tentsList[0].id);
      }
    } catch (err) {
      console.error("Tents fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getBookingUrl = () => {
    const params = new URLSearchParams();
    if (selectedTent) params.set("tent", selectedTent);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    return `/tents/book?${params.toString()}`;
  };

  const handleBooking = () => {
    router.push(getBookingUrl());
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="relative min-h-screen pt-16 lg:pt-20">
      {/* Background Image Container */}
      <div className="absolute inset-0 pt-16 lg:pt-20">
        <div className="relative h-full mx-4 sm:mx-6 lg:mx-8 rounded-3xl overflow-hidden">
          <Image
            src="/images/hero-safari.jpg"
            alt="Luxury safari tent overlooking the Masai Mara savannah"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] flex flex-col justify-between px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto w-full py-8 sm:py-12 lg:py-20 px-5">
          <div className="max-w-3xl mb-8 sm:mb-12 lg:mb-0">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-medium text-white leading-tight text-balance">
              Find Your Place of{" "}
              <span className="text-accent">Happiness</span>
            </h1>

            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
              Discover Exclusive Luxury Safari Experience In The Heart Of Masai Mara.
              Unplug, Unwind, And Reconnect With Nature.
            </p>

            <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30"
                >
                  <feature.icon className="w-4 h-4 text-accent" />
                  <span className="text-white text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Booking Bar */}
        <div className="relative lg:absolute bottom-8 sm:left-6 sm:right-6 lg:left-8 lg:right-8 mt-8 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            {/* Rating Badge - Desktop only */}
            <div className="hidden lg:flex items-center justify-end mb-6 px-4 lg:px-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span className="text-3xl font-serif text-white font-medium">4.9</span>
                <span className="text-white/70 text-sm">from 120+ stays</span>
              </div>
            </div>

            {/* Desktop Booking Bar */}
            <div className="hidden lg:block bg-white backdrop-blur-md rounded-full p-3 xl:p-4 shadow-2xl border border-border/50">
              <div className="flex items-center">
                {/* Tent */}
                <div className="flex items-center gap-2 px-3 xl:px-5 border-r border-border/40 min-w-0">
                  <div className="hidden xl:flex w-10 h-10 rounded-full bg-secondary items-center justify-center shrink-0">
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Home className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] xl:text-xs text-muted-foreground font-medium">Tent</span>
                    {loading ? (
                      <span className="text-foreground font-semibold text-xs xl:text-sm">Loading...</span>
                    ) : (
                      <select
                        value={selectedTent}
                        onChange={(e) => setSelectedTent(e.target.value)}
                        className="bg-transparent text-foreground font-semibold text-xs xl:text-sm border-0 p-0 focus:ring-0 cursor-pointer"
                      >
                        {tents.map((tent) => (
                          <option key={tent.id} value={tent.id}>{tent.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Check-in */}
                <div className="flex items-center gap-2 px-3 xl:px-5 border-r border-border/40">
                  <div className="hidden xl:flex w-10 h-10 rounded-full bg-secondary items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] xl:text-xs text-muted-foreground font-medium">Check-in</span>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={today}
                      className="bg-transparent text-foreground font-semibold text-xs xl:text-sm border-0 p-0 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="flex items-center gap-2 px-3 xl:px-5 border-r border-border/40">
                  <div className="hidden xl:flex w-10 h-10 rounded-full bg-secondary items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] xl:text-xs text-muted-foreground font-medium">Check-out</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || today}
                      className="bg-transparent text-foreground font-semibold text-xs xl:text-sm border-0 p-0 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-2 px-3 xl:px-5">
                  <div className="hidden xl:flex w-10 h-10 rounded-full bg-secondary items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] xl:text-xs text-muted-foreground font-medium">Guests</span>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="bg-transparent text-foreground font-semibold text-xs xl:text-sm border-0 p-0 focus:ring-0 cursor-pointer"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                      <option value="5">5 Adults</option>
                      <option value="6">6 Adults</option>
                    </select>
                  </div>
                </div>

                {/* Book Button */}
                <div className="pl-2 xl:pl-4 pr-1 shrink-0">
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5 xl:px-8 py-5 xl:py-6 text-xs xl:text-sm font-semibold shadow-lg whitespace-nowrap">
                    <Link href={getBookingUrl()}>Book Your Stay</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Booking Bar - Compact 2-row layout */}
            <div className="lg:hidden bg-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50">
              <div className="grid grid-cols-2 gap-3">
                {/* Tent - Full width */}
                <div className="col-span-2 flex items-center gap-2.5 bg-secondary/50 rounded-xl px-3 py-2.5">
                  <Home className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Tent</span>
                    {loading ? (
                      <span className="text-foreground font-semibold text-xs">Loading...</span>
                    ) : (
                      <select
                        value={selectedTent}
                        onChange={(e) => setSelectedTent(e.target.value)}
                        className="bg-transparent text-foreground font-semibold text-xs border-0 p-0 focus:ring-0 cursor-pointer w-full"
                      >
                        {tents.map((tent) => (
                          <option key={tent.id} value={tent.id}>{tent.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Check-in */}
                <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-3 py-2.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Check-in</span>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={today}
                      className="bg-transparent text-foreground font-semibold text-xs border-0 p-0 focus:ring-0 w-full"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-3 py-2.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Check-out</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || today}
                      className="bg-transparent text-foreground font-semibold text-xs border-0 p-0 focus:ring-0 w-full"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-3 py-2.5">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Guests</span>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="bg-transparent text-foreground font-semibold text-xs border-0 p-0 focus:ring-0 cursor-pointer w-full"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                      <option value="5">5 Adults</option>
                      <option value="6">6 Adults</option>
                    </select>
                  </div>
                </div>

                {/* Book Btn - Full width, slightly smaller */}
                <div className="col-span-2 mt-1">
                  <Button
                    onClick={handleBooking}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-5 text-sm font-semibold shadow-lg"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Check Availability
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
