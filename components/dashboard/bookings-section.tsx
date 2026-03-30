"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingStatus } from "@/lib/prisma-types";

interface Booking {
  id: string;
  tent: {
    name: string;
    image: string | null;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  totalAmount: number;
}

export function BookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This action may be subject to our cancellation policy.")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) throw new Error("Failed to cancel booking");

      // Update the local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" as BookingStatus } : b))
      );
    } catch (err) {
      alert("Failed to cancel booking. Please try again or contact support.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusMap: Record<BookingStatus, { label: string; variant: "default" | "secondary"; className: string }> = {
      PENDING: { label: "Pending", variant: "default", className: "bg-accent text-accent-foreground" },
      CONFIRMED: { label: "Confirmed", variant: "default", className: "bg-green-500/10 text-green-700 border-green-200" },
      CHECKED_IN: { label: "Checked In", variant: "default", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
      CHECKED_OUT: { label: "Completed", variant: "secondary", className: "" },
      CANCELLED: { label: "Cancelled", variant: "secondary", className: "bg-red-500/10 text-red-700 border-red-200" },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  if (loading) {
    return (
      <Card id="bookings">
        <CardHeader>
          <CardTitle className="font-serif text-xl">My Bookings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card id="bookings">
        <CardHeader>
          <CardTitle className="font-serif text-xl">My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p>{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBookings();
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card id="bookings">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No bookings yet. Start exploring our tents!
            </p>
            <Link href="/tents">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                Browse Tents
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="bookings">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif text-xl">My Bookings</CardTitle>
        <Link href="/tents/book">
          <Button variant="ghost" size="sm" className="text-primary">
            New Booking <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.slice(0, 5).map((booking) => {
          const statusInfo = getStatusBadge(booking.status);
          const imageUrl = booking.tent.image || "/images/luxury-tent.jpg";
          const isCancellable = booking.status === "PENDING" || booking.status === "CONFIRMED";

          return (
            <div
              key={booking.id}
              className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div
                className="w-full sm:w-32 h-24 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{booking.tent.name}</h3>
                  <Badge variant={statusInfo.variant} className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Masai Mara
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  ${Number(booking.totalAmount).toLocaleString()}
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                <Link href={`/bookings/${booking.id}/confirmation`}>
                  <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                    View Details
                  </Button>
                </Link>
                {isCancellable && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {bookings.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Showing 5 of {bookings.length} bookings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
