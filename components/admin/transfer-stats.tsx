"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Car, Fuel, Wrench, Loader2 } from "lucide-react";

interface TransferStatsData {
  transfersToday: number;
  arrivalsToday: number;
  departuresToday: number;
  activeVehicles: number;
  fuelThisMonth: number;
  dueForService: number;
}

export function TransferStats() {
  const [stats, setStats] = useState<TransferStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/transfers/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          {error || "Failed to load statistics"}
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      label: "Transfers Today",
      value: stats.transfersToday.toString(),
      change: `${stats.arrivalsToday} arrivals, ${stats.departuresToday} departures`,
      icon: Plane,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Vehicles",
      value: stats.activeVehicles.toString(),
      change: "Assigned to transfers",
      icon: Car,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Fuel This Month",
      value: stats.fuelThisMonth > 0 ? `${stats.fuelThisMonth}L` : "N/A",
      change: stats.fuelThisMonth > 0 ? "Tracked" : "Not tracked",
      icon: Fuel,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Due for Service",
      value: stats.dueForService.toString(),
      change: stats.dueForService > 0 ? "Within next 7 days" : "All up to date",
      icon: Wrench,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
