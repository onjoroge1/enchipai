"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token]);

  async function verifyEmail() {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-4">
            <Image
              src="/images/enchipai-logo.webp"
              alt="Enchipai Mara Camp"
              width={120}
              height={60}
              className="h-12 w-auto"
            />
          </Link>
          <CardTitle className="text-2xl font-serif">Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <Alert>
                <AlertDescription className="text-center">{message}</AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Redirecting to your dashboard...
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <Alert variant="destructive">
                <AlertDescription className="text-center">{message}</AlertDescription>
              </Alert>
              <div className="mt-6 space-y-2 text-center">
                <Button asChild>
                  <Link href="/auth/signin">Go to Sign In</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Need help? Contact us at{" "}
                  <a href="mailto:support@enchipai.com" className="text-primary hover:underline">
                    support@enchipai.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

