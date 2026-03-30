"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, Calendar, Users, DollarSign, Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface ExperienceStatsData {
  activeExperiences: number;
  bookingsThisWeek: number;
  bookingsChange: number;
  guestsParticipating: number;
  revenueThisMonth: number;
  revenueChangePercent: number;
}

export function ExperienceStats() {
  const [stats, setStats] = useState<ExperienceStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/experiences/stats");
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
      label: "Active Experiences",
      value: stats.activeExperiences.toString(),
      change: `${stats.activeExperiences} available`,
      icon: Compass,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Bookings This Week",
      value: stats.bookingsThisWeek.toString(),
      change: stats.bookingsChange > 0
        ? `+${stats.bookingsChange} vs last week`
        : stats.bookingsChange < 0
        ? `${stats.bookingsChange} vs last week`
        : "Same as last week",
      icon: Calendar,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Guests Participating",
      value: stats.guestsParticipating.toString(),
      change: "Across all activities",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Revenue This Month",
      value: `$${stats.revenueThisMonth.toLocaleString()}`,
      change: stats.revenueChangePercent > 0
        ? `+${stats.revenueChangePercent}% vs last month`
        : stats.revenueChangePercent < 0
        ? `${stats.revenueChangePercent}% vs last month`
        : "Same as last month",
      icon: DollarSign,
      color: "bg-accent/20 text-primary",
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
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {stat.change}
                  {stat.label === "Bookings This Week" && stats.bookingsChange !== 0 && (
                    stats.bookingsChange > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )
                  )}
                  {stat.label === "Revenue This Month" && stats.revenueChangePercent !== 0 && (
                    stats.revenueChangePercent > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )
                  )}
                </p>
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
