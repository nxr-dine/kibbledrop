"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatZAR } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function SubscriptionSetupPage() {
  const { state } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [deliveryFrequency, setDeliveryFrequency] = useState("monthly");
  const [customWeeks, setCustomWeeks] = useState(4);
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pets, setPets] = useState<Array<{ id: string; name: string }>>([]);
  const [petProfileId, setPetProfileId] = useState<string>("");

  useEffect(() => {
    const loadPets = async () => {
      try {
        const res = await fetch("/api/pets");
        if (!res.ok) return;
        const data = await res.json();
        setPets(data || []);
        if (data && data.length > 0) {
          setPetProfileId(data[0].id);
        }
      } catch (e) {
        // ignore
      }
    };
    loadPets();
  }, []);

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

  const subtotal = state.total;

  // Calculate frequency-based price adjustment
  const getFrequencyMultiplier = () => {
    switch (deliveryFrequency) {
      case "weekly":
        return 1.15; // 15% more for weekly (more frequent shipping)
      case "bi-weekly":
        return 1.05; // 5% more for bi-weekly
      case "tri-weekly":
        return 1.0; // Standard price
      case "monthly":
        return 0.9; // 10% discount for monthly (best value)
      case "custom-weeks":
        // Calculate based on custom weeks (more frequent = higher cost)
        if (customWeeks <= 1) return 1.15;
        if (customWeeks === 2) return 1.05;
        if (customWeeks === 3) return 1.0;
        return 0.9; // 4+ weeks get monthly discount
      case "custom-date":
        return 1.0; // Standard price for custom dates
      default:
        return 0.9;
    }
  };

  const frequencyMultiplier = getFrequencyMultiplier();
  const adjustedSubtotal = subtotal * frequencyMultiplier;
  // Tax removed as per requirement
  const finalTotal = adjustedSubtotal;

  const handleProceedToDelivery = () => {
    // Save the selected frequency and custom options to localStorage for the next step
    const subscriptionData = {
      petProfileId,
      frequency: deliveryFrequency,
      customWeeks: customWeeks,
      customDate: customDate?.toISOString(),
    };
    localStorage.setItem(
      "subscriptionFrequency",
      JSON.stringify(subscriptionData)
    );
    router.push("/dashboard/delivery");
  };

  const getFrequencyDisplay = () => {
    switch (deliveryFrequency) {
      case "weekly":
        return "week";
      case "bi-weekly":
        return "2 weeks";
      case "tri-weekly":
        return "3 weeks";
      case "monthly":
        return "month";
      case "custom-weeks":
        return `${customWeeks} weeks`;
      case "custom-date":
        return "custom schedule";
      default:
        return "month";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Set Up Your Subscription
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Selected Products */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Selected Products</CardTitle>
              <CardDescription>
                Review the items in your monthly subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pet selection */}
              <div className="space-y-2">
                <Label htmlFor="pet">Select Pet</Label>
                <select
                  id="pet"
                  value={petProfileId}
                  onChange={(e) => setPetProfileId(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm sm:text-base ml-2">
                    {formatZAR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Monthly Subtotal:</span>
                <span className="text-orange-600">
                  {formatZAR(adjustedSubtotal)}
                </span>
              </div>
              {frequencyMultiplier !== 1.0 && (
                <p className="text-xs text-gray-600">
                  {frequencyMultiplier > 1.0
                    ? `+${((frequencyMultiplier - 1) * 100).toFixed(
                        0
                      )}% for ${getFrequencyDisplay()} delivery`
                    : `${((1 - frequencyMultiplier) * 100).toFixed(
                        0
                      )}% discount for ${getFrequencyDisplay()} delivery`}
                </p>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link href="/cart">Edit Cart</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Frequency & Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Frequency</CardTitle>
              <CardDescription>
                Choose how often you'd like your pet food delivered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={deliveryFrequency}
                onValueChange={setDeliveryFrequency}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label
                    htmlFor="weekly"
                    className="text-sm sm:text-base flex-1"
                  >
                    Weekly Delivery
                    <span className="block text-xs text-gray-500">
                      +15% (more frequent shipping)
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bi-weekly" id="bi-weekly" />
                  <Label
                    htmlFor="bi-weekly"
                    className="text-sm sm:text-base flex-1"
                  >
                    Every 2 Weeks
                    <span className="block text-xs text-gray-500">+5%</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tri-weekly" id="tri-weekly" />
                  <Label
                    htmlFor="tri-weekly"
                    className="text-sm sm:text-base flex-1"
                  >
                    Every 3 Weeks
                    <span className="block text-xs text-gray-500">
                      Standard price
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label
                    htmlFor="monthly"
                    className="text-sm sm:text-base flex-1"
                  >
                    Monthly Delivery (Recommended)
                    <span className="block text-xs text-green-600">
                      Save 10% - Best value!
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom-weeks" id="custom-weeks" />
                  <Label
                    htmlFor="custom-weeks"
                    className="text-sm sm:text-base"
                  >
                    Custom Weeks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom-date" id="custom-date" />
                  <Label htmlFor="custom-date" className="text-sm sm:text-base">
                    Custom Date Schedule
                  </Label>
                </div>
              </RadioGroup>

              {/* Custom Weeks Input */}
              {deliveryFrequency === "custom-weeks" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="custom-weeks-input"
                    className="text-sm font-medium"
                  >
                    Deliver every how many weeks?
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="custom-weeks-input"
                      type="number"
                      min="1"
                      max="52"
                      value={customWeeks}
                      onChange={(e) =>
                        setCustomWeeks(parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">weeks</span>
                  </div>
                </div>
              )}

              {/* Custom Date Picker */}
              {deliveryFrequency === "custom-date" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Select next delivery date
                  </Label>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDate ? (
                          format(customDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={(date) => {
                          setCustomDate(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500">
                    You can adjust this schedule after setup
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Subtotal:</span>
                  <span>{formatZAR(subtotal)}</span>
                </div>
                {frequencyMultiplier !== 1.0 && (
                  <div className="flex justify-between text-sm">
                    <span>Frequency Adjustment:</span>
                    <span
                      className={
                        frequencyMultiplier > 1.0
                          ? "text-orange-600"
                          : "text-green-600"
                      }
                    >
                      {frequencyMultiplier > 1.0 ? "+" : ""}
                      {formatZAR(adjustedSubtotal - subtotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Included in total</span>
                </div>

                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Estimated Total:</span>
                  <span className="text-orange-600">
                    {formatZAR(finalTotal)}
                  </span>
                </div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Billed:</span>
                    <span className="font-medium capitalize">
                      {deliveryFrequency === "monthly"
                        ? "Monthly"
                        : getFrequencyDisplay()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery:</span>
                    <span className="font-medium capitalize">
                      {getFrequencyDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProceedToDelivery}
                className="w-full"
                size="lg"
              >
                Proceed to Delivery Information
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
