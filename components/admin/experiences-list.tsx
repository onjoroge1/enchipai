"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Loader2,
  Eye,
  Search,
  Download,
  X,
  Filter,
} from "lucide-react";
import { ExperienceFormDialog } from "./experience-form-dialog";
import { useSession } from "next-auth/react";
import { DataTablePagination } from "./data-table-pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = "name" | "price" | "bookings" | "createdAt";
type SortDirection = "asc" | "desc" | null;

interface Experience {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  duration: string | null;
  capacity: number | null;
  available: boolean;
  createdAt?: string;
  bookings: Array<{
    id: string;
    date: string;
    status: string;
  }>;
}

export function ExperiencesList() {
  const { data: session } = useSession();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFilter, setAvailableFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Check if user is ADMIN (only ADMIN can delete)
  const canDelete = session?.user?.role === "ADMIN";

  useEffect(() => {
    setOffset(0);
  }, [searchQuery, availableFilter]);

  useEffect(() => {
    fetchExperiences();
  }, [offset, limit, searchQuery, availableFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        setOffset(0);
        fetchExperiences();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  async function fetchExperiences() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (availableFilter !== "all") {
        params.append("available", availableFilter === "available" ? "true" : "false");
      }
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const response = await fetch(`/api/admin/experiences?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch experiences");
      const data = await response.json();
      setExperiences(data.data?.experiences || []);
      setTotal(data.data?.total || 0);
    } catch (err) {
      console.error("Experiences fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
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

  const sortedExperiences = [...experiences].sort((a, b) => {
    if (!sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "price":
        aValue = Number(a.price);
        bValue = Number(b.price);
        break;
      case "bookings":
        aValue = a.bookings?.length || 0;
        bValue = b.bookings?.length || 0;
        break;
      case "createdAt":
        return 0; // Already sorted server-side
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleExport = () => {
    const headers = [
      "Name",
      "Description",
      "Price",
      "Duration",
      "Capacity",
      "Available",
      "Bookings Count",
      "Created At",
    ];

    const rows = experiences.map((exp) => [
      exp.name,
      exp.description || "",
      Number(exp.price).toFixed(2),
      exp.duration || "",
      exp.capacity?.toString() || "",
      exp.available ? "Yes" : "No",
      (exp.bookings?.length || 0).toString(),
      new Date(exp.createdAt || "").toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `experiences-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingExperience(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (experienceId: string) => {
    if (!canDelete) {
      alert("You don't have permission to delete experiences. Only administrators can perform this action.");
      return;
    }

    if (!confirm("Are you sure you want to delete this experience? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/admin/experiences/${experienceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete experience");
      }
      fetchExperiences();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete experience");
    }
  };

  const handleToggleAvailable = async (experienceId: string, available: boolean) => {
    try {
      const response = await fetch(`/api/admin/experiences/${experienceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });

      if (!response.ok) throw new Error("Failed to update experience");
      fetchExperiences();
    } catch (err) {
      console.error("Toggle available error:", err);
      alert("Failed to update experience");
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
            <CardTitle className="text-lg font-serif">Available Experiences</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search experiences..."
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
              <Select value={availableFilter} onValueChange={setAvailableFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreate} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sortedExperiences.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || availableFilter !== "all"
                ? "No experiences found matching your filters"
                : "No experiences found. Create your first experience to get started."}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedExperiences.map((exp) => {
                const upcomingBookings = exp.bookings?.filter(
                  (b) => new Date(b.date) >= new Date() && b.status !== "CANCELLED"
                ) || [];
                
                return (
                  <div
                    key={exp.id}
                    className={`rounded-xl border border-border/50 overflow-hidden transition-all hover:shadow-md ${
                      !exp.available ? "opacity-60" : ""
                    }`}
                  >
                    <div className="relative h-32">
                      <Image
                        src={exp.image || "/images/wildlife.jpg"}
                        alt={exp.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground flex-1">{exp.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(exp)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(exp.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {exp.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{exp.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                        {exp.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exp.duration}
                          </span>
                        )}
                        {exp.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Max {exp.capacity}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${Number(exp.price).toLocaleString()}/person
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                          {upcomingBookings.length} upcoming booking{upcomingBookings.length !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Available</span>
                          <Switch
                            checked={exp.available}
                            onCheckedChange={(checked) => handleToggleAvailable(exp.id, checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
              {sortedExperiences.length > 0 && (
                <DataTablePagination
                  total={total}
                  limit={limit}
                  offset={offset}
                  onPageChange={setOffset}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setOffset(0);
                  }}
                  pageSizeOptions={[12, 24, 48]}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ExperienceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        experience={editingExperience}
        onSuccess={fetchExperiences}
      />
    </>
  );
}
