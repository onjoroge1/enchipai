"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  BedDouble,
  Maximize,
  Star,
  ChevronRight,
  Check,
  Shield,
  CreditCard,
  Phone,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  amenities: string[];
}

const fallbackAddOns = [
  { id: "bush-dinner", label: "Private Bush Dinner", price: 180, description: "Candlelit dinner under the stars" },
  { id: "game-drive", label: "Morning Game Drive", price: 120, description: "Expert-guided 3-hour safari" },
  { id: "cultural-visit", label: "Maasai Village Visit", price: 85, description: "Authentic cultural experience" },
  { id: "balloon", label: "Hot Air Balloon Safari", price: 450, description: "Sunrise flight over the Mara" },
  { id: "spa", label: "Bush Spa Treatment", price: 150, description: "Relaxing massage in nature" },
  { id: "photography", label: "Photography Safari", price: 200, description: "Professional guide + equipment" },
];

interface AddOn {
  id: string;
  label: string;
  price: number;
  description: string;
}

function BookingFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const tentParam = searchParams.get("tent");

  const [tents, setTents] = useState<Tent[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>(fallbackAddOns);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const [selectedTentIndex, setSelectedTentIndex] = useState(0);
  const [step, setStep] = useState(1);
  // Set default dates (tomorrow and 5 days later)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckOut = new Date(tomorrow);
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 5);
  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(defaultCheckOut.toISOString().split('T')[0]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [dietary, setDietary] = useState("");
  const [occasion, setOccasion] = useState("");

  // Fetch tents from API
  useEffect(() => {
    async function fetchTents() {
      try {
        const response = await fetch("/api/tents");
        if (!response.ok) throw new Error("Failed to fetch tents");
        const data = await response.json();
        setTents(data.data || []);
        
        // Set initial tent based on URL param
        if (tentParam && data.data) {
          const tentIndex = data.data.findIndex((t: Tent) => t.slug === tentParam);
          if (tentIndex >= 0) {
            setSelectedTentIndex(tentIndex);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tents");
      } finally {
        setLoading(false);
      }
    }
    fetchTents();
  }, [tentParam]);

  // Fetch experiences/add-ons from API
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch("/api/experiences");
        if (!response.ok) return;
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setAddOns(data.data.map((exp: { id: string; name: string; price: number; description?: string }) => ({
            id: exp.id,
            label: exp.name,
            price: Number(exp.price),
            description: exp.description || "",
          })));
        }
      } catch {
        // Keep fallback add-ons on error
      }
    }
    fetchExperiences();
  }, []);

  // Check availability when dates change
  useEffect(() => {
    if (tents.length > 0 && checkIn && checkOut && selectedTentIndex >= 0) {
      checkAvailability();
    }
  }, [checkIn, checkOut, selectedTentIndex, tents]);

  const checkAvailability = async () => {
    if (!tents[selectedTentIndex] || !checkIn || !checkOut) return;
    
    try {
      const response = await fetch(
        `/api/tents/availability?tentId=${tents[selectedTentIndex].id}&checkIn=${checkIn}&checkOut=${checkOut}`
      );
      const data = await response.json();
      setIsAvailable(data.data?.available ?? false);
      setAvailabilityChecked(true);
    } catch (err) {
      console.error("Availability check error:", err);
    }
  };

  const tent = tents[selectedTentIndex];

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const addOnTotal = useMemo(() => {
    return addOns
      .filter((a) => selectedAddOns.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
  }, [selectedAddOns]);

  const subtotal = tent ? Number(tent.price) * nights : 0;
  const conservancyFee = 80 * nights * (adults + children);
  const total = subtotal + addOnTotal + conservancyFee;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!tent || !checkIn || !checkOut || !firstName || !lastName || !email) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isAvailable) {
      setError("Tent is not available for the selected dates");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare booking data
      const bookingData = {
        tentId: tent.id,
        checkIn,
        checkOut,
        adults,
        children,
        specialRequests: specialRequests || undefined,
        addOns: selectedAddOns.map((id) => {
          const addOn = addOns.find((a) => a.id === id);
          return {
            name: addOn?.label || id,
            description: addOn?.description,
            price: addOn?.price || 0,
            quantity: 1,
          };
        }),
        guestInfo: {
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          dietaryRequirements: dietary || undefined,
          medicalInfo: occasion ? `Special occasion: ${occasion}` : undefined,
        },
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      // Redirect to confirmation page
      router.push(`/bookings/${data.data.id}/confirmation`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    );
  }

  if (error && !tent) {
    return (
      <section className="py-12 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (!tent) {
    return null;
  }

  const tentImage = tent.images?.[0]?.url || "/images/luxury-tent.jpg";

  return (
    <section className="py-12 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/tents"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Our Tents
        </Link>

        <h1 className="font-serif text-3xl lg:text-4xl text-foreground font-medium mb-2">
          Reserve Your Stay
        </h1>
        <p className="text-muted-foreground mb-10">
          Secure your place of happiness in the heart of the Masai Mara
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-12 max-w-lg">
          {["Select Tent", "Your Details", "Add Experiences", "Review"].map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    step > i + 1
                      ? "bg-primary text-primary-foreground"
                      : step === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1.5 whitespace-nowrap hidden sm:block",
                    step >= i + 1 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mt-[-1.25rem] sm:mt-0",
                    step > i + 1 ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Tent Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl text-foreground font-medium">
                  Choose Your Tent
                </h2>
                <div className="space-y-4">
                  {tents.map((t, i) => {
                    const tentImg = t.images?.[0]?.url || "/images/luxury-tent.jpg";
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTentIndex(i)}
                        className={cn(
                          "w-full flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all text-left",
                          selectedTentIndex === i
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <div className="relative w-full sm:w-40 aspect-[4/3] sm:aspect-[3/2] rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={tentImg} alt={t.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-serif text-lg text-foreground font-medium">
                                {t.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                            </div>
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                                selectedTentIndex === i
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/30"
                              )}
                            >
                              {selectedTentIndex === i && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Maximize className="w-3.5 h-3.5" /> {t.size}
                            </span>
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5" /> {t.beds}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> {t.maxGuests} Guests
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {t.amenities?.slice(0, 4).map((a) => (
                              <span key={a} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                                {a}
                              </span>
                            ))}
                            {t.amenities && t.amenities.length > 4 && (
                              <span className="text-xs text-muted-foreground px-1">
                                +{t.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-lg font-serif text-foreground font-medium">
                            ${Number(t.price).toLocaleString()}
                            <span className="text-xs text-muted-foreground font-sans font-normal"> / night</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dates and Guests */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <h3 className="font-serif text-lg text-foreground font-medium">
                    Dates & Guests
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Check-in</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Check-out</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Adults</label>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "Adult" : "Adults"}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Children</label>
                      <select
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {[0, 1, 2, 3].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "Child" : "Children"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Availability Check */}
                  {availabilityChecked && checkIn && checkOut && (
                    <div className="mt-4">
                      {isAvailable ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                          <Check className="w-4 h-4" />
                          <span>Tent is available for these dates</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4" />
                          <span>Tent is not available for these dates. Please select different dates.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isAvailable && availabilityChecked}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-5 disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Guest Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl text-foreground font-medium">
                  Guest Information
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 700 000 000"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                  <h3 className="font-serif text-lg text-foreground font-medium">
                    Dietary & Special Requirements
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dietary Preferences</label>
                    <select
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">No specific requirements</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="halal">Halal</option>
                      <option value="kosher">Kosher</option>
                      <option value="gluten-free">Gluten Free</option>
                      <option value="other">Other (specify below)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Special Occasion</label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">None</option>
                      <option value="honeymoon">Honeymoon</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="birthday">Birthday</option>
                      <option value="proposal">Proposal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      placeholder="Allergies, mobility needs, surprises we can arrange..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-full px-6 py-5 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-5"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Add Experiences */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl text-foreground font-medium">
                  Enhance Your Safari
                </h2>
                <p className="text-sm text-muted-foreground">
                  Curate your perfect Mara experience with these hand-picked activities
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {addOns.map((addon) => {
                    const isSelected = selectedAddOns.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddOn(addon.id)}
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-2xl border transition-all text-left",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground">{addon.label}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                          <p className="text-sm font-serif text-foreground font-medium mt-2">
                            ${addon.price}
                            <span className="text-xs text-muted-foreground font-sans font-normal"> / person</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="rounded-full px-6 py-5 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-5"
                  >
                    Review Booking
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl text-foreground font-medium">
                  Review Your Booking
                </h2>

                {/* Tent Summary */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-32 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={tentImage} alt={tent.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-foreground font-medium">{tent.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tent.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{new Date(checkIn).toLocaleDateString()} to {new Date(checkOut).toLocaleDateString()}</span>
                        <span>{nights} {nights === 1 ? "Night" : "Nights"}</span>
                        <span>{adults} Adults{children > 0 ? `, ${children} Children` : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Info Summary */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Guest Details</h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name: </span>
                      <span className="text-foreground font-medium">{firstName} {lastName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="text-foreground font-medium">{email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span className="text-foreground font-medium">{phone}</span>
                    </div>
                    {dietary && (
                      <div>
                        <span className="text-muted-foreground">Dietary: </span>
                        <span className="text-foreground font-medium capitalize">{dietary}</span>
                      </div>
                    )}
                    {occasion && (
                      <div>
                        <span className="text-muted-foreground">Occasion: </span>
                        <span className="text-foreground font-medium capitalize">{occasion}</span>
                      </div>
                    )}
                  </div>
                  {specialRequests && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Requests: </span>
                      <span className="text-foreground">{specialRequests}</span>
                    </div>
                  )}
                </div>

                {/* Selected Experiences */}
                {selectedAddOns.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Added Experiences</h3>
                    <div className="space-y-2">
                      {addOns
                        .filter((a) => selectedAddOns.includes(a.id))
                        .map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{a.label}</span>
                            <span className="text-foreground font-medium">${a.price}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" />
                    Secure encrypted payment
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Free cancellation up to 14 days
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary" />
                    24/7 concierge support
                  </span>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="rounded-full px-6 py-5 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !isAvailable}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 py-5 text-base font-semibold shadow-lg disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Confirm & Pay $${total.toLocaleString()}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 space-y-6">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={tentImage} alt={tent.name} fill className="object-cover" />
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground font-medium">{tent.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{tent.description}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ${Number(tent.price).toLocaleString()} x {nights} night{nights !== 1 ? "s" : ""}
                  </span>
                  <span className="text-foreground font-medium">${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conservancy fee</span>
                  <span className="text-foreground font-medium">${conservancyFee.toLocaleString()}</span>
                </div>

                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Experiences ({selectedAddOns.length})
                    </span>
                    <span className="text-foreground font-medium">${addOnTotal.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-xl font-serif text-foreground font-medium">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Full board rate includes all meals, house beverages, and two daily game drives
              </p>

              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground">Need help booking?</p>
                <p className="text-xs text-muted-foreground">
                  Call us at <span className="text-foreground font-medium">+254 700 123 456</span> or WhatsApp for personalised assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BookingForm() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BookingFormInner />
    </Suspense>
  );
}
