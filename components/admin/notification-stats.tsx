"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell, MessageSquare, Send, CheckCheck } from "lucide-react";

const stats = [
  {
    label: "Notifications Sent",
    value: "1,247",
    change: "This month",
    icon: Send,
  },
  {
    label: "SMS Messages",
    value: "456",
    change: "82% delivered",
    icon: MessageSquare,
  },
  {
    label: "WhatsApp Messages",
    value: "791",
    change: "94% read",
    icon: Bell,
  },
  {
    label: "Delivery Rate",
    value: "98.2%",
    change: "+2.1% from last month",
    icon: CheckCheck,
  },
];

export function NotificationStats() {
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
