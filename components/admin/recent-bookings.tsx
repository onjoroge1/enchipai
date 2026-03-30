"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, BedDouble } from "lucide-react";
import Link from "next/link";
import { BookingStatus } from "@/lib/prisma-types";

interface RecentBooking {
  id: string;
  bookingNumber: string | null;
  user: {
    name: string | null;
    email: string;
  };
  tent: {
    name: string;
  };
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: BookingStatus;
}

const statusStyles: Record<BookingStatus, string> = {
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-200",
  PENDING: "bg-accent/20 text-primary border-accent",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
  CHECKED_IN: "bg-blue-500/10 text-blue-700 border-blue-200",
  CHECKED_OUT: "bg-gray-500/10 text-gray-700 border-gray-200",
};

export function RecentBookings() {
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentBookings() {
      try {
        const response = await fetch("/api/admin/bookings?limit=5");
        if (!response.ok) throw new Error("Failed to fetch bookings");
        
        const data = await response.json();
        if (data.success) {
          setBookings(data.data.bookings || data.data || []);
        }
      } catch (error) {
        console.error("Error fetching recent bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentBookings();
  }, []);

  if (loading) {
    return (
      <Card id="bookings">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading bookings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="bookings">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Bookings</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Latest reservations and bookings
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/bookings">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {booking.bookingNumber || `#${booking.id.slice(0, 8)}`}
                      </span>
                    </div>
                    <Badge className={statusStyles[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{booking.user.name || booking.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4" />
                      <span>{booking.tent.name}</span>
                    </div>
                    <div>
                      {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${Number(booking.totalAmount).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

