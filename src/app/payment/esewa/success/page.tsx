"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface VerifyResult {
  success: boolean;
  message?: string;
  error?: string;
}

function EsewaSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    const verify = async () => {
      const data = searchParams.get("data");

      if (!data) {
        setResult({ success: false, error: "Missing payment callback data" });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/payments/esewa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setResult({ success: false, error: payload.error || "Payment verification failed" });
        } else {
          setResult({ success: true, message: payload.message || "Payment verified" });
          router.refresh();
        }
      } catch {
        setResult({ success: false, error: "Could not verify payment" });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-stone-200">
        <CardHeader>
          <CardTitle className="text-center">eSewa Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-4 text-stone-600">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Verifying your payment...</p>
            </div>
          )}

          {!loading && result?.success && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="text-stone-900 font-medium">Payment successful</p>
              <p className="text-sm text-stone-600">{result.message}</p>
            </div>
          )}

          {!loading && result && !result.success && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <XCircle className="h-10 w-10 text-red-600" />
              <p className="text-stone-900 font-medium">Payment could not be confirmed</p>
              <p className="text-sm text-stone-600">{result.error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/dashboard/bookings" className="w-full">
              <Button className="w-full">Go to My Bookings</Button>
            </Link>
            <Link href="/rooms" className="w-full">
              <Button variant="outline" className="w-full">Browse Rooms</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EsewaSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
        </div>
      }
    >
      <EsewaSuccessContent />
    </Suspense>
  );
}