"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  Users,
  Loader2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ExperienceBookingDialog } from "./experience-booking-dialog";

interface ExperienceBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  date: string;
  participants: number;
  totalAmount: number;
  status: string;
  experience: {
    id: string;
    name: string;
  };
}

const statusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  CONFIRMED: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  PENDING: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <Clock className="w-3 h-3" />,
  },
  CANCELLED: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <XCircle className="w-3 h-3" />,
  },
  CHECKED_OUT: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

export function ExperienceBookings() {
  const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExperienceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.experience.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchQuery, statusFilter]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/experiences/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data.data?.bookings || []);
    } catch (err) {
      console.error("Bookings fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      // Note: We might need to create a DELETE endpoint for experience bookings
      // For now, we'll update status to CANCELLED
      const response = await fetch(`/api/admin/experiences/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to cancel booking");
      }
      fetchBookings();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-serif">Experience Bookings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-9 w-48 bg-secondary border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {bookings.length === 0 ? "No bookings found" : "No bookings match your search"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const bookingDate = new Date(booking.date);
                    const statusStyle = statusStyles[booking.status] || statusStyles.PENDING;
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">{booking.id.substring(0, 8)}</TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{booking.guestName}</div>
                            <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.experience.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {format(bookingDate, "MMM d, yyyy")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(bookingDate, "h:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            {booking.participants}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${Number(booking.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                            <span className="mr-1">{statusStyle.icon}</span>
                            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase().replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Booking
                              </DropdownMenuItem>
                              {booking.status !== "CANCELLED" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(booking.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <ExperienceBookingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchBookings}
      />
    </>
  );
}
