"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign, Loader2 } from "lucide-react";

interface InventoryStatsData {
  totalItems: number;
  lowStockCount: number;
  totalCategories: number;
  monthlySpend: number;
  itemsThisMonth: number;
}

export function InventoryStats() {
  const [stats, setStats] = useState<InventoryStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/inventory/stats");
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
      label: "Total Items",
      value: stats.totalItems.toString(),
      change: `Across ${stats.totalCategories} categories`,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockCount.toString(),
      change: stats.lowStockCount > 0 ? "Needs attention" : "All items well stocked",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Items Added",
      value: stats.itemsThisMonth.toString(),
      change: "This month",
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Total Inventory Value",
      value: `$${stats.monthlySpend.toLocaleString()}`,
      change: "Based on current stock",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
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
