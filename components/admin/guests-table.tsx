"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, MoreHorizontal, Mail, Phone, MapPin, Loader2, Eye, Edit, FileText, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { GuestDetailsDialog } from "./guest-details-dialog";
import { GuestEditDialog } from "./guest-edit-dialog";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SortField = "name" | "email" | "visits" | "totalSpent" | "lastVisit" | "createdAt";
type SortDirection = "asc" | "desc" | null;

interface Guest {
  id: string;
  name: string | null;
  email: string;
  bookings: Array<{
    id: string;
    totalAmount: number;
    createdAt: string;
    tent: { name: string };
    guestInfo: {
      nationality: string | null;
    } | null;
  }>;
  createdAt: string;
}

type StatusFilter = "ALL" | "VIP" | "RETURNING" | "NEW";

export function GuestsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setOffset(0); // Reset to first page when filters change
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    async function fetchGuests() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());

        const response = await fetch(`/api/admin/guests?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch guests");
        const data = await response.json();
        let fetchedGuests = data.data?.guests || [];

        // Apply status filter (client-side since it's based on booking count)
        if (statusFilter !== "ALL") {
          fetchedGuests = fetchedGuests.filter((guest: Guest) => {
            const visits = guest.bookings.length;
            if (statusFilter === "VIP") return visits >= 3;
            if (statusFilter === "RETURNING") return visits >= 2 && visits < 3;
            if (statusFilter === "NEW") return visits < 2;
            return true;
          });
        }

        setGuests(fetchedGuests);
        setTotal(data.data?.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guests");
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchGuests();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, refreshKey, offset, limit]);

  const handleViewProfile = (guestId: string) => {
    setSelectedGuestId(guestId);
    setDetailsOpen(true);
  };

  const handleEdit = (guestId: string) => {
    setSelectedGuestId(guestId);
    setEditOpen(true);
  };

  const handleViewBookings = (email: string) => {
    // Navigate to bookings page with search filter
    window.location.href = `/admin/bookings?search=${encodeURIComponent(email)}`;
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleExport = () => {
    // Convert to CSV
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Country",
      "Total Visits",
      "Total Spent",
      "Status",
      "Last Visit",
      "Member Since",
    ];

    const rows = guests.map((guest) => {
      const country = guest.bookings[0]?.guestInfo?.nationality || "";
      const visits = guest.bookings.length;
      const totalSpent = guest.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
      const status = visits >= 3 ? "VIP" : visits >= 2 ? "Returning" : "New";
      const lastVisit = guest.bookings[0]
        ? new Date(guest.bookings[0].createdAt).toLocaleDateString()
        : "Never";

      return [
        guest.name || "",
        guest.email,
        "", // Phone not in current data
        country,
        visits.toString(),
        totalSpent.toFixed(2),
        status,
        lastVisit,
        new Date(guest.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `guests-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalSpent = (guest: Guest) => {
    return guest.bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  };

  const getLastVisit = (guest: Guest) => {
    if (guest.bookings.length === 0) return "Never";
    const lastBooking = guest.bookings[0];
    return new Date(lastBooking.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatus = (guest: Guest) => {
    const visits = guest.bookings.length;
    if (visits >= 3) return { label: "VIP", color: "bg-accent text-accent-foreground" };
    if (visits >= 2) return { label: "Returning", color: "bg-blue-100 text-blue-700" };
    return { label: "New", color: "bg-green-100 text-green-700" };
  };

  const getCountry = (guest: Guest) => {
    // Get country from most recent booking's guestInfo
    return guest.bookings[0]?.guestInfo?.nationality || null;
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

  // Sort guests client-side
  const sortedGuests = [...guests].sort((a, b) => {
    if (!sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name || "";
        bValue = b.name || "";
        break;
      case "email":
        aValue = a.email;
        bValue = b.email;
        break;
      case "visits":
        aValue = a.bookings.length;
        bValue = b.bookings.length;
        break;
      case "totalSpent":
        aValue = getTotalSpent(a);
        bValue = getTotalSpent(b);
        break;
      case "lastVisit":
        aValue = a.bookings[0] ? new Date(a.bookings[0].createdAt).getTime() : 0;
        bValue = b.bookings[0] ? new Date(b.bookings[0].createdAt).getTime() : 0;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-serif">All Guests</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search guests..."
                  className="pl-9 w-64 bg-secondary border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                    All Guests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("VIP")}>
                    VIP (3+ visits)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("RETURNING")}>
                    Returning (2 visits)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("NEW")}>
                    New (1 visit)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Guest
                      {getSortIcon("name")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Contact
                      {getSortIcon("email")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Country
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort("visits")}
                      className="flex items-center justify-center hover:text-foreground transition-colors mx-auto"
                    >
                      Visits
                      {getSortIcon("visits")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort("totalSpent")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Total Spent
                      {getSortIcon("totalSpent")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : sortedGuests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "ALL"
                        ? "No guests found matching your filters"
                        : "No guests found"}
                    </td>
                  </tr>
                ) : (
                  sortedGuests.map((guest) => {
                    const status = getStatus(guest);
                    const country = getCountry(guest);
                    const initials = guest.name
                      ? guest.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "GU";
                    return (
                      <tr key={guest.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">{initials}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{guest.name || "Guest"}</p>
                              <p className="text-sm text-muted-foreground">{getLastVisit(guest)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {guest.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell">
                          {country ? (
                            <div className="flex items-center gap-1 text-sm text-foreground">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {country}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-medium text-foreground">{guest.bookings.length}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-foreground">
                            ${getTotalSpent(guest).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <Badge className={status.color}>{status.label}</Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProfile(guest.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(guest.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Guest
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(guest.email)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewBookings(guest.email)}>
                                <FileText className="w-4 h-4 mr-2" />
                                View Bookings
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {guests.length > 0 && (
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
        </CardContent>
      </Card>

      <GuestDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        guestId={selectedGuestId}
      />

      <GuestEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        guestId={selectedGuestId}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </>
  );
}
