"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, getDaysInMonth } from "date-fns";
import { GuestDetailsDialog } from "./guest-details-dialog";

interface Tent {
  id: string;
  name: string;
  status: string;
}

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TentBooking {
  tentId: string;
  tentName: string;
  bookings: Booking[];
}

function getDayStatus(
  tentId: string,
  day: Date,
  tentBookings: TentBooking[]
): { booked: boolean; guest?: string; isStart?: boolean; isEnd?: boolean; status?: string; userId?: string; bookingId?: string } {
  const tentData = tentBookings.find((tb) => tb.tentId === tentId);
  if (!tentData) return { booked: false };

  // Normalize day to start of day for comparison (remove time component)
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());

  for (const booking of tentData.bookings) {
    const checkIn = new Date(booking.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(booking.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    
    // Check if day falls within booking range (inclusive)
    // A day is booked if it's >= checkIn and <= checkOut
    if (dayStart >= checkIn && dayStart <= checkOut) {
      const dayStr = format(dayStart, "yyyy-MM-dd");
      const checkInStr = format(checkIn, "yyyy-MM-dd");
      const checkOutStr = format(checkOut, "yyyy-MM-dd");
      const isStart = dayStr === checkInStr;
      const isEnd = dayStr === checkOutStr;
      
      return {
        booked: true,
        guest: booking.user?.name || booking.user?.email?.split("@")[0] || "Guest",
        isStart,
        isEnd,
        status: booking.status,
        userId: booking.userId || booking.user?.id,
        bookingId: booking.id,
      };
    }
  }
  return { booked: false };
}

export function TentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tents, setTents] = useState<Tent[]>([]);
  const [tentBookings, setTentBookings] = useState<TentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingGuestId, setViewingGuestId] = useState<string | null>(null);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch tents
      const tentsResponse = await fetch("/api/admin/tents");
      if (!tentsResponse.ok) throw new Error("Failed to fetch tents");
      const tentsData = await tentsResponse.json();
      setTents(tentsData.data || []);

      // Calculate date range for bookings
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Fetch bookings for this month
      // Expand date range to include bookings that start before or end after the month
      const extendedStart = subMonths(monthStart, 1);
      const extendedEnd = addMonths(monthEnd, 1);
      
      const bookingsResponse = await fetch(
        `/api/admin/bookings?startDate=${format(extendedStart, "yyyy-MM-dd")}&endDate=${format(extendedEnd, "yyyy-MM-dd")}`
      );
      if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
      const bookingsData = await bookingsResponse.json();
      // API returns { success: true, data: { bookings: [...], total, ... } }
      const bookings = bookingsData.data?.bookings || [];

      // Group bookings by tent
      const bookingsByTent: TentBooking[] = tentsData.data.map((tent: Tent) => {
        const tentBookings = bookings.filter(
          (b: any) => (b.tent?.id === tent.id || b.tentId === tent.id) && b.status !== "CANCELLED"
        );
        return {
          tentId: tent.id,
          tentName: tent.name,
          bookings: tentBookings.map((b: any) => ({
            id: b.id,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            status: b.status,
            userId: b.userId || b.user?.id,
            user: b.user || { id: "", name: null, email: "Unknown" },
          })),
        };
      });

      setTentBookings(bookingsByTent);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">Availability Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-3 min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="flex border-b border-border pb-2 mb-2">
              <div className="w-36 flex-shrink-0 text-sm font-medium text-muted-foreground">Tent</div>
              <div className="flex-1 flex">
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="flex-1 text-center text-xs text-muted-foreground min-w-[24px]"
                  >
                    {format(day, "d")}
                  </div>
                ))}
              </div>
            </div>

            {/* Tent Rows */}
            {tents.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tents found
              </div>
            ) : (
              tents.map((tent) => (
                <div
                  key={tent.id}
                  className="flex items-center py-2 border-b border-border/50 last:border-0"
                >
                  <div className="w-36 flex-shrink-0 text-sm font-medium text-foreground truncate pr-2">
                    {tent.name}
                  </div>
                  <div className="flex-1 flex">
                    {days.map((day) => {
                      const status = getDayStatus(tent.id, day, tentBookings);
                      const isMaintenance = tent.status === "MAINTENANCE";
                      const isUnavailable = tent.status === "UNAVAILABLE";
                      const isBooked = status.booked && status.status !== "CANCELLED";
                      
                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => {
                            if (isBooked && status.userId) {
                              setViewingGuestId(status.userId);
                              setIsGuestDialogOpen(true);
                            }
                          }}
                          className={cn(
                            "flex-1 h-8 min-w-[24px] flex items-center justify-center text-xs",
                            isMaintenance
                              ? "bg-orange-200"
                              : isUnavailable
                              ? "bg-red-100"
                              : status.booked
                              ? status.status === "MAINTENANCE" || status.status === "CANCELLED"
                                ? "bg-gray-200"
                                : "bg-primary/20"
                              : "bg-green-100",
                            status.isStart && "rounded-l-md",
                            status.isEnd && "rounded-r-md",
                            isBooked && status.userId && "cursor-pointer hover:bg-primary/30 transition-colors"
                          )}
                          title={isBooked && status.userId ? `Click to view ${status.guest}'s profile` : undefined}
                        >
                          {status.isStart && status.guest && (
                            <span className="text-[10px] font-medium text-foreground truncate px-1">
                              {status.guest.substring(0, 8)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20" />
            <span className="text-xs text-muted-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-200" />
            <span className="text-xs text-muted-foreground">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100" />
            <span className="text-xs text-muted-foreground">Unavailable</span>
          </div>
        </div>
      </CardContent>

      <GuestDetailsDialog
        open={isGuestDialogOpen}
        onOpenChange={setIsGuestDialogOpen}
        guestId={viewingGuestId}
      />
    </Card>
  );
}
