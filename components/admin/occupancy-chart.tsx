"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface TimeSeriesData {
  date: string;
  occupancy: number;
}

export function OccupancyChart() {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const targetOccupancy = 75; // Default target

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics?period=month");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result.data?.timeSeries || []);
    } catch (err) {
      console.error("Occupancy fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Format data for chart
  const chartData = data.map((item) => {
    const [year, month] = item.date.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthLabel = date.toLocaleDateString("en-US", { month: "short" });

    return {
      month: monthLabel,
      occupancy: Number(item.occupancy.toFixed(1)),
      target: targetOccupancy,
    };
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif">Monthly Occupancy Rate</CardTitle>
        <p className="text-sm text-muted-foreground">Actual vs Target</p>
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
              <BarChart data={chartData} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={{ stroke: "#e5e5e5" }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, ""]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="occupancy" fill="#8B5E3C" radius={[4, 4, 0, 0]} name="Actual" />
                <Bar dataKey="target" fill="#E8D5C4" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Actual Occupancy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-sm text-muted-foreground">Target ({targetOccupancy}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
