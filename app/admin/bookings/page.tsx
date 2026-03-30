"use client";

import { useState } from "react";
import { BookingsTable } from "@/components/admin/bookings-table";
import { BookingCreateDialog } from "@/components/admin/booking-create-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter, Download, Search, X, Calendar } from "lucide-react";
import { BookingStatus } from "@/lib/prisma-types";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AdminBookingsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRangeFilter, setDateRangeFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleExport = () => {
    // Fetch all bookings for export
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    params.append("limit", "10000"); // Get all bookings

    fetch(`/api/admin/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const bookings = data.data?.bookings || [];
        
        // Convert to CSV
        const headers = [
          "Booking ID",
          "Booking Number",
          "Guest Name",
          "Guest Email",
          "Tent",
          "Check-in",
          "Check-out",
          "Guests",
          "Amount",
          "Status",
          "Created At",
        ];

        const rows = bookings.map((booking: any) => [
          booking.id,
          booking.bookingNumber || "",
          booking.user?.name || "",
          booking.user?.email || "",
          booking.tent?.name || "",
          new Date(booking.checkIn).toLocaleDateString(),
          new Date(booking.checkOut).toLocaleDateString(),
          booking.guests || 0,
          Number(booking.totalAmount).toFixed(2),
          booking.status,
          new Date(booking.createdAt).toLocaleString(),
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `bookings-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error("Export error:", err);
        alert("Failed to export bookings");
      });
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all reservations and bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
                {(dateRangeFilter.startDate || dateRangeFilter.endDate) && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-xs">
                    1
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) =>
                      setDateRangeFilter({ ...dateRangeFilter, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) =>
                      setDateRangeFilter({ ...dateRangeFilter, endDate: e.target.value })
                    }
                    min={dateRangeFilter.startDate}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRangeFilter({ startDate: "", endDate: "" });
                      setShowDateFilter(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowDateFilter(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Status
                {statusFilter !== "ALL" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-xs">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>
                Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CHECKED_IN")}>
                Checked In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CHECKED_OUT")}>
                Checked Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                Complete list of all reservations and bookings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BookingsTable
            key={refreshKey}
            searchQuery={searchQuery}
            statusFilter={statusFilter !== "ALL" ? statusFilter : undefined}
            startDate={dateRangeFilter.startDate || undefined}
            endDate={dateRangeFilter.endDate || undefined}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      <BookingCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </>
  );
}
