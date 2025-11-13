"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const subscriptionId = searchParams.get("subscriptionId");

    if (!orderId && !subscriptionId) {
      setError("Missing order or subscription information");
      setLoading(false);
      return;
    }

    // If we have an orderId, complete the payment and activate subscription
    if (orderId) {
      completePayment(orderId);
    } else if (subscriptionId) {
      // Direct subscription activation
      activateSubscription(subscriptionId);
    }
  }, [searchParams]);

  const completePayment = async (orderId: string) => {
    try {
      const response = await fetch("/api/subscription/complete-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        setSuccess(true);
        toast({
          title: "Payment Completed",
          description: "Your subscription has been activated successfully!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete payment");
      }
    } catch (error) {
      console.error("Error completing payment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to complete payment"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to complete payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch("/api/subscription/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (response.ok) {
        setSuccess(true);
        toast({
          title: "Subscription Activated",
          description: "Your subscription has been activated successfully!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate subscription");
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to activate subscription"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to activate subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">
              Processing Your Subscription
            </h2>
            <p className="text-gray-600">
              Please wait while we activate your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Subscription Activation Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard/subscription/manage">
                  View Subscriptions
                </Link>
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Subscription Activated Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-600">
                Great news! Your subscription has been activated and your first
                delivery is being scheduled.
              </p>
              <p className="text-gray-600">
                You can manage your subscription, change delivery dates, or
                modify items at any time from your dashboard.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard/subscription/manage">
                  Manage Subscriptions
                </Link>
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

  return null;
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <Loader2 className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              <p className="text-gray-600">Please wait...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
