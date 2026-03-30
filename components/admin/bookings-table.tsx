"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookingStatus } from "@/lib/prisma-types";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { BookingEditDialog } from "./booking-edit-dialog";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";

type SortField = "bookingNumber" | "guestName" | "tentName" | "checkIn" | "totalAmount" | "status" | "createdAt";
type SortDirection = "asc" | "desc" | null;

interface Booking {
  id: string;
  bookingNumber: string | null;
  user: {
    name: string | null;
    email: string;
  };
  tent: {
    name: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
}

interface BookingsTableProps {
  searchQuery?: string;
  statusFilter?: string;
  startDate?: string;
  endDate?: string;
  onRefresh?: () => void;
}

const statusStyles: Record<BookingStatus, string> = {
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-200",
  PENDING: "bg-accent/20 text-primary border-accent",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
  CHECKED_IN: "bg-blue-500/10 text-blue-700 border-blue-200",
  CHECKED_OUT: "bg-gray-500/10 text-gray-700 border-gray-200",
};

export function BookingsTable({ searchQuery = "", statusFilter, startDate, endDate, onRefresh }: BookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setOffset(0); // Reset to first page when filters change
    fetchBookings();
  }, [searchQuery, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchBookings();
  }, [offset, limit, sortField, sortDirection]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data.data?.bookings || []);
      setTotal(data.data?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDetailsOpen(true);
  };

  const handleEdit = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setEditOpen(true);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setCancelling(bookingId);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to cancel booking");
      }

      // Refresh bookings
      fetchBookings();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null (default)
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField("createdAt");
        setSortDirection("desc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-3 h-3 ml-1" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="w-3 h-3 ml-1" />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
  };

  // Sort bookings client-side
  const sortedBookings = [...bookings].sort((a, b) => {
    if (!sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "bookingNumber":
        aValue = a.bookingNumber || a.id;
        bValue = b.bookingNumber || b.id;
        break;
      case "guestName":
        aValue = a.user.name || "";
        bValue = b.user.name || "";
        break;
      case "tentName":
        aValue = a.tent.name;
        bValue = b.tent.name;
        break;
      case "checkIn":
        aValue = new Date(a.checkIn).getTime();
        bValue = new Date(b.checkIn).getTime();
        break;
      case "totalAmount":
        aValue = Number(a.totalAmount);
        bValue = Number(b.totalAmount);
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "createdAt":
        // This is handled server-side, but we can still sort client-side
        return 0;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort("bookingNumber")}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Booking ID
                  {getSortIcon("bookingNumber")}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort("guestName")}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Guest
                  {getSortIcon("guestName")}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                <button
                  onClick={() => handleSort("tentName")}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Tent
                  {getSortIcon("tentName")}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                <button
                  onClick={() => handleSort("checkIn")}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Dates
                  {getSortIcon("checkIn")}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort("totalAmount")}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Amount
                  {getSortIcon("totalAmount")}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Status
                  {getSortIcon("status")}
                </button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  No bookings found
                </td>
              </tr>
            ) : (
              sortedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-foreground">
                      {booking.bookingNumber || booking.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {booking.user.name || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="text-sm text-foreground">{booking.tent.name}</span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground">
                      ${Number(booking.totalAmount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs ${
                        statusStyles[booking.status] || statusStyles.PENDING
                      }`}
                    >
                      {booking.status.replace("_", " ").toLowerCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(booking.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(booking.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id || booking.status === "CANCELLED"}
                        >
                          {cancelling === booking.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {bookings.length > 0 && (
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={setOffset}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setOffset(0);
          }}
        />
      )}

      <BookingDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        bookingId={selectedBookingId}
      />

      <BookingEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        bookingId={selectedBookingId}
        onSuccess={() => {
          fetchBookings();
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
