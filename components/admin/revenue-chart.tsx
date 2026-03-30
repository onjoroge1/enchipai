"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";

const primaryColor = "#8b5a2b";
const accentColor = "#d4a853";

interface TimeSeriesData {
  date: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

export function RevenueChart() {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result.data?.timeSeries || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Format data for chart
  const chartData = data.map((item) => {
    let label = item.date;
    if (period === "month") {
      const [year, month] = item.date.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else if (period === "week") {
      const date = new Date(item.date);
      label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "day") {
      const date = new Date(item.date);
      label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      label = item.date;
    }

    return {
      period: label,
      revenue: item.revenue,
      bookings: item.bookings,
      occupancy: item.occupancy,
    };
  });
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-xl">Revenue & Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">Performance overview</p>
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
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis 
                dataKey="period" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
              />
              <YAxis 
                yAxisId="revenue"
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <YAxis 
                yAxisId="bookings"
                orientation="right"
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number, name: string) => [
                  name === "revenue" ? `$${value.toLocaleString()}` : value,
                  name === "revenue" ? "Revenue" : "Bookings"
                ]}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={primaryColor}
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
              <Area
                yAxisId="bookings"
                type="monotone"
                dataKey="bookings"
                stroke={accentColor}
                strokeWidth={2}
                fill="url(#bookingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="text-sm text-muted-foreground">Bookings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
