"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Eye, Calendar, DollarSign, Plus, Loader2, Edit, Trash2, Search, Download, Filter } from "lucide-react";
import Image from "next/image";
import { TentFormDialog } from "./tent-form-dialog";
import { TentDetailsDialog } from "./tent-details-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TentStatus } from "@/lib/prisma-types";

interface Tent {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  status: TentStatus;
  price: number;
  guests: number;
  featured: boolean;
  displayOrder: number;
  bookings: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    status: string;
    user?: {
      name: string | null;
    };
  }>;
}

const statusColors: Record<TentStatus, string> = {
  OCCUPIED: "bg-blue-100 text-blue-700",
  AVAILABLE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  UNAVAILABLE: "bg-red-100 text-red-700",
};

export function TentsList() {
  const { data: session } = useSession();
  const [tents, setTents] = useState<Tent[]>([]);
  const [filteredTents, setFilteredTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTent, setEditingTent] = useState<Tent | null>(null);
  const [viewingTentId, setViewingTentId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);

  // Check if user is ADMIN (only ADMIN can delete)
  const canDelete = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetchTents();
  }, []);

  async function fetchTents() {
    try {
      const response = await fetch("/api/admin/tents");
      if (!response.ok) throw new Error("Failed to fetch tents");
      const data = await response.json();
      setTents(data.data || []);
      setFilteredTents(data.data || []);
    } catch (err) {
      console.error("Tents fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let filtered = [...tents];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((tent) =>
        tent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tent.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tent) => tent.status === statusFilter);
    }

    // Apply featured filter
    if (featuredFilter !== null) {
      filtered = filtered.filter((tent) => tent.featured === featuredFilter);
    }

    setFilteredTents(filtered);
  }, [tents, searchQuery, statusFilter, featuredFilter]);

  const handleExport = () => {
    const csvHeaders = ["Name", "Slug", "Status", "Price", "Guests", "Featured", "Display Order"];
    const csvRows = filteredTents.map((tent) => [
      tent.name,
      tent.slug,
      tent.status,
      Number(tent.price).toLocaleString(),
      tent.guests,
      tent.featured ? "Yes" : "No",
      tent.displayOrder,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tents-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (tent: Tent) => {
    setEditingTent(tent);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTent(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (tentId: string) => {
    if (!canDelete) {
      alert("You don't have permission to delete tents. Only administrators can perform this action.");
      return;
    }

    if (!confirm("Are you sure you want to delete this tent? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/admin/tents/${tentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete tent");
      }
      fetchTents();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete tent");
    }
  };

  const getCurrentBooking = (tent: Tent) => {
    return tent.bookings?.find(
      (b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN"
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  const currentBooking = (tent: Tent) => getCurrentBooking(tent);
  const tentImage = (tent: Tent) => tent.image || "/images/luxury-tent.jpg";

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif text-xl">All Tents</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage tent details and availability</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreate} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Tent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tents by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 px-3 border rounded-md">
                <Label htmlFor="featured-filter" className="text-sm cursor-pointer">
                  Featured Only
                </Label>
                <Switch
                  id="featured-filter"
                  checked={featuredFilter === true}
                  onCheckedChange={(checked) => setFeaturedFilter(checked ? true : null)}
                />
              </div>
            </div>
            {filteredTents.length !== tents.length && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredTents.length} of {tents.length} tents
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {tents.length === 0 ? "No tents found" : "No tents match your filters"}
              </div>
            ) : (
              filteredTents.map((tent) => {
              const booking = currentBooking(tent);
              return (
                <Card key={tent.id} className="border-border/50 overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={tentImage(tent)}
                      alt={tent.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={statusColors[tent.status] || statusColors.AVAILABLE}>
                        {tent.status}
                      </Badge>
                      {tent.featured && (
                        <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif text-lg text-foreground">{tent.name}</h3>
                        {booking ? (
                          <p className="text-sm text-muted-foreground">
                            {booking.user?.name || "Guest"} - until{" "}
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm text-green-600">Ready for booking</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            ${Number(tent.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">/night</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{tent.guests} Guests</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(tent)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Tent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setViewingTentId(tent.id);
                            setIsDetailsOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(tent.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Tent
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <TentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tent={editingTent}
        onSuccess={fetchTents}
      />

      <TentDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        tentId={viewingTentId}
      />
    </>
  );
}
