"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TransferType, TransferStatus } from "@/lib/prisma-types";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Transfer {
  id: string;
  type: TransferType;
  from: string;
  to: string;
  date: string;
  time: string | null;
  vehicle: string | null;
  driver: string | null;
  guests: string | null;
  status: TransferStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TransferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  onSuccess: () => void;
}

export function TransferFormDialog({ open, onOpenChange, transfer, onSuccess }: TransferFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    type: TransferType.AIRPORT_PICKUP,
    from: "",
    to: "",
    date: "",
    time: "",
    vehicle: "",
    driver: "",
    guests: "",
    status: TransferStatus.SCHEDULED,
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      if (transfer) {
        const transferDate = new Date(transfer.date);
        setFormData({
          type: transfer.type,
          from: transfer.from,
          to: transfer.to,
          date: transferDate.toISOString().split("T")[0],
          time: transfer.time || "",
          vehicle: transfer.vehicle || "",
          driver: transfer.driver || "",
          guests: transfer.guests || "",
          status: transfer.status,
          notes: transfer.notes || "",
        });
      } else {
        setFormData({
          type: TransferType.AIRPORT_PICKUP,
          from: "",
          to: "",
          date: "",
          time: "",
          vehicle: "",
          driver: "",
          guests: "",
          status: TransferStatus.SCHEDULED,
          notes: "",
        });
      }
      setError(null);
    }
  }, [open, transfer]);

  async function fetchUsers() {
    try {
      setFetching(true);
      const response = await fetch("/api/admin/guests?limit=100");
      if (!response.ok) throw new Error("Failed to fetch guests");
      const data = await response.json();
      setUsers(data.data?.guests || data.data || []);
    } catch (err) {
      console.error("Users fetch error:", err);
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.from || !formData.to || !formData.date) {
        throw new Error("Please fill in all required fields");
      }

      // Combine date and time into ISO datetime string
      const dateTime = formData.time
        ? new Date(`${formData.date}T${formData.time}`)
        : new Date(`${formData.date}T12:00:00`);

      const payload = {
        type: formData.type,
        from: formData.from,
        to: formData.to,
        date: dateTime.toISOString(),
        time: formData.time || undefined,
        vehicle: formData.vehicle || undefined,
        driver: formData.driver || undefined,
        guests: formData.guests || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      const url = transfer ? `/api/admin/transfers/${transfer.id}` : "/api/admin/transfers";
      const method = transfer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save transfer");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {transfer ? "Edit Transfer" : "Schedule New Transfer"}
          </DialogTitle>
          <DialogDescription>
            {transfer ? "Update transfer details" : "Create a new transfer booking"}
          </DialogDescription>
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transfer Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as TransferType })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransferType.AIRPORT_PICKUP}>Airport Pickup</SelectItem>
                    <SelectItem value={TransferType.AIRPORT_DROPOFF}>Airport Dropoff</SelectItem>
                    <SelectItem value={TransferType.GAME_DRIVE}>Game Drive</SelectItem>
                    <SelectItem value={TransferType.EXCURSION}>Excursion</SelectItem>
                    <SelectItem value={TransferType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as TransferStatus })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransferStatus.SCHEDULED}>Scheduled</SelectItem>
                    <SelectItem value={TransferStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TransferStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={TransferStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From *</Label>
                <Input
                  id="from"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  placeholder="e.g., Wilson Airport, Nairobi"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="e.g., Enchipai Camp"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Input
                  id="vehicle"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  placeholder="e.g., Land Cruiser #1"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">Driver</Label>
                <Input
                  id="driver"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  placeholder="e.g., Joseph Mutua"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                placeholder="Guest names or count"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                disabled={loading}
                placeholder="Additional notes or special instructions..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  transfer ? "Update Transfer" : "Schedule Transfer"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

