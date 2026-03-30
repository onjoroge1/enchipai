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

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Tent {
  id: string;
  name: string;
  price: number;
}

interface BookingCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BookingCreateDialog({ open, onOpenChange, onSuccess }: BookingCreateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    tentId: "",
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0",
    specialRequests: "",
  });
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    age: "",
    travelPurpose: "",
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchTents();
    }
  }, [open]);

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

  async function fetchTents() {
    try {
      const response = await fetch("/api/admin/tents");
      if (!response.ok) throw new Error("Failed to fetch tents");
      const data = await response.json();
      setTents(data.data || []);
    } catch (err) {
      console.error("Tents fetch error:", err);
    }
  }

  const handleUserChange = (userId: string) => {
    setFormData({ ...formData, userId });
    const user = users.find((u) => u.id === userId);
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      setGuestInfo({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email,
        phone: "",
        nationality: "",
        age: "",
        travelPurpose: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.userId || !formData.tentId || !formData.checkIn || !formData.checkOut) {
        throw new Error("Please fill in all required fields");
      }

      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
        throw new Error("Please fill in guest information");
      }

      // Check availability
      const availabilityResponse = await fetch(
        `/api/tents/availability?tentId=${formData.tentId}&checkIn=${formData.checkIn}&checkOut=${formData.checkOut}`
      );
      const availabilityData = await availabilityResponse.json();

      if (!availabilityData.data?.available) {
        throw new Error("Tent is not available for the selected dates");
      }

      const payload = {
        tentId: formData.tentId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        specialRequests: formData.specialRequests || undefined,
        guestInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone || undefined,
          nationality: guestInfo.nationality || undefined,
          age: guestInfo.age ? parseInt(guestInfo.age) : undefined,
          travelPurpose: guestInfo.travelPurpose || undefined,
        },
      };

      // Use admin booking API endpoint
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          userId: formData.userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        userId: "",
        tentId: "",
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",
        specialRequests: "",
      });
      setGuestInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationality: "",
        age: "",
        travelPurpose: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const selectedTent = tents.find((t) => t.id === formData.tentId);
  const nights = formData.checkIn && formData.checkOut
    ? Math.ceil(
        (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  const tentTotal = selectedTent && nights > 0 ? Number(selectedTent.price) * nights : 0;
  const totalAmount = tentTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Create New Booking</DialogTitle>
          <DialogDescription>Create a booking for a guest</DialogDescription>
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
              <Label htmlFor="userId">Guest *</Label>
              <Select
                value={formData.userId}
                onValueChange={handleUserChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email} {user.name && `(${user.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tentId">Tent *</Label>
                <Select
                  value={formData.tentId}
                  onValueChange={(value) => setFormData({ ...formData, tentId: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tent" />
                  </SelectTrigger>
                  <SelectContent>
                    {tents.map((tent) => (
                      <SelectItem key={tent.id} value={tent.id}>
                        {tent.name} - ${Number(tent.price).toLocaleString()}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price per Night</Label>
                <Input
                  value={selectedTent ? `$${Number(selectedTent.price).toLocaleString()}` : "N/A"}
                  disabled
                  className="bg-secondary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Date *</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Date *</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  min={formData.checkIn || new Date().toISOString().split("T")[0]}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Nights:</span>
                  <span className="text-foreground font-medium">{nights}</span>
                </div>
                {selectedTent && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tent ({nights} nights):</span>
                    <span className="text-foreground font-medium">
                      ${tentTotal.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-foreground font-semibold">Total:</span>
                  <span className="text-foreground font-semibold">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Adults *</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Guest First Name *</Label>
              <Input
                id="firstName"
                value={guestInfo.firstName}
                onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Guest Last Name *</Label>
              <Input
                id="lastName"
                value={guestInfo.lastName}
                onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={guestInfo.nationality}
                  onChange={(e) => setGuestInfo({ ...guestInfo, nationality: e.target.value })}
                  disabled={loading}
                  placeholder="e.g., United States"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={guestInfo.age}
                  onChange={(e) => setGuestInfo({ ...guestInfo, age: e.target.value })}
                  disabled={loading}
                  placeholder="e.g., 35"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelPurpose">Travel Purpose</Label>
              <Select
                value={guestInfo.travelPurpose}
                onValueChange={(value) => setGuestInfo({ ...guestInfo, travelPurpose: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select travel purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Honeymoon">Honeymoon</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={3}
                disabled={loading}
                placeholder="Any special requests or notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.userId || !formData.tentId || !formData.checkIn || !formData.checkOut}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Booking"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

