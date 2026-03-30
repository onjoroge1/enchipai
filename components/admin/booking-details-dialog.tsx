"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, User, BedDouble, DollarSign, Mail, Phone } from "lucide-react";
import { BookingStatus, BookingPaymentStatus } from "@/lib/prisma-types";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  bookingNumber: string | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  specialRequests: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  tent: {
    id: string;
    name: string;
    price: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    nationality: string | null;
    passportNumber: string | null;
    dietaryRequirements: string | null;
    medicalInfo: string | null;
    emergencyContact: string | null;
  } | null;
  addOns: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    quantity: number;
  }>;
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    status: string;
  } | null;
}

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
}

const statusStyles: Record<BookingStatus, string> = {
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-200",
  PENDING: "bg-accent/20 text-primary border-accent",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
  CHECKED_IN: "bg-blue-500/10 text-blue-700 border-blue-200",
  CHECKED_OUT: "bg-gray-500/10 text-gray-700 border-gray-200",
};

const paymentStatusStyles: Record<BookingPaymentStatus, string> = {
  PAID: "bg-green-500/10 text-green-700 border-green-200",
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  PARTIAL: "bg-blue-500/10 text-blue-700 border-blue-200",
  REFUNDED: "bg-gray-500/10 text-gray-700 border-gray-200",
  FAILED: "bg-red-500/10 text-red-700 border-red-200",
};

export function BookingDetailsDialog({ open, onOpenChange, bookingId }: BookingDetailsDialogProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && bookingId) {
      fetchBookingDetails();
    } else {
      setBooking(null);
      setError(null);
    }
  }, [open, bookingId]);

  async function fetchBookingDetails() {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) throw new Error("Failed to fetch booking details");
      const data = await response.json();
      setBooking(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const nights = booking
    ? Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Booking Details</DialogTitle>
          <DialogDescription>View complete booking information</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : booking ? (
          <div className="space-y-6">
            {/* Booking Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-lg">
                  {booking.bookingNumber || `#${booking.id.slice(0, 8).toUpperCase()}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Created {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={statusStyles[booking.status]}>
                  {booking.status.replace("_", " ")}
                </Badge>
                <Badge className={paymentStatusStyles[booking.paymentStatus]}>
                  {booking.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Guest Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Guest Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 bg-secondary rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account</p>
                  <p className="font-medium">{booking.user.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                </div>
                {booking.guestInfo && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Guest Name</p>
                      <p className="font-medium">
                        {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="font-medium">{booking.guestInfo.email}</p>
                    </div>
                    {booking.guestInfo.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <p className="font-medium">{booking.guestInfo.phone}</p>
                      </div>
                    )}
                    {booking.guestInfo.nationality && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nationality</p>
                        <p className="font-medium">{booking.guestInfo.nationality}</p>
                      </div>
                    )}
                    {booking.guestInfo.dietaryRequirements && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Dietary Requirements</p>
                        <p className="font-medium">{booking.guestInfo.dietaryRequirements}</p>
                      </div>
                    )}
                    {booking.guestInfo.medicalInfo && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Medical Info</p>
                        <p className="font-medium">{booking.guestInfo.medicalInfo}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Booking Details
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 bg-secondary rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tent</p>
                  <p className="font-medium">{booking.tent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-in</p>
                  <p className="font-medium">{format(new Date(booking.checkIn), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-out</p>
                  <p className="font-medium">{format(new Date(booking.checkOut), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{nights} night{nights !== 1 ? "s" : ""}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Guests</p>
                  <p className="font-medium">
                    {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                    {booking.children > 0 && `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-semibold text-lg">
                    ${Number(booking.totalAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Add-ons</h4>
                <div className="bg-secondary rounded-lg p-4 space-y-2">
                  {booking.addOns.map((addOn) => (
                    <div key={addOn.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{addOn.name}</p>
                        {addOn.description && (
                          <p className="text-sm text-muted-foreground">{addOn.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {addOn.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${(Number(addOn.price) * addOn.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="space-y-3">
                <h4 className="font-semibold">Special Requests</h4>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm">{booking.specialRequests}</p>
                </div>
              </div>
            )}

            {/* Invoice */}
            {booking.invoice && (
              <div className="space-y-3">
                <h4 className="font-semibold">Invoice</h4>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{booking.invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">Status: {booking.invoice.status}</p>
                    </div>
                    <p className="font-semibold">
                      ${Number(booking.invoice.total).toLocaleString()}
                    </p>
                  </div>
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

