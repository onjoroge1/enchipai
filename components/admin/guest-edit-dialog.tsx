"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface GuestEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string | null;
  onSuccess: () => void;
}

export function GuestEditDialog({ open, onOpenChange, guestId, onSuccess }: GuestEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
    preferenceNotes: "",
  });

  useEffect(() => {
    if (open && guestId) {
      fetchGuest();
    } else {
      setFormData({ name: "", email: "", phone: "", image: "", preferenceNotes: "" });
      setError(null);
    }
  }, [open, guestId]);

  async function fetchGuest() {
    if (!guestId) return;

    try {
      setFetching(true);
      const response = await fetch(`/api/admin/guests/${guestId}`);
      if (!response.ok) throw new Error("Failed to fetch guest");
      const data = await response.json();
      setFormData({
        name: data.data.name || "",
        email: data.data.email || "",
        phone: data.data.phone || "",
        image: data.data.image || "",
        preferenceNotes: data.data.preferences?.notes || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guest");
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestId) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/guests/${guestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update guest");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Guest</DialogTitle>
          <DialogDescription>Update guest information</DialogDescription>
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                disabled={loading}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferenceNotes">Guest Notes</Label>
              <Textarea
                id="preferenceNotes"
                value={formData.preferenceNotes}
                onChange={(e) => setFormData({ ...formData, preferenceNotes: e.target.value })}
                disabled={loading}
                placeholder="Add any notes or preferences about this guest..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                These notes are visible to admin staff and can include dietary preferences, special requests, or other important information.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Guest"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

