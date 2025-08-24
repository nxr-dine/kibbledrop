"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setError(searchParams.get("error") || "unknown_error");
    setMessage(searchParams.get("message") || "An unknown error occurred");
  }, [searchParams]);

  const getErrorTitle = (error: string) => {
    switch (error) {
      case "oauth_failed":
        return "OAuth Authorization Failed";
      case "no_code":
        return "Authorization Code Missing";
      case "token_exchange_failed":
        return "Token Exchange Failed";
      case "callback_error":
        return "Callback Processing Error";
      default:
        return "Payment Error";
    }
  };

  const getErrorDescription = (error: string) => {
    switch (error) {
      case "oauth_failed":
        return "The OAuth authorization with TradeSafe failed. This could be due to user cancellation or a configuration issue.";
      case "no_code":
        return "No authorization code was received from TradeSafe. This might indicate a problem with the OAuth flow.";
      case "token_exchange_failed":
        return "Failed to exchange the authorization code for an access token. Please check your TradeSafe credentials.";
      case "callback_error":
        return "An error occurred while processing the OAuth callback from TradeSafe.";
      default:
        return "An unexpected error occurred during the payment process.";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            {getErrorTitle(error)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">{getErrorDescription(error)}</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Error Code:</strong> {error}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Details:</strong> {message}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/delivery">Try Again</Link>
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

export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-lg mx-auto p-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <PaymentErrorContent />
    </Suspense>
  );
}
