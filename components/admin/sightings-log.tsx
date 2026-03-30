"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  MapPin,
  Clock,
  Camera,
  MoreVertical,
  Filter,
  Loader2,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "./data-table-pagination";
import { SightingForm } from "./sighting-form";

interface WildlifeSighting {
  id: string;
  species: string;
  location: string | null;
  description: string | null;
  image: string | null;
  date: string;
  guideName: string | null;
  createdAt: string;
}

const mockSightings = [
  {
    id: 1,
    animal: "Lion Pride",
    count: 8,
    icon: "🦁",
    location: "Paradise Plains",
    coordinates: "-1.4061, 35.0158",
    time: "6:45 AM",
    date: "Today",
    guide: "David Kimani",
    notes: "Large pride with 2 males, 4 females, and 2 cubs. Resting near the waterhole.",
    category: "big-five",
    hasPhoto: true,
  },
  {
    id: 2,
    animal: "Elephant Herd",
    count: 15,
    icon: "🐘",
    location: "Mara River Crossing",
    coordinates: "-1.4523, 35.0234",
    time: "7:30 AM",
    date: "Today",
    guide: "David Kimani",
    notes: "Herd crossing river with young calves. Spectacular viewing!",
    category: "big-five",
    hasPhoto: true,
  },
  {
    id: 3,
    animal: "Leopard",
    count: 1,
    icon: "🐆",
    location: "Fig Tree Ridge",
    coordinates: "-1.3892, 35.0087",
    time: "5:15 PM",
    date: "Yesterday",
    guide: "Peter Mutua",
    notes: "Female leopard resting in acacia tree. Possibly pregnant.",
    category: "big-five",
    hasPhoto: true,
  },
  {
    id: 4,
    animal: "Cheetah Coalition",
    count: 3,
    icon: "🐆",
    location: "Open Savannah",
    coordinates: "-1.4156, 35.0321",
    time: "9:00 AM",
    date: "Yesterday",
    guide: "Grace Akinyi",
    notes: "Three male cheetahs hunting. Successful impala catch.",
    category: "predator",
    hasPhoto: true,
  },
  {
    id: 5,
    animal: "Wildebeest Migration",
    count: 5000,
    icon: "🦓",
    location: "Northern Serengeti Border",
    coordinates: "-1.3654, 35.0456",
    time: "11:30 AM",
    date: "Yesterday",
    guide: "David Kimani",
    notes: "Massive herd moving north. River crossing expected tomorrow.",
    category: "migration",
    hasPhoto: false,
  },
  {
    id: 6,
    animal: "Black Rhino",
    count: 2,
    icon: "🦏",
    location: "Rhino Valley",
    coordinates: "-1.4234, 34.9876",
    time: "6:00 AM",
    date: "2 days ago",
    guide: "Peter Mutua",
    notes: "Mother and calf. Very rare sighting! Kept safe distance.",
    category: "big-five",
    hasPhoto: true,
  },
  {
    id: 7,
    animal: "Cape Buffalo",
    count: 200,
    icon: "🐃",
    location: "Musiara Marsh",
    coordinates: "-1.4089, 35.0123",
    time: "4:30 PM",
    date: "2 days ago",
    guide: "Grace Akinyi",
    notes: "Large herd grazing. Several oxpeckers present.",
    category: "big-five",
    hasPhoto: false,
  },
  {
    id: 8,
    animal: "Hippo Pod",
    count: 30,
    icon: "🦛",
    location: "Hippo Pool",
    coordinates: "-1.4312, 35.0267",
    time: "2:00 PM",
    date: "3 days ago",
    guide: "David Kimani",
    notes: "Active pod with territorial males displaying.",
    category: "other",
    hasPhoto: true,
  },
];

const getCategoryBadge = (category: string) => {
  switch (category) {
    case "big-five":
      return <Badge className="bg-amber-100 text-amber-800">Big Five</Badge>;
    case "predator":
      return <Badge className="bg-red-100 text-red-800">Predator</Badge>;
    case "migration":
      return <Badge className="bg-blue-100 text-blue-800">Migration</Badge>;
    default:
      return <Badge variant="secondary">Wildlife</Badge>;
  }
};

export function SightingsLog() {
  const [sightings, setSightings] = useState<WildlifeSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSightings();
  }, [offset, limit, speciesFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        setOffset(0);
        fetchSightings();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  async function fetchSightings() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("species", search);
      if (speciesFilter) params.append("species", speciesFilter);
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const response = await fetch(`/api/admin/wildlife?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch sightings");
      const data = await response.json();
      setSightings(data.data?.sightings || []);
      setTotal(data.data?.total || 0);
    } catch (err) {
      console.error("Sightings fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchSightings();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Recent Sightings</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by species..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[200px]"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearch("")}
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
              <DropdownMenuItem onClick={() => setSpeciesFilter("")}>All Species</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSpeciesFilter("Lion")}>Lion</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSpeciesFilter("Elephant")}>Elephant</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSpeciesFilter("Leopard")}>Leopard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSpeciesFilter("Cheetah")}>Cheetah</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sightings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No sightings found
          </div>
        ) : (
          <>
            {sightings.map((sighting) => (
              <div
                key={sighting.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                  🦁
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{sighting.species}</h3>
                    {sighting.image && (
                      <Camera className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    {sighting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {sighting.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sighting.date).toLocaleDateString()} {new Date(sighting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {sighting.description && (
                    <p className="text-sm text-foreground mt-2">{sighting.description}</p>
                  )}
                  {sighting.guideName && (
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {sighting.guideName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Spotted by {sighting.guideName}</span>
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Share with Guests</DropdownMenuItem>
                    <DropdownMenuItem>Edit Sighting</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {sightings.length > 0 && (
              <DataTablePagination
                total={total}
                limit={limit}
                offset={offset}
                onPageChange={setOffset}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setOffset(0);
                }}
                pageSizeOptions={[10, 25, 50]}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
