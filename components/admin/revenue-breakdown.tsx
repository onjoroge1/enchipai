"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

interface RevenueData {
  name: string;
  value: number;
  color: string;
}

export function RevenueBreakdown() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics?period=year");
      if (!response.ok) throw new Error("Failed to fetch revenue breakdown");
      const result = await response.json();
      
      const revenueByTent = result.data?.revenueByTent || {};
      const colors = ["#8B5E3C", "#D4A574", "#C7956D", "#A67C52", "#E8D5C4", "#B8956A", "#9A7A4F"];
      
      const breakdown = Object.entries(revenueByTent)
        .map(([name, value], index) => ({
          name,
          value: Number(value),
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value);

      setData(breakdown);
    } catch (err) {
      console.error("Revenue breakdown fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif">Revenue Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">By service category</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No revenue data available
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      ${item.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
