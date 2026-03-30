"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Experience {
  id: string;
  name: string;
  price: number;
  capacity: number | null;
}

interface ExperienceBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExperienceBookingDialog({ open, onOpenChange, onSuccess }: ExperienceBookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    experienceId: "",
    date: "",
    time: "",
    participants: "1",
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchExperiences();
    } else {
      setFormData({
        userId: "",
        experienceId: "",
        date: "",
        time: "",
        participants: "1",
      });
      setError(null);
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

  async function fetchExperiences() {
    try {
      const response = await fetch("/api/admin/experiences?available=true");
      if (!response.ok) throw new Error("Failed to fetch experiences");
      const data = await response.json();
      setExperiences(data.data?.experiences || []);
    } catch (err) {
      console.error("Experiences fetch error:", err);
    }
  }

  const selectedUser = users.find((u) => u.id === formData.userId);
  const selectedExperience = experiences.find((e) => e.id === formData.experienceId);
  const totalAmount = selectedExperience && formData.participants
    ? Number(selectedExperience.price) * parseInt(formData.participants)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.userId || !formData.experienceId || !formData.date || !formData.time) {
        throw new Error("Please fill in all required fields");
      }

      // Combine date and time into ISO datetime string
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const isoDateTime = dateTime.toISOString();

      const payload = {
        experienceId: formData.experienceId,
        guestName: selectedUser?.name || selectedUser?.email || "Guest",
        guestEmail: selectedUser?.email || "",
        date: isoDateTime,
        participants: parseInt(formData.participants),
        totalAmount: totalAmount,
      };

      const response = await fetch("/api/admin/experiences/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Book Experience for Guest</DialogTitle>
          <DialogDescription>Create a new experience booking</DialogDescription>
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
              <Label htmlFor="userId">Select Guest *</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => setFormData({ ...formData, userId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a guest" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => {
                    const displayText = user.name ? `${user.name} (${user.email})` : user.email;
                    return (
                      <SelectItem key={user.id} value={user.id}>
                        {displayText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceId">Select Experience *</Label>
              <Select
                value={formData.experienceId}
                onValueChange={(value) => setFormData({ ...formData, experienceId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an experience" />
                </SelectTrigger>
                <SelectContent>
                  {experiences.map((exp) => {
                    const displayText = `${exp.name} - $${Number(exp.price).toLocaleString()}/person${exp.capacity ? ` (Max ${exp.capacity})` : ''}`;
                    return (
                      <SelectItem key={exp.id} value={exp.id}>
                        {displayText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Number of Participants *</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max={selectedExperience?.capacity || undefined}
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                disabled={loading}
                required
              />
              {selectedExperience?.capacity && (
                <p className="text-xs text-muted-foreground">
                  Maximum capacity: {selectedExperience.capacity} participants
                </p>
              )}
            </div>

            {totalAmount > 0 && (
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold text-foreground">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.participants} participant{parseInt(formData.participants) !== 1 ? "s" : ""} × ${Number(selectedExperience?.price).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.userId || !formData.experienceId || !formData.date || !formData.time}>
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
