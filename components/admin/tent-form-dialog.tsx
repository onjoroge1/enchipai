"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TentStatus } from "@/lib/prisma-types";
import { TentImageGallery } from "./tent-image-gallery";

interface TentImage {
  id?: string;
  url: string;
  alt: string | null;
  order: number;
}

interface Tent {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  price: number;
  size: string | null;
  bed: string | null;
  guests: number;
  amenities: string[];
  featured: boolean;
  displayOrder: number;
  status: TentStatus;
  image: string | null;
  images?: TentImage[];
}

interface TentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tent: Tent | null;
  onSuccess: () => void;
}

export function TentFormDialog({ open, onOpenChange, tent, onSuccess }: TentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<TentImage[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    price: "",
    size: "",
    bed: "",
    guests: "2",
    amenities: "",
    featured: false,
    displayOrder: "0",
    status: "AVAILABLE" as TentStatus,
    image: "",
  });

  useEffect(() => {
    if (tent) {
      setFormData({
        name: tent.name,
        slug: tent.slug,
        tagline: tent.tagline || "",
        description: tent.description || "",
        price: tent.price.toString(),
        size: tent.size || "",
        bed: tent.bed || "",
        guests: tent.guests.toString(),
        amenities: tent.amenities?.join(", ") || "",
        featured: tent.featured,
        displayOrder: tent.displayOrder.toString(),
        status: tent.status,
        image: tent.image || "",
      });
      // Load images if tent has them
      if (tent.images && tent.images.length > 0) {
        setImages(tent.images);
      } else {
        setImages([]);
      }
    } else {
      // Reset form for new tent
      setFormData({
        name: "",
        slug: "",
        tagline: "",
        description: "",
        price: "",
        size: "",
        bed: "",
        guests: "2",
        amenities: "",
        featured: false,
        displayOrder: "0",
        status: "AVAILABLE",
        image: "",
      });
      setImages([]);
    }
  }, [tent, open]);

  // Fetch images when editing existing tent
  useEffect(() => {
    if (open && tent?.id) {
      fetchTentImages();
    }
  }, [open, tent?.id]);

  async function fetchTentImages() {
    if (!tent?.id) return;
    try {
      const response = await fetch(`/api/admin/tents/${tent.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data?.images) {
          setImages(data.data.images);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tent images:", err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        tagline: formData.tagline || undefined,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        size: formData.size || undefined,
        bed: formData.bed || undefined,
        guests: parseInt(formData.guests),
        amenities: formData.amenities
          ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
        featured: formData.featured,
        displayOrder: parseInt(formData.displayOrder),
        status: formData.status,
        image: formData.image || undefined,
      };

      const url = tent ? `/api/admin/tents/${tent.id}` : "/api/admin/tents";
      const method = tent ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save tent");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {tent ? "Edit Tent" : "Create New Tent"}
          </DialogTitle>
          <DialogDescription>
            {tent ? "Update tent details and settings" : "Add a new tent to the camp"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Short catchy description"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Night *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., 65 sqm"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Max Guests *</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bed">Bed Type</Label>
              <Input
                id="bed"
                value={formData.bed}
                onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
                placeholder="e.g., King Bed"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TentStatus })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="e.g., En-suite Bathroom, Private Deck, Solar Power"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Primary Image URL</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This will be used as the main image. You can add more images in the gallery below.
            </p>
          </div>

          {/* Image Gallery */}
          <TentImageGallery
            tentId={tent?.id || null}
            images={images}
            onImagesChange={setImages}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="featured">Featured Tent</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                disabled={loading}
              />
            </div>
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
                tent ? "Update Tent" : "Create Tent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

