"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Booking {
  id: string;
  bookingNumber: string | null;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  tent: {
    name: string;
  };
  user: {
    name: string | null;
    email: string;
  };
}

interface InvoiceGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InvoiceGenerateDialog({ open, onOpenChange, onSuccess }: InvoiceGenerateDialogProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bookingId: "",
    taxRate: 0.16, // 16% VAT for Kenya
    dueDate: "",
  });

  useEffect(() => {
    if (open) {
      fetchBookings();
    }
  }, [open]);

  async function fetchBookings() {
    try {
      setFetching(true);
      const response = await fetch("/api/admin/bookings?status=CONFIRMED&limit=100");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      
      // Filter bookings without invoices
      const bookingsWithInvoices = await Promise.all(
        (data.data?.bookings || []).map(async (booking: Booking) => {
          const invoiceCheck = await fetch(`/api/admin/invoices?search=${booking.id}`);
          const invoiceData = await invoiceCheck.json();
          return {
            booking,
            hasInvoice: invoiceData.data?.invoices?.some((inv: any) => inv.bookingId === booking.id),
          };
        })
      );
      
      setBookings(bookingsWithInvoices.filter((b: any) => !b.hasInvoice).map((b: any) => b.booking));
    } catch (err) {
      console.error("Bookings fetch error:", err);
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        bookingId: formData.bookingId,
        taxRate: formData.taxRate,
      };

      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString();
      }

      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate invoice");
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        bookingId: "",
        taxRate: 0.16,
        dueDate: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const selectedBooking = bookings.find((b) => b.id === formData.bookingId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Generate Invoice</DialogTitle>
          <DialogDescription>Create an invoice for a booking</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">Booking *</Label>
              <Select
                value={formData.bookingId}
                onValueChange={(value) => setFormData({ ...formData, bookingId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.bookingNumber || booking.id.slice(0, 8)} - {booking.tent.name} -{" "}
                      {booking.user.name || booking.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBooking && (
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tent:</span>
                  <span className="text-foreground font-medium">{selectedBooking.tent.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Guest:</span>
                  <span className="text-foreground font-medium">
                    {selectedBooking.user.name || selectedBooking.user.email}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground font-medium">
                    ${Number(selectedBooking.totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({formData.taxRate * 100}%):</span>
                  <span className="text-foreground font-medium">
                    ${(Number(selectedBooking.totalAmount) * formData.taxRate).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-foreground font-semibold">Total:</span>
                  <span className="text-foreground font-semibold">
                    $
                    {(
                      Number(selectedBooking.totalAmount) * (1 + formData.taxRate)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate * 100}
                  onChange={(e) =>
                    setFormData({ ...formData, taxRate: parseFloat(e.target.value) / 100 })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.bookingId}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Invoice"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

