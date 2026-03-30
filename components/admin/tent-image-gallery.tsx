"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TentImage {
  id?: string;
  url: string;
  alt: string | null;
  order: number;
}

interface TentImageGalleryProps {
  tentId: string | null;
  images: TentImage[];
  onImagesChange: (images: TentImage[]) => void;
}

export function TentImageGallery({ tentId, images, onImagesChange }: TentImageGalleryProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    if (!tentId) {
      // For new tents, just add to local state
      const newImage: TentImage = {
        url: newImageUrl.trim(),
        alt: newImageAlt.trim() || null,
        order: images.length,
      };
      onImagesChange([...images, newImage]);
      setNewImageUrl("");
      setNewImageAlt("");
      setError(null);
      return;
    }

    // For existing tents, save to database
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/admin/tents/${tentId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newImageUrl.trim(),
          alt: newImageAlt.trim() || null,
          order: images.length,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add image");
      }

      const data = await response.json();
      onImagesChange([...images, data.data]);
      setNewImageUrl("");
      setNewImageAlt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add image");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async (imageId: string | undefined, index: number) => {
    if (!imageId) {
      // Remove from local state for new tents
      const newImages = images.filter((_, i) => i !== index);
      // Reorder
      const reordered = newImages.map((img, i) => ({ ...img, order: i }));
      onImagesChange(reordered);
      return;
    }

    if (!tentId) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/tents/${tentId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      const newImages = images.filter((img) => img.id !== imageId);
      const reordered = newImages.map((img, i) => ({ ...img, order: i }));
      onImagesChange(reordered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveImage = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

    // Update order values
    const reordered = newImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reordered);

    // If tent exists, update in database
    if (tentId && images[index].id) {
      try {
        await fetch(`/api/admin/tents/${tentId}/images/${images[index].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: reordered[index].order }),
        });
      } catch (err) {
        console.error("Failed to update image order:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Image Gallery</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Add multiple images to showcase your tent. The first image will be used as the primary image.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add New Image */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageAlt">Alt Text (optional)</Label>
          <Input
            id="imageAlt"
            placeholder="Describe the image"
            value={newImageAlt}
            onChange={(e) => setNewImageAlt(e.target.value)}
            disabled={saving}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImage();
              }
            }}
          />
        </div>
      </div>
      <Button
        type="button"
        onClick={handleAddImage}
        disabled={saving || !newImageUrl.trim()}
        size="sm"
        variant="outline"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Add Image
      </Button>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Gallery Images ({images.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <Card key={image.id || index} className="relative overflow-hidden">
                <div className="relative aspect-video">
                  <Image
                    src={image.url}
                    alt={image.alt || `Tent image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {image.alt || `Image ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Order: {image.order}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveImage(index, "up")}
                        disabled={index === 0 || saving}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveImage(index, "down")}
                        disabled={index === images.length - 1 || saving}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveImage(image.id, index)}
                        disabled={saving}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No images added yet</p>
        </div>
      )}
    </div>
  );
}

