"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, Loader2, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PaymentState = "loading" | "success" | "failed" | "pending";

export default function PesaPalCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-secondary/50">Loading...</div>}>
      <PesaPalCallbackContent />
    </Suspense>
  );
}

function PesaPalCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<PaymentState>("loading");
  const [details, setDetails] = useState<any>(null);

  const bookingId = searchParams.get("bookingId");
  const orderTrackingId = searchParams.get("OrderTrackingId");

  useEffect(() => {
    if (!bookingId) {
      setState("failed");
      return;
    }

    checkPaymentStatus();
  }, [bookingId, orderTrackingId]);

  async function checkPaymentStatus() {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (bookingId) params.set("bookingId", bookingId);
      if (orderTrackingId) params.set("orderTrackingId", orderTrackingId);

      const response = await fetch(`/api/payments/pesapal/status?${params}`);
      if (!response.ok) throw new Error("Failed to check status");

      const data = await response.json();
      setDetails(data.data);

      // Determine state from response
      const paymentStatus = data.data?.paymentStatus || data.data?.pesapalStatus;

      if (
        paymentStatus === "PAID" ||
        paymentStatus === "Completed" ||
        data.data?.statusCode === 1
      ) {
        setState("success");
      } else if (
        paymentStatus === "FAILED" ||
        paymentStatus === "Failed" ||
        data.data?.statusCode === 2
      ) {
        setState("failed");
      } else {
        setState("pending");
        // Poll again after 5 seconds for pending payments
        setTimeout(checkPaymentStatus, 5000);
      }
    } catch {
      setState("failed");
    }
  }

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

      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          {state === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <h1 className="font-serif text-2xl font-medium text-foreground mb-2">
                Processing Payment
              </h1>
              <p className="text-muted-foreground text-sm">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-serif text-2xl font-medium text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground text-sm mb-2">
                Your payment has been confirmed. Your booking is now secured.
              </p>
              {details?.confirmationCode && (
                <p className="text-xs text-muted-foreground mb-6">
                  Confirmation: <span className="font-mono font-medium text-foreground">{details.confirmationCode}</span>
                </p>
              )}
              <div className="flex flex-col gap-3">
                {bookingId && (
                  <Link href={`/bookings/${bookingId}/confirmation`}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full">
                      View Booking Details
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-full w-full bg-transparent">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}

          {state === "failed" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="font-serif text-2xl font-medium text-foreground mb-2">
                Payment Failed
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Your payment could not be processed. Please try again or contact support.
              </p>
              <div className="flex flex-col gap-3">
                {bookingId && (
                  <Link href={`/bookings/${bookingId}/confirmation`}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </Link>
                )}
                <Link href="/contact">
                  <Button variant="outline" className="rounded-full w-full bg-transparent">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </>
          )}

          {state === "pending" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="font-serif text-2xl font-medium text-foreground mb-2">
                Payment Pending
              </h1>
              <p className="text-muted-foreground text-sm mb-2">
                Your payment is being processed. This may take a moment for M-Pesa and mobile money payments.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                <Loader2 className="w-3 h-3 animate-spin" />
                Checking status automatically...
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-full w-full bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
