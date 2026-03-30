"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  MessageSquare,
  Phone,
  CheckCheck,
  Clock,
  AlertCircle,
  User,
  Calendar,
  CreditCard,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  user?: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "booking": return Calendar;
    case "payment": return CreditCard;
    case "reminder": return Bell;
    case "sms":
    case "whatsapp": return MessageSquare;
    case "staff": return User;
    default: return Bell;
  }
};

const getStatusBadge = (read: boolean) => {
  if (read) {
    return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCheck className="w-3 h-3 mr-1" />Read</Badge>;
  }
  return <Badge variant="outline" className="text-amber-600 border-amber-600"><Clock className="w-3 h-3 mr-1" />Unread</Badge>;
};

const getChannelIcon = (type: string) => {
  if (type === "WHATSAPP" || type === "whatsapp") {
    return <MessageSquare className="w-5 h-5 text-green-600" />;
  }
  if (type === "SMS" || type === "sms") {
    return <Phone className="w-5 h-5 text-blue-600" />;
  }
  return <Bell className="w-5 h-5 text-primary" />;
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function NotificationCenter() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/admin/notifications?limit=20");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter(n => n.type.toLowerCase() === filter);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Notifications</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>All</TabsTrigger>
            <TabsTrigger value="booking" onClick={() => setFilter("booking")}>Bookings</TabsTrigger>
            <TabsTrigger value="payment" onClick={() => setFilter("payment")}>Payments</TabsTrigger>
            <TabsTrigger value="system" onClick={() => setFilter("system")}>System</TabsTrigger>
          </TabsList>

          {["all", "booking", "payment", "system"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
              ) : (
                filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                        {getChannelIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {notification.user?.name || "System"}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {notification.type}
                          </Badge>
                          {getStatusBadge(notification.read)}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-1">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{timeAgo(notification.createdAt)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
