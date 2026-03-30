"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Users, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsSummary {
  totalBookings: number;
  checkedInBookings: number;
  totalRevenue: number;
  occupancyRate: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch("/api/admin/analytics?period=month");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.data?.summary);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate month-to-date revenue
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdRevenue = stats?.totalRevenue || 0;

  const statsData = [
    {
      label: "Total Bookings",
      value: loading ? "..." : (stats?.totalBookings || 0).toString(),
      change: "This month",
      trend: "up" as const,
      icon: CalendarCheck,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Active Guests",
      value: loading ? "..." : (stats?.checkedInBookings || 0).toString(),
      change: "Currently checked in",
      trend: "neutral" as const,
      icon: Users,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Revenue (MTD)",
      value: loading ? "..." : `$${mtdRevenue.toLocaleString()}`,
      change: "This month",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-accent/20 text-primary",
    },
    {
      label: "Occupancy Rate",
      value: loading ? "..." : `${(stats?.occupancyRate || 0).toFixed(1)}%`,
      change: "Current period",
      trend: "up" as const,
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className={`text-xs mt-1 ${stat.trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <stat.icon className="w-6 h-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
