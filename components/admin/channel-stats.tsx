"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Share2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const stats = [
  {
    label: "Connected Channels",
    value: "5",
    change: "of 8 available",
    icon: Share2,
  },
  {
    label: "Synced Bookings",
    value: "234",
    change: "Last 30 days",
    icon: CheckCircle,
  },
  {
    label: "Pending Updates",
    value: "3",
    change: "Availability changes",
    icon: AlertCircle,
  },
  {
    label: "Last Sync",
    value: "5 min",
    change: "ago",
    icon: RefreshCw,
  },
];

export function ChannelStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
