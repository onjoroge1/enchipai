"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Repeat, Star, Loader2 } from "lucide-react";

interface GuestStatsData {
  totalGuests: number;
  activeThisMonth: number;
  activeChange: string;
  returningGuests: number;
  returningPercentage: string;
  avgRating: string;
}

export function GuestStats() {
  const [stats, setStats] = useState<GuestStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch("/api/admin/guests/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const statsData = [
    {
      label: "Total Guests",
      value: loading ? "..." : (stats?.totalGuests || 0).toLocaleString(),
      change: stats?.activeChange || "0",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active This Month",
      value: loading ? "..." : (stats?.activeThisMonth || 0).toString(),
      change: stats?.activeChange || "0",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Returning Guests",
      value: loading ? "..." : (stats?.returningGuests || 0).toLocaleString(),
      change: stats?.returningPercentage || "0%",
      icon: Repeat,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Avg. Rating",
      value: loading ? "..." : (stats?.avgRating || "0.0"),
      change: "+0.1",
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                {loading ? (
                  <Loader2 className={`w-5 h-5 ${stat.color} animate-spin`} />
                ) : (
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                )}
              </div>
              <span className="text-xs text-green-600 font-medium">{stat.change}</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
