"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";

const syncLog = [
  { id: 1, action: "Availability updated", channel: "Booking.com", time: "2 min ago", status: "success" },
  { id: 2, action: "Rate sync", channel: "Expedia", time: "5 min ago", status: "success" },
  { id: 3, action: "New booking received", channel: "SafariBookings", time: "15 min ago", status: "success" },
  { id: 4, action: "Availability conflict", channel: "Airbnb", time: "1 hour ago", status: "warning" },
  { id: 5, action: "Price update", channel: "Booking.com", time: "2 hours ago", status: "success" },
  { id: 6, action: "Booking cancelled", channel: "Expedia", time: "3 hours ago", status: "success" },
];

const pendingActions = [
  { id: 1, tent: "Ndovu Tent", action: "Block Mar 5-10", reason: "Maintenance" },
  { id: 2, tent: "All Tents", action: "Rate increase 15%", reason: "Migration season" },
  { id: 3, tent: "Simba Tent", action: "Open Apr 1-15", reason: "End of renovation" },
];

export function ChannelSync() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">All channels in sync</span>
            </div>
          </div>

          <Button 
            onClick={handleSync} 
            disabled={syncing}
            className="w-full"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All Channels
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Auto-sync every 5 minutes
          </div>
        </CardContent>
      </Card>

      {/* Pending Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pending Actions</CardTitle>
          <Badge variant="secondary">{pendingActions.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingActions.map((action) => (
            <div key={action.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{action.tent}</p>
                  <p className="text-xs text-muted-foreground">{action.action} - {action.reason}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 ml-6">
                <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                  Push to Channels
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sync Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {syncLog.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-2">
              {log.status === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.channel}</p>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                {log.time}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
