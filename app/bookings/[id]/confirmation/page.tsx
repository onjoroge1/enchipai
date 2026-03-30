"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  Download,
  ArrowLeft,
  Loader2,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Booking {
  id: string;
  bookingNumber: string | null;
  tent: {
    name: string;
    image: string | null;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  addOns: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingWithPesapal, setPayingWithPesapal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchBooking();
    }
  }, [params.id, status, router]);

  async function fetchBooking() {
    try {
      const response = await fetch(`/api/bookings`);
      if (!response.ok) throw new Error("Failed to fetch booking");
      const data = await response.json();
      const foundBooking = data.data?.find((b: Booking) => b.id === params.id);
      if (!foundBooking) throw new Error("Booking not found");
      setBooking(foundBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }

  async function handlePesaPalPayment() {
    if (!booking) return;
    setPayingWithPesapal(true);

    try {
      const response = await fetch("/api/payments/pesapal/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      // Redirect to PesaPal checkout
      if (data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initiation failed");
      setPayingWithPesapal(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertDescription>{error || "Booking not found"}</AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tentImage = booking.tent.image || "/images/luxury-tent.jpg";
  const checkInDate = new Date(booking.checkIn).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  const isPaid = booking.paymentStatus === "PAID";
  const isCancelled = booking.status === "CANCELLED";
  const showPayButton = !isPaid && !isCancelled;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground font-medium mb-2">
            {isPaid ? "Booking Confirmed & Paid!" : "Booking Created!"}
          </h1>
          <p className="text-muted-foreground">
            {isPaid
              ? "Your reservation is fully confirmed and paid."
              : "Your reservation has been created. Please complete payment to confirm your booking."}
          </p>
        </div>

        {/* Payment CTA - shown prominently if unpaid */}
        {showPayButton && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">
                    Complete Your Payment
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pay securely via M-Pesa, Airtel Money, Visa, or Mastercard through PesaPal.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    onClick={handlePesaPalPayment}
                    disabled={payingWithPesapal}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base"
                    size="lg"
                  >
                    {payingWithPesapal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ${Number(booking.totalAmount).toLocaleString()}
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> M-Pesa
                    </span>
                    <span>Visa</span>
                    <span>Mastercard</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl">Booking Details</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Booking #{booking.bookingNumber || booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                {isPaid && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                    Paid
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={
                    booking.status === "CONFIRMED"
                      ? "bg-green-500/10 text-green-700 border-green-200"
                      : booking.status === "CANCELLED"
                        ? "bg-red-500/10 text-red-700 border-red-200"
                        : "bg-amber-500/10 text-amber-700 border-amber-200"
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tent Info */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-32 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0">
                <Image src={tentImage} alt={booking.tent.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg text-foreground font-medium mb-2">{booking.tent.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{checkInDate} - {checkOutDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {booking.adults} {booking.adults === 1 ? "Adult" : "Adults"}
                      {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? "Child" : "Children"}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Masai Mara, Kenya</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold text-foreground mb-4">Guest Information</h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="text-foreground font-medium">
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="text-foreground font-medium">{booking.guestInfo.email}</span>
                </div>
                {booking.guestInfo.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="text-foreground font-medium">{booking.guestInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add-ons */}
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-4">Selected Experiences</h4>
                <div className="space-y-2">
                  {booking.addOns.map((addOn, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-foreground">{addOn.name}</span>
                      <span className="text-foreground font-medium">
                        ${Number(addOn.price * addOn.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total Amount</span>
                <span className="text-2xl font-serif text-foreground font-medium">
                  ${Number(booking.totalAmount).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                For {nights} {nights === 1 ? "night" : "nights"} &middot; VAT included at checkout
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="rounded-full bg-transparent">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View My Bookings
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download Confirmation
          </Button>
        </div>

        {/* Help Section */}
        <Card className="mt-6 bg-secondary/50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your booking, please don&apos;t hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <a href="mailto:info@enchipaicamp.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@enchipaicamp.com</span>
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                <span>+254 700 000 000</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
