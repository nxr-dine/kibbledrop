"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, ArrowRight } from "lucide-react";

function PaymentUnavailableContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const handleContinueWithoutPayment = async () => {
    setProcessing(true);

    try {
      // Get pending subscription data
      const pendingSubscription = localStorage.getItem("pendingSubscription");

      if (pendingSubscription) {
        // Create subscription without payment
        const subscriptionData = JSON.parse(pendingSubscription);

        const response = await fetch("/api/subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscriptionData),
        });

        if (response.ok) {
          // Clear pending subscription data
          localStorage.removeItem("pendingSubscription");

          // Redirect to subscription management
          router.push(
            "/dashboard/subscription/manage?created=true&payment=pending"
          );
        } else {
          throw new Error("Failed to create subscription");
        }
      } else {
        // Fallback: redirect to delivery page
        router.push("/dashboard/delivery");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      // Redirect back to delivery page on error
      router.push("/dashboard/delivery");
    } finally {
      setProcessing(false);
    }
  };

  const handleGoBack = () => {
    router.push("/dashboard/delivery");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-orange-600">
            <AlertTriangle className="h-6 w-6" />
            Payment Gateway Unavailable
          </CardTitle>
          <CardDescription>
            We're experiencing technical difficulties with our payment gateway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-2">What happened?</h3>
            <p className="text-sm text-orange-800">
              Our payment gateway is temporarily unavailable. This may be due to
              maintenance or technical issues. We apologize for the
              inconvenience.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Your Options</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Option 1:</strong> Continue and pay later through your
                subscription dashboard
              </p>
              <p>
                <strong>Option 2:</strong> Go back and try again in a few
                minutes
              </p>
            </div>
          </div>

          {amount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {orderId && (
                  <p>
                    <strong>Order ID:</strong> {orderId}
                  </p>
                )}
                <p>
                  <strong>Amount:</strong> ${amount}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleContinueWithoutPayment}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={processing}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {processing ? "Creating Subscription..." : "Continue & Pay Later"}
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
              disabled={processing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Go Back & Try Again
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            If you continue, you can complete payment later through your
            subscription dashboard.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentUnavailablePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentUnavailableContent />
    </Suspense>
  );
}
