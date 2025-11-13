/**
 * TradeSafe Checkout Hook for Subscription Payments
 *
 * This hook handles the creation of TradeSafe trades for subscription payments
 * with ZAR currency and recurring billing setup.
 */

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CheckoutItem {
  productId: string;
  quantity: number;
  price?: number;
  name?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutMetadata {
  isSubscriptionPayment: boolean;
  subscriptionId: string;
  deliveryInfo: {
    address: string;
    city: string;
    postalCode: string;
    instructions?: string;
  };
}

interface CheckoutRequest {
  customerInfo: CustomerInfo;
  items: CheckoutItem[];
  metadata: CheckoutMetadata;
}

interface CheckoutResult {
  success: boolean;
  tradeId?: string;
  paymentUrl?: string;
  orderId?: string;
  error?: string;
}

export function useTradesafeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createCheckout = async (
    request: CheckoutRequest
  ): Promise<CheckoutResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get product details to calculate total amount in ZAR
      const productDetails = await Promise.all(
        request.items.map(async (item) => {
          const response = await fetch(`/api/products/${item.productId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch product ${item.productId}`);
          }
          const product = await response.json();
          return {
            ...item,
            price: product.price,
            name: product.name,
          };
        })
      );

      // Calculate total amount in ZAR
      const totalAmount = productDetails.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Create order first
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: productDetails.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount,
          currency: "ZAR",
          customerInfo: request.customerInfo,
          metadata: JSON.stringify(request.metadata),
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const order = await orderResponse.json();

      // Create TradeSafe trade for the subscription's first payment
      const tradeResponse = await fetch("/api/tradesafe/subscription-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          subscriptionId: request.metadata.subscriptionId,
          totalAmount,
          currency: "ZAR",
          customer: request.customerInfo,
          items: productDetails,
          deliveryInfo: request.metadata.deliveryInfo,
          description: `Subscription Payment - First Delivery (${productDetails.length} items)`,
          title: "Pet Food Subscription - Initial Payment",
        }),
      });

      if (!tradeResponse.ok) {
        const errorData = await tradeResponse.json();
        throw new Error(errorData.error || "Failed to create payment");
      }

      const tradeResult = await tradeResponse.json();

      toast({
        title: "Payment Created",
        description: "Redirecting to secure payment gateway...",
      });

      return {
        success: true,
        tradeId: tradeResult.tradeId,
        paymentUrl: tradeResult.paymentUrl,
        orderId: order.id,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment creation failed";
      setError(errorMessage);

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToPayment = (paymentUrl: string) => {
    // Redirect to TradeSafe payment page
    window.location.href = paymentUrl;
  };

  const clearError = () => {
    setError(null);
  };

  return {
    createCheckout,
    redirectToPayment,
    isLoading,
    error,
    clearError,
  };
}
