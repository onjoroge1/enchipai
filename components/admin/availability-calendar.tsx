"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";

interface Tent {
  id: string;
  name: string;
}

interface Booking {
  tentId: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export function AvailabilityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tents, setTents] = useState<Tent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailabilityData();
  }, [currentMonth]);

  async function fetchAvailabilityData() {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Fetch tents and bookings in parallel
      const [tentsResponse, bookingsResponse] = await Promise.all([
        fetch("/api/admin/tents"),
        fetch(`/api/admin/bookings?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
      ]);

      if (!tentsResponse.ok || !bookingsResponse.ok) {
        throw new Error("Failed to fetch availability data");
      }

      const tentsData = await tentsResponse.json();
      const bookingsData = await bookingsResponse.json();

      setTents(tentsData.data || tentsData.success?.data || []);
      setBookings(bookingsData.data?.bookings || bookingsData.data || []);
    } catch (err) {
      console.error("Availability fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate availability for each tent and day
  const getAvailability = (tentId: string, day: Date): boolean => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if any booking overlaps with this day
    const hasBooking = bookings.some((booking) => {
      if (booking.tentId !== tentId) return false;
      if (booking.status === "CANCELLED" || booking.status === "CHECKED_OUT") return false;

      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      return checkIn <= dayEnd && checkOut >= dayStart;
    });

    return !hasBooking;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-serif text-lg">Tent Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-serif text-lg">Tent Availability</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2 min-w-[100px] text-center">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tents available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tents.slice(0, 5).map((tent) => (
              <div key={tent.id} className="space-y-1">
                <p className="text-xs font-medium text-foreground truncate">{tent.name}</p>
                <div className="flex gap-0.5">
                  {days.map((day, i) => {
                    const available = getAvailability(tent.id, day);
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-6 rounded-sm ${
                          available
                            ? "bg-green-500/20 border border-green-500/30"
                            : "bg-red-500/20 border border-red-500/30"
                        }`}
                        title={`${format(day, "MMM d")} - ${available ? "Available" : "Booked"}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30" />
            <span className="text-xs text-muted-foreground">Booked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
