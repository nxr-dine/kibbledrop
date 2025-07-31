"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionSetupPage() {
  const { state } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [deliveryFrequency, setDeliveryFrequency] = useState("monthly")

  if (state.items.length === 0) {
    router.push("/dashboard/products")
    toast({
      title: "Your cart is empty!",
      description: "Please add products to your cart before setting up a subscription.",
      variant: "destructive",
    })
    return null
  }

  const subtotal = state.total
  const tax = subtotal * 0.08 // 8% tax
  const finalTotal = subtotal + tax

  const handleProceedToDelivery = () => {
    // In a real app, you'd save the selected frequency here
    console.log("Selected delivery frequency:", deliveryFrequency)
    router.push("/dashboard/delivery")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Set Up Your Subscription</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Selected Products */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Selected Products</CardTitle>
              <CardDescription>Review the items in your monthly subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Monthly Subtotal:</span>
                <span className="text-orange-600">${subtotal.toFixed(2)}</span>
              </div>
              <Button asChild variant="outline" className="w-full bg-transparent">
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
              <CardDescription>Choose how often you'd like your pet food delivered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={deliveryFrequency}
                onValueChange={setDeliveryFrequency}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bi-weekly" id="bi-weekly" />
                  <Label htmlFor="bi-weekly">Bi-Weekly Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly Delivery (Recommended)</Label>
                </div>
              </RadioGroup>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Estimated Total:</span>
                  <span className="text-orange-600">
                    ${finalTotal.toFixed(2)}/
                    {deliveryFrequency === "weekly" ? "week" : deliveryFrequency === "bi-weekly" ? "2 weeks" : "month"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Billed {deliveryFrequency}</p>
              </div>

              <Button onClick={handleProceedToDelivery} className="w-full" size="lg">
                Proceed to Delivery Information
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
