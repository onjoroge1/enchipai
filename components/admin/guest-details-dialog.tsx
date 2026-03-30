"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, Calendar, DollarSign, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface GuestBooking {
  id: string;
  bookingNumber: string | null;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  tent: {
    id: string;
    name: string;
    slug: string;
  };
  guestInfo: {
    nationality: string | null;
  } | null;
}

interface GuestPreference {
  id: string;
  preferences: any;
  notes: string | null;
}

interface GuestDetails {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  bookings: GuestBooking[];
  preferences: GuestPreference | null;
}

interface GuestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string | null;
}

export function GuestDetailsDialog({ open, onOpenChange, guestId }: GuestDetailsDialogProps) {
  const [guest, setGuest] = useState<GuestDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && guestId) {
      fetchGuestDetails();
    } else {
      setGuest(null);
      setError(null);
    }
  }, [open, guestId]);

  async function fetchGuestDetails() {
    if (!guestId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/guests/${guestId}`);
      if (!response.ok) throw new Error("Failed to fetch guest details");
      const data = await response.json();
      setGuest(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guest details");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const totalSpent = guest?.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;
  const visitCount = guest?.bookings.length || 0;
  const lastVisit = guest?.bookings[0]?.createdAt
    ? format(new Date(guest.bookings[0].createdAt), "MMM d, yyyy")
    : "Never";

  // Get country from most recent booking's guestInfo
  const country = guest?.bookings[0]?.guestInfo?.nationality || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Guest Profile</DialogTitle>
          <DialogDescription>View complete guest information and history</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : guest ? (
          <div className="space-y-6">
            {/* Guest Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-lg">{guest.name || "Guest"}</h3>
                <p className="text-sm text-muted-foreground">
                  Member since {format(new Date(guest.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex gap-2">
                {visitCount >= 3 && (
                  <Badge className="bg-accent text-accent-foreground">VIP</Badge>
                )}
                {visitCount >= 2 && visitCount < 3 && (
                  <Badge className="bg-blue-100 text-blue-700">Returning</Badge>
                )}
                {visitCount < 2 && (
                  <Badge className="bg-green-100 text-green-700">New</Badge>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Contact Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 bg-secondary rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{guest.email}</p>
                  </div>
                </div>
                {guest.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{guest.phone}</p>
                    </div>
                  </div>
                )}
                {country && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Country</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Visits</p>
                </div>
                <p className="text-2xl font-semibold">{visitCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Last: {lastVisit}</p>
              </div>
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
                <p className="text-2xl font-semibold">${totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: ${visitCount > 0 ? (totalSpent / visitCount).toLocaleString() : '0'}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
                <p className="text-2xl font-semibold">
                  {visitCount >= 3 ? "VIP" : visitCount >= 2 ? "Returning" : "New"}
                </p>
              </div>
            </div>

            {/* Booking History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Booking History</h4>
                <Link href={`/admin/bookings?search=${encodeURIComponent(guest.email)}`}>
                  <Button variant="outline" size="sm">
                    View All Bookings
                  </Button>
                </Link>
              </div>
              {guest.bookings.length === 0 ? (
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guest.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-secondary rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {booking.bookingNumber || `#${booking.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.tent.name} • {format(new Date(booking.checkIn), "MMM d")} -{" "}
                          {format(new Date(booking.checkOut), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${Number(booking.totalAmount).toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preferences */}
            {guest.preferences && (
              <div className="space-y-3">
                <h4 className="font-semibold">Preferences & Notes</h4>
                <div className="bg-secondary rounded-lg p-4">
                  {guest.preferences.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{guest.preferences.notes}</p>
                    </div>
                  )}
                  {guest.preferences.preferences && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Preferences</p>
                      <pre className="text-xs bg-background p-2 rounded overflow-auto">
                        {JSON.stringify(guest.preferences.preferences, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

