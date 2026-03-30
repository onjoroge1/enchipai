"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, DollarSign, Users, MapPin, Bed, Star, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { TentStatus } from "@/lib/prisma-types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TentImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

interface Booking {
  id: string;
  bookingNumber: string | null;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TentDetails {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image: string | null;
  price: number;
  size: string | null;
  bed: string | null;
  guests: number;
  amenities: string[];
  featured: boolean;
  displayOrder: number;
  status: TentStatus;
  rating: number | null;
  reviews: number;
  createdAt: string;
  updatedAt: string;
  images: TentImage[];
  bookings: Booking[];
}

interface TentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tentId: string | null;
}

const statusColors: Record<TentStatus, string> = {
  OCCUPIED: "bg-blue-100 text-blue-700",
  AVAILABLE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  UNAVAILABLE: "bg-red-100 text-red-700",
};

export function TentDetailsDialog({ open, onOpenChange, tentId }: TentDetailsDialogProps) {
  const [tent, setTent] = useState<TentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tentId) {
      fetchTentDetails();
    } else {
      setTent(null);
      setError(null);
    }
  }, [open, tentId]);

  async function fetchTentDetails() {
    if (!tentId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/tents/${tentId}`);
      if (!response.ok) throw new Error("Failed to fetch tent details");
      const data = await response.json();
      setTent(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tent details");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const totalRevenue = tent?.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;
  const activeBookings = tent?.bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN"
  ) || [];
  const upcomingBookings = tent?.bookings.filter(
    (b) => new Date(b.checkIn) > new Date() && b.status === "PENDING" || b.status === "CONFIRMED"
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Tent Details</DialogTitle>
          <DialogDescription>Complete information about this tent</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : tent ? (
          <div className="space-y-6">
            {/* Header with Image */}
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={tent.image || tent.images[0]?.url || "/images/luxury-tent.jpg"}
                alt={tent.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={statusColors[tent.status] || statusColors.AVAILABLE}>
                  {tent.status}
                </Badge>
                {tent.featured && (
                  <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-serif text-xl mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{tent.name}</p>
                    </div>
                    {tent.tagline && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tagline</p>
                        <p className="font-medium">{tent.tagline}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Slug</p>
                      <p className="font-mono text-sm">{tent.slug}</p>
                    </div>
                    {tent.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{tent.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-serif text-xl mb-4">Specifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price per Night</p>
                        <p className="font-semibold">${Number(tent.price).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Max Guests</p>
                        <p className="font-semibold">{tent.guests}</p>
                      </div>
                    </div>
                    {tent.size && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Size</p>
                          <p className="font-semibold">{tent.size}</p>
                        </div>
                      </div>
                    )}
                    {tent.bed && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bed Type</p>
                          <p className="font-semibold">{tent.bed}</p>
                        </div>
                      </div>
                    )}
                    {tent.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="font-semibold">
                            {tent.rating.toFixed(1)} ({tent.reviews} reviews)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amenities */}
            {tent.amenities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-serif text-xl mb-4">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {tent.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Gallery */}
            {tent.images.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Image Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tent.images.map((img) => (
                      <div key={img.id} className="relative h-32 rounded-lg overflow-hidden">
                        <Image
                          src={img.url}
                          alt={img.alt || tent.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                  </div>
                  <p className="text-2xl font-semibold">{tent.bookings.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                  <p className="text-2xl font-semibold">${totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Active Bookings</p>
                  </div>
                  <p className="text-2xl font-semibold">{activeBookings.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-serif text-xl mb-4">Booking History</h3>
                {tent.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {tent.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {booking.user.name || booking.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.checkIn), "MMM d")} -{" "}
                            {format(new Date(booking.checkOut), "MMM d, yyyy")}
                          </p>
                          {booking.bookingNumber && (
                            <p className="text-xs text-muted-foreground mt-1">
                              #{booking.bookingNumber}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${Number(booking.totalAmount).toLocaleString()}</p>
                          <Badge variant="outline" className="mt-1">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <div className="text-xs text-muted-foreground">
              <p>Created: {format(new Date(tent.createdAt), "MMM d, yyyy")}</p>
              <p>Last Updated: {format(new Date(tent.updatedAt), "MMM d, yyyy")}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

