"use client";

import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Total Sightings",
    value: "1,847",
    change: "This month",
    icon: "🦁",
  },
  {
    label: "Big Five Spotted",
    value: "5/5",
    change: "All spotted this week",
    icon: "🐘",
  },
  {
    label: "Migration Status",
    value: "Active",
    change: "Peak viewing season",
    icon: "🦓",
  },
  {
    label: "Predator Activity",
    value: "High",
    change: "Lions near camp",
    icon: "🐆",
  },
];

export function WildlifeStats() {
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
