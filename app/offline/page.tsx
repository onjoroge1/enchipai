"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
          You're Offline
        </h1>
        <p className="text-muted-foreground mb-6">
          It looks like you've lost your internet connection. Don't worry - you can still access cached pages and data.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full"
          >
            <Link href="/admin">
              Go to Dashboard
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Cached pages are available offline. New data will sync when connection is restored.
        </p>
      </div>
    </div>
  );
}

