"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { BookingStatus } from "@/lib/prisma-types";

interface BookingTrends {
  byStatus: Record<BookingStatus, number>;
  byMonth: Array<{ period: string; count: number }>;
}

export function BookingStatistics() {
  const [trends, setTrends] = useState<BookingTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchTrends();
  }, [period]);

  async function fetchTrends() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch trends");
      const data = await response.json();
      setTrends(data.data?.bookingTrends);
    } catch (err) {
      console.error("Trends fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<BookingStatus, string> = {
    PENDING: "#fbbf24",
    CONFIRMED: "#10b981",
    CANCELLED: "#ef4444",
    CHECKED_IN: "#3b82f6",
    CHECKED_OUT: "#8b5cf6",
  };

  const pieData = trends?.byStatus
    ? Object.entries(trends.byStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.replace(/_/g, " "),
          value: count,
          color: statusColors[status as BookingStatus] || "#gray",
        }))
    : [];

  const barData = trends?.byMonth.map((item) => {
    let label = item.period;
    if (period === "month") {
      const [year, month] = item.period.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return {
      period: label,
      bookings: item.count,
    };
  }) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-xl">Booking Statistics & Trends</CardTitle>
            <CardDescription>Booking status breakdown and trends over time</CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Booking Status Pie Chart */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Booking Status Distribution</h3>
              {pieData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No booking data
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Booking Trends Bar Chart */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Booking Trends</h3>
              {barData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No trend data
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12, fill: "#666" }}
                        axisLine={{ stroke: "#e5e5e5" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#666" }}
                        axisLine={{ stroke: "#e5e5e5" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar dataKey="bookings" fill="#8b5a2b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

