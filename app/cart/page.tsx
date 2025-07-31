"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CartItem } from "@/components/cart-item"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { state } = useCart()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Subscription Cart</h1>

      {state.items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600">Add some delicious pet food to get started!</p>
            <Button asChild>
              <Link href="/dashboard/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Items in your subscription ({state.items.length})
            </h2>
            {state.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Subscription Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Subtotal:</span>
                    <span className="font-semibold">${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery:</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Monthly Total:</span>
                    <span className="text-orange-600">${state.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/dashboard/subscription/setup">Proceed to Setup</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard/products">Continue Shopping</Link>
                  </Button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Cancel or modify anytime</p>
                  <p>• Skip deliveries when needed</p>
                  <p>• Free shipping on all orders</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
