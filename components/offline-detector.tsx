"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wifi, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setShowOfflineBanner(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Also check periodically (for cases where events don't fire)
    const interval = setInterval(() => {
      const online = navigator.onLine;
      if (online !== isOnline) {
        setIsOnline(online);
        setShowOfflineBanner(!online);
      }
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  if (!showOfflineBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert
        variant={isOnline ? "default" : "destructive"}
        className="max-w-4xl mx-auto shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            <div>
              <AlertTitle>
                {isOnline ? "Back Online" : "You're Offline"}
              </AlertTitle>
              <AlertDescription>
                {isOnline
                  ? "Your connection has been restored. Data will sync automatically."
                  : "You're currently offline. Some features may be limited. Cached data is available."}
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOfflineBanner(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}

