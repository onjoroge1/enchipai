"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Service Worker registered:", registration.scope);

          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log("[SW] New service worker available");
                  // Optionally show a notification to user
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[SW] Service Worker registration failed:", error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[SW] Message from service worker:", event.data);
      });
    }
  }, []);

  return null;
}

