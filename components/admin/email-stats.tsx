"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send, Eye, MousePointer } from "lucide-react";

const stats = [
  {
    label: "Total Sent",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: Send,
  },
  {
    label: "Open Rate",
    value: "68.4%",
    change: "+5.2%",
    changeType: "positive" as const,
    icon: Eye,
  },
  {
    label: "Click Rate",
    value: "24.8%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: MousePointer,
  },
  {
    label: "Templates",
    value: "12",
    change: "Active",
    changeType: "neutral" as const,
    icon: Mail,
  },
];

export function EmailStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span
                className={`text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
