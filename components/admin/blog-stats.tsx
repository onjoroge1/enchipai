"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    label: "Total Posts",
    value: "6",
    change: "+2 this month",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Total Views",
    value: "12,450",
    change: "+18% from last month",
    icon: Eye,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Avg. Read Time",
    value: "7.5 min",
    change: "Optimal length",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    label: "Engagement Rate",
    value: "4.2%",
    change: "+0.5% from last month",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

export function BlogStats() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
