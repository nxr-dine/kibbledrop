"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useTradesafe } from "@/hooks/use-tradesafe";
import { useSession } from "next-auth/react";
import { CreditCard } from "lucide-react";

export default function DeliveryInformationPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { createCheckout, isLoading: paymentLoading } = useTradesafe();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"later" | "now">("later");

  // Check cart on client side
  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/dashboard/products");
      toast({
        title: "Your cart is empty!",
        description:
          "Please add products to your cart before setting up a subscription.",
        variant: "destructive",
      });
    }
  }, [state.items.length, router, toast]);

  // Don't render if cart is empty
  if (state.items.length === 0) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the frequency from localStorage
      const frequencyData =
        localStorage.getItem("subscriptionFrequency") ||
        '{"frequency":"monthly"}';
      const parsedFrequency = JSON.parse(frequencyData);

      // Prepare subscription data
      const subscriptionData = {
        petProfileId: parsedFrequency.petProfileId,
        frequency: parsedFrequency.frequency || "monthly",
        deliveryName: formData.fullName,
        deliveryPhone: formData.phone,
        deliveryAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        instructions: formData.instructions,
        items: state.items.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
        })),
      };

      if (paymentMethod === "now") {
        // Process payment first with TradeSafe
        await handlePaymentCheckout(subscriptionData);
      } else {
        // Create subscription without payment
        await createSubscriptionWithoutPayment(subscriptionData);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCheckout = async (subscriptionData: any) => {
    try {
      if (!session?.user?.email) {
        throw new Error("User session required for payment");
      }

      // First create a pending subscription
      const subscriptionResponse = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json();
        throw new Error(error.error || "Failed to create subscription");
      }

      const subscription = await subscriptionResponse.json();

      // Now process payment with subscription ID
      const result = await createCheckout({
        customerInfo: {
          name: formData.fullName,
          email: session.user.email,
          phone: formData.phone,
        },
        items: state.items.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
        })),
        metadata: {
          isSubscriptionPayment: true,
          subscriptionId: subscription.id,
          deliveryInfo: {
            street: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            instructions: formData.instructions,
          },
          subscriptionData: subscriptionData,
        },
      });

      if (result.success && result.redirectUrl) {
        // Store subscription data for completion after payment
        localStorage.setItem(
          "pendingSubscription",
          JSON.stringify({
            ...subscriptionData,
            subscriptionId: subscription.id,
          })
        );

        toast({
          title: "Redirecting to Payment",
          description:
            "You will be redirected to TradeSafe for payment processing.",
        });

        // Redirect to TradeSafe payment page
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(result.error || "Payment initialization failed");
      }
    } catch (error) {
      throw new Error(
        `Payment processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const createSubscriptionWithoutPayment = async (subscriptionData: any) => {
    // Create subscription
    const response = await fetch("/api/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    if (response.ok) {
      const subscription = await response.json();

      // Clear cart and localStorage
      dispatch({ type: "CLEAR_CART" });
      localStorage.removeItem("subscriptionFrequency");

      toast({
        title: "Subscription Created!",
        description: "Your subscription has been set up successfully.",
      });

      // Redirect to subscription management
      router.push("/dashboard/subscription/manage");
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to create subscription");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Delivery Information
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Delivery Details</CardTitle>
          <CardDescription>
            Please provide your shipping address and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, P.O. Box, company name, c/o"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="instructions">
                Delivery Instructions (Optional)
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="e.g., Leave package by the back door"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Payment Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pay-later"
                    name="payment"
                    value="later"
                    checked={paymentMethod === "later"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "later" | "now")
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="pay-later" className="text-sm font-normal">
                    Create subscription (Pay later)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pay-now"
                    name="payment"
                    value="now"
                    checked={paymentMethod === "now"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "later" | "now")
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="pay-now" className="text-sm font-normal">
                    Pay now with TradeSafe (${state.total.toFixed(2)})
                  </Label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || paymentLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading || paymentLoading
                ? "Processing..."
                : paymentMethod === "now"
                ? `Pay $${state.total.toFixed(2)} & Create Subscription`
                : "Create Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
