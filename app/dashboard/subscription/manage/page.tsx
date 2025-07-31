"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Package, Truck, Pause, Play, XCircle } from "lucide-react"
import { orders as initialOrders } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ManageSubscriptionPage() {
  const [orders, setOrders] = useState(initialOrders)
  const { toast } = useToast()
  const router = useRouter()
  const { isLoggedIn } = useAuth() // Get login state from AuthContext

  // Add useEffect to check login status
  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Access Denied",
        description: "Please log in to manage your subscriptions.",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [isLoggedIn, router, toast])

  // If not logged in, return null to prevent rendering the page content before redirect
  if (!isLoggedIn) {
    return null
  }

  const handleUpdateStatus = (orderId: string, newStatus: "active" | "paused" | "cancelled") => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )
    toast({
      title: "Subscription Updated",
      description: `Subscription ${orderId} status changed to ${newStatus}.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "delivered":
        return "outline"
      default:
        return "outline"
    }
  }

  const activeSubscriptions = orders.filter((order) => order.status === "active" || order.status === "paused")
  const pastOrders = orders.filter((order) => order.status === "delivered" || order.status === "cancelled")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Your Subscriptions</h1>

      {/* Active/Paused Subscriptions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Active & Paused Subscriptions</h2>
        {activeSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You don't have any active or paused subscriptions.</p>
              <Button asChild>
                <Link href="/dashboard/products">Start a Subscription</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeSubscriptions.map((order) => (
              <Card
                key={order.id}
                className={`border-l-4 ${order.status === "active" ? "border-l-green-500" : "border-l-yellow-500"}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Subscription #{order.id}
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status === "active" ? "Active" : "Paused"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Started on {new Date(order.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">per month</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items in this subscription:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Delivery */}
                    {order.nextDelivery && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        <span>Next delivery: {new Date(order.nextDelivery).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Modify Items
                      </Button>
                      {order.status === "active" ? (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(order.id, "paused")}>
                          <Pause className="h-4 w-4 mr-2" /> Pause
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(order.id, "active")}>
                          <Play className="h-4 w-4 mr-2" /> Resume
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(order.id, "cancelled")}>
                        <XCircle className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Past Orders & Cancelled Subscriptions</h2>
        {pastOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No past orders or cancelled subscriptions.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pastOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id}
                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {order.status === "delivered" ? "Delivered on" : "Cancelled on"}{" "}
                        {new Date(order.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">total</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
