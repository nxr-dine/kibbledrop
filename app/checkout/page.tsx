"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Truck, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { TradesafeCheckout } from "@/components/tradesafe-checkout";

interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryInstructions: string;
  deliveryMethod: string;
}

export default function CheckoutPage() {
  const { state: cartState, dispatch } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTradesafeCheckout, setShowTradesafeCheckout] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
  }, [session, status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push("/dashboard/products");
      toast({
        title: "Your cart is empty",
        description: "Please add some products before checking out.",
        variant: "destructive",
      });
    }
  }, [cartState.items.length, router, toast]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    deliveryInstructions: "",
    deliveryMethod: "standard",
  });

  const subtotal = cartState.total;
  const shipping = deliveryInfo.deliveryMethod === "express" ? 12.99 : 5.99;
  const total = subtotal + shipping;

  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting order with data:", {
        items: cartState.items,
        deliveryInfo,
        subtotal,
        shipping,
        total
      });

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartState.items.map((item) => ({
            productId: item.productId, // Use the actual product ID
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryInfo,
          subtotal,
          shipping,
          total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Order creation failed:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }

      const order = await response.json();
      console.log("Order created successfully:", order);

      toast({
        title: "Order Placed!",
        description: `Order #${order.id} has been created successfully.`,
      });

      // Clear cart and redirect to order confirmation
      dispatch({ type: "CLEAR_CART" });
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTradesafeCheckout = () => {
    setShowTradesafeCheckout(true);
  };

  const handleTradesafeSuccess = (orderId: string) => {
    toast({
      title: "Payment Successful!",
      description: `Order #${orderId} has been created and payment processed.`,
    });
    dispatch({ type: "CLEAR_CART" });
    router.push(`/orders/${orderId}`);
  };

  const handleTradesafeError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  if (cartState.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some products to your cart to proceed with checkout.
          </p>
          <Button asChild>
            <Link href="/dashboard/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Delivery Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={deliveryInfo.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={deliveryInfo.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={deliveryInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={deliveryInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={deliveryInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={deliveryInfo.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={deliveryInfo.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="deliveryInstructions">
                  Delivery Instructions
                </Label>
                <Textarea
                  id="deliveryInstructions"
                  value={deliveryInfo.deliveryInstructions}
                  onChange={(e) =>
                    handleInputChange("deliveryInstructions", e.target.value)
                  }
                  placeholder="Any special instructions for delivery..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={deliveryInfo.deliveryMethod}
                onValueChange={(value) =>
                  handleInputChange("deliveryMethod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center justify-between w-full">
                      <span>Standard Delivery</span>
                      <span className="text-sm text-gray-500">$5.99</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="express">
                    <div className="flex items-center justify-between w-full">
                      <span>Express Delivery</span>
                      <span className="text-sm text-gray-500">$12.99</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-2">
                {deliveryInfo.deliveryMethod === "express"
                  ? "Next day delivery"
                  : "3-5 business days"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cartState.items.length} item
                {cartState.items.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!showTradesafeCheckout ? (
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? "Processing..." : "Place Order (Pay Later)"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleTradesafeCheckout}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now with Tradesafe
                  </Button>
                </div>
              ) : (
                <TradesafeCheckout
                  items={cartState.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price
                  }))}
                  onSuccess={handleTradesafeSuccess}
                  onError={handleTradesafeError}
                />
              )}

              <p className="text-xs text-gray-500 text-center">
                By placing your order, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
