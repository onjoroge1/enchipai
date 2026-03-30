"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Edit,
  Trash2,
  Plus,
  Link as LinkIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChannelConnectDialog } from "./channel-connect-dialog";

interface Channel {
  id: string;
  name: string;
  type: string;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  apiKey?: string | null;
  apiSecret?: string | null;
}

interface MockChannel {
  id: string;
  name: string;
  logo: string;
  color: string;
  status: "connected" | "disconnected" | "pending";
  enabled: boolean;
  bookings: number;
  commission: string;
  lastSync: string;
  type: string;
}

const mockChannels: MockChannel[] = [
  {
    id: "booking",
    name: "Booking.com",
    logo: "B",
    color: "#003580",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "15%",
    lastSync: "Never",
    type: "BOOKING_COM",
  },
  {
    id: "expedia",
    name: "Expedia",
    logo: "E",
    color: "#FFCC00",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "18%",
    lastSync: "Never",
    type: "EXPEDIA",
  },
  {
    id: "safari",
    name: "SafariBookings",
    logo: "S",
    color: "#2D5016",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "12%",
    lastSync: "Never",
    type: "CUSTOM",
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    logo: "T",
    color: "#00AF87",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "15%",
    lastSync: "Never",
    type: "CUSTOM",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "A",
    color: "#FF5A5F",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "14%",
    lastSync: "Never",
    type: "AIRBNB",
  },
  {
    id: "agoda",
    name: "Agoda",
    logo: "A",
    color: "#5542F6",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "16%",
    lastSync: "Never",
    type: "CUSTOM",
  },
  {
    id: "hotels",
    name: "Hotels.com",
    logo: "H",
    color: "#D32F2F",
    status: "pending",
    enabled: false,
    bookings: 0,
    commission: "17%",
    lastSync: "Pending approval",
    type: "CUSTOM",
  },
  {
    id: "viator",
    name: "Viator",
    logo: "V",
    color: "#00AA6C",
    status: "disconnected",
    enabled: false,
    bookings: 0,
    commission: "20%",
    lastSync: "Never",
    type: "CUSTOM",
  },
];

export function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<MockChannel | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/channels");
      if (!response.ok) throw new Error("Failed to fetch channels");
      const data = await response.json();
      setChannels(data.data?.channels || []);
    } catch (err) {
      console.error("Channels fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleSync = async (channelId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/channels/${channelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncEnabled: enabled }),
      });

      if (!response.ok) throw new Error("Failed to update channel");
      fetchChannels();
    } catch (err) {
      console.error("Toggle sync error:", err);
      alert("Failed to update channel");
    }
  };

  const handleDisconnect = async (channelId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${channelName}? This will remove all API credentials.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/channels/${channelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncEnabled: false,
          apiKey: null,
          apiSecret: null,
          webhookUrl: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to disconnect channel");
      await fetchChannels();
      alert(`${channelName} disconnected successfully`);
    } catch (err) {
      console.error("Disconnect error:", err);
      alert("Failed to disconnect channel");
    }
  };

  const handleConnectClick = (mockChannel: MockChannel) => {
    setSelectedChannel(mockChannel);
    setConnectDialogOpen(true);
  };

  const handleConnect = async (apiKey: string, apiSecret?: string, webhookUrl?: string) => {
    if (!selectedChannel) return;

    try {
      // Check if channel already exists in database
      const existingChannel = channels.find(
        (ch) => ch.name.toLowerCase() === selectedChannel.name.toLowerCase()
      );

      if (existingChannel) {
        // Update existing channel with real API credentials
        const response = await fetch(`/api/admin/channels/${existingChannel.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syncEnabled: true,
            apiKey,
            apiSecret: apiSecret || undefined,
            webhookUrl: webhookUrl || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to connect channel");
        }
      } else {
        // Create new channel with real API credentials
        const response = await fetch("/api/admin/channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedChannel.name,
            type: selectedChannel.type,
            syncEnabled: true,
            apiKey,
            apiSecret: apiSecret || undefined,
            webhookUrl: webhookUrl || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to create channel");
        }
      }

      await fetchChannels();
      alert(`${selectedChannel.name} connected successfully!`);
    } catch (err) {
      console.error("Connect error:", err);
      alert(err instanceof Error ? err.message : `Failed to connect ${selectedChannel.name}`);
    }
  };

  const getChannelLogo = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getChannelColor = (type: string, mockColor?: string) => {
    if (mockColor) return mockColor;
    const colors: Record<string, string> = {
      BOOKING_COM: "#003580",
      AIRBNB: "#FF5A5F",
      EXPEDIA: "#FFCC00",
      CUSTOM: "#6B7280",
    };
    return colors[type] || "#6B7280";
  };

  const getChannelStatus = (mockChannel: MockChannel, dbChannel?: Channel) => {
    // Only show as connected if channel exists in DB with a real API key (not empty or placeholder)
    if (dbChannel && dbChannel.apiKey && dbChannel.apiKey.trim().length > 0 && dbChannel.apiKey !== "connected") {
      return "connected";
    }
    return "disconnected";
  };

  // Merge mock channels with database channels
  const allChannels = mockChannels.map((mockChannel) => {
    const dbChannel = channels.find(
      (ch) => ch.name.toLowerCase() === mockChannel.name.toLowerCase()
    );
    return {
      ...mockChannel,
      dbChannel,
      isConnected: getChannelStatus(mockChannel, dbChannel) === "connected",
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Distribution Channels</CardTitle>
        <Button size="sm">
          Add Channel
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          allChannels.map((channel) => {
            const status = getChannelStatus(channel, channel.dbChannel);

            return (
              <div
                key={channel.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              >
                {/* Logo */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: getChannelColor(channel.type, channel.color) }}
                >
                  {channel.logo}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{channel.name}</h3>
                    {status === "connected" && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                    {status === "disconnected" && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Disconnected
                      </Badge>
                    )}
                    {status === "pending" && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {channel.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                    {status === "connected" && channel.dbChannel?.lastSyncAt ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Last sync: {new Date(channel.dbChannel.lastSyncAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Never synced
                      </span>
                    )}
                    {status === "connected" && channel.dbChannel ? (
                      <span>Commission: {channel.commission}</span>
                    ) : (
                      <span className="text-muted-foreground">
                      Commission: {channel.commission} • Not connected
                    </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {status === "connected" && channel.dbChannel ? (
                    <>
                      <Switch
                        checked={channel.dbChannel.syncEnabled}
                        onCheckedChange={(checked) => handleToggleSync(channel.dbChannel!.id, checked)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Channel
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDisconnect(channel.dbChannel!.id, channel.name)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnectClick(channel)}
                      size="sm"
                      className="bg-primary text-primary-foreground"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {selectedChannel && (
        <ChannelConnectDialog
          open={connectDialogOpen}
          onOpenChange={setConnectDialogOpen}
          channelName={selectedChannel.name}
          channelType={selectedChannel.type}
          onSuccess={handleConnect}
        />
      )}
    </Card>
  );
}
