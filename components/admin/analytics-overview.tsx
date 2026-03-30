"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Percent, Loader2 } from "lucide-react";

interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  avgStayDuration: number;
}

export function AnalyticsOverview() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/admin/analytics?period=year");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setSummary(data.data?.summary);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const metrics = [
    {
      label: "Total Revenue",
      value: loading ? "..." : `$${(summary?.totalRevenue || 0).toLocaleString()}`,
      change: "Year to date",
      trend: "up" as const,
      period: "Current year",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Bookings",
      value: loading ? "..." : (summary?.totalBookings || 0).toString(),
      change: "Year to date",
      trend: "up" as const,
      period: "Current year",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Avg. Occupancy",
      value: loading ? "..." : `${(summary?.occupancyRate || 0).toFixed(1)}%`,
      change: "Current period",
      trend: "up" as const,
      period: "Average rate",
      icon: Percent,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg. Stay Duration",
      value: loading ? "..." : `${(summary?.avgStayDuration || 0).toFixed(1)} nights`,
      change: "Average",
      trend: "neutral" as const,
      period: "Per booking",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                {loading ? (
                  <Loader2 className={`w-6 h-6 ${metric.color} animate-spin`} />
                ) : (
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                )}
              </div>
              {metric.trend !== "neutral" && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
              <p className="text-xs text-muted-foreground">{metric.period}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
