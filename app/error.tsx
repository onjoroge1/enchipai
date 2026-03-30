"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <Image
          src="/images/enchipai-logo.webp"
          alt="Enchipai Mara Camp"
          width={160}
          height={80}
          className="h-16 w-auto"
        />
      </Link>

      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl font-medium text-foreground mb-3">
          Something Went Wrong
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We encountered an unexpected issue. Please try again or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
              <Home className="w-4 h-4 mr-2" />
              Back to Camp
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
