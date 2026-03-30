"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CacheManager() {
  const [caching, setCaching] = useState(false);
  const [cached, setCached] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<string>("");

  useEffect(() => {
    // Check if service worker is available and active
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setCacheStatus("Service Worker Active");
        }
      });
    }
  }, []);

  const handlePreloadPages = async () => {
    if (!("serviceWorker" in navigator)) {
      alert("Service Worker not supported in this browser");
      return;
    }

    setCaching(true);
    setCacheStatus("Preloading pages...");

    try {
      const adminPages = [
        "/admin",
        "/admin/bookings",
        "/admin/guests",
        "/admin/tents",
        "/admin/invoices",
        "/admin/analytics",
        "/admin/experiences",
        "/admin/inventory",
        "/admin/settings",
        "/admin/wildlife",
        "/admin/transfers",
        "/admin/channels",
        "/admin/emails",
        "/admin/notifications",
        "/admin/reports",
        "/admin/blog",
      ];

      // Preload pages by fetching them (service worker will cache them)
      const preloadPromises = adminPages.map(async (page) => {
        try {
          const response = await fetch(page, { cache: "force-cache" });
          return { page, success: response.ok };
        } catch (error) {
          return { page, success: false, error };
        }
      });

      const results = await Promise.all(preloadPromises);
      const successful = results.filter((r) => r.success).length;

      setCacheStatus(
        `Cached ${successful}/${adminPages.length} pages successfully`
      );
      setCached(true);
    } catch (error) {
      console.error("Preload error:", error);
      setCacheStatus("Failed to preload pages");
    } finally {
      setCaching(false);
    }
  };

  const handleClearCache = async () => {
    if (!("caches" in window)) {
      alert("Cache API not supported");
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      setCacheStatus("Cache cleared");
      setCached(false);
      alert("Cache cleared successfully");
    } catch (error) {
      console.error("Clear cache error:", error);
      alert("Failed to clear cache");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Offline Cache Manager</CardTitle>
        <CardDescription>
          Preload admin pages for offline access. Useful when you have a good connection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cacheStatus && (
          <Alert>
            <AlertDescription>{cacheStatus}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handlePreloadPages}
            disabled={caching}
            className="flex-1"
          >
            {caching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Caching...
              </>
            ) : cached ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Re-cache Pages
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Preload All Pages
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={caching}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Preloads all admin pages for offline access</p>
          <p>• Pages are cached in your browser</p>
          <p>• Works best when you have a stable connection</p>
          <p>• Cached pages available even without internet</p>
        </div>
      </CardContent>
    </Card>
  );
}

