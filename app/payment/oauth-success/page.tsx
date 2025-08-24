"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function OAuthSuccessContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<string>("");

  useEffect(() => {
    setState(searchParams.get("state") || "");
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            OAuth Authorization Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              Your TradeSafe OAuth authorization was successful! You can now
              proceed with payments.
            </p>
            {state && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>State:</strong> {state}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/delivery">Continue with Payment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  );
}
