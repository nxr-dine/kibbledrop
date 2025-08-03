"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Package, Truck, Pause, Play, XCircle, SkipForward, Edit, CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Subscription {
  id: string
  userId: string
  frequency: string
  status: string
  deliveryName: string
  deliveryPhone: string
  deliveryAddress: string
  city: string
  postalCode: string
  instructions?: string
  nextDeliveryDate: string
  customDeliveryDate?: string
  skippedDeliveries?: string[]
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt: string
  items: SubscriptionItem[]
}

interface SubscriptionItem {
  id: string
  subscriptionId: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
  }
}

export default function ManageSubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [customDeliveryDate, setCustomDeliveryDate] = useState("")
  const [modifyItemsOpen, setModifyItemsOpen] = useState(false)
  const [modifiedItems, setModifiedItems] = useState<any[]>([])
  const { toast } = useToast()
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  // Fetch subscriptions on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchSubscriptions()
    }
  }, [isLoggedIn])

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

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/subscription/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        await fetchSubscriptions() // Refresh the list
        toast({
          title: "Subscription Updated",
          description: `Subscription status changed to ${newStatus}.`,
        })
      } else {
        throw new Error('Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      })
    }
  }

  const handleSkipDelivery = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscription/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipNextDelivery: true })
      })
      
      if (response.ok) {
        await fetchSubscriptions() // Refresh the list
        toast({
          title: "Delivery Skipped",
          description: "Your next delivery has been skipped successfully.",
        })
      } else {
        throw new Error('Failed to skip delivery')
      }
    } catch (error) {
      console.error('Error skipping delivery:', error)
      toast({
        title: "Error",
        description: "Failed to skip delivery",
        variant: "destructive"
      })
    }
  }

  const handleCustomDeliveryDate = async (subscriptionId: string) => {
    if (!customDeliveryDate) {
      toast({
        title: "Error",
        description: "Please select a delivery date",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/subscription/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDeliveryDate })
      })
      
      if (response.ok) {
        await fetchSubscriptions() // Refresh the list
        setCustomDeliveryDate("")
        setSelectedSubscription(null)
        toast({
          title: "Delivery Date Updated",
          description: "Your delivery date has been updated successfully.",
        })
      } else {
        throw new Error('Failed to update delivery date')
      }
    } catch (error) {
      console.error('Error updating delivery date:', error)
      toast({
        title: "Error",
        description: "Failed to update delivery date",
        variant: "destructive"
      })
    }
  }

  const handleModifyItems = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscription/${subscriptionId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: modifiedItems })
      })
      
      if (response.ok) {
        await fetchSubscriptions() // Refresh the list
        setModifyItemsOpen(false)
        setModifiedItems([])
        toast({
          title: "Items Updated",
          description: "Your subscription items have been updated successfully.",
        })
      } else {
        throw new Error('Failed to update items')
      }
    } catch (error) {
      console.error('Error updating items:', error)
      toast({
        title: "Error",
        description: "Failed to update items",
        variant: "destructive"
      })
    }
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

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active" || sub.status === "paused")
  const pastSubscriptions = subscriptions.filter((sub) => sub.status === "cancelled")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Your Subscriptions</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscriptions...</p>
        </div>
      ) : (
        <>
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
                {activeSubscriptions.map((subscription) => (
                  <Card
                    key={subscription.id}
                    className={`border-l-4 ${subscription.status === "active" ? "border-l-green-500" : "border-l-yellow-500"}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Subscription #{subscription.id}
                            <Badge variant={getStatusColor(subscription.status)}>
                              {subscription.status === "active" ? "Active" : "Paused"}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Started on {new Date(subscription.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            ${subscription.items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">per {subscription.frequency}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Items */}
                        <div>
                          <h4 className="font-medium mb-2">Items in this subscription:</h4>
                          <div className="space-y-1">
                            {subscription.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>
                                  {item.product.name} x{item.quantity}
                                </span>
                                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Next Delivery */}
                        {subscription.nextDeliveryDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <Calendar className="h-4 w-4" />
                            <span>Next delivery: {new Date(subscription.nextDeliveryDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Skipped Deliveries */}
                        {subscription.skippedDeliveries && subscription.skippedDeliveries.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Skipped deliveries: {subscription.skippedDeliveries.length}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 flex-wrap">
                          <Dialog open={modifyItemsOpen} onOpenChange={setModifyItemsOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(subscription)
                                  setModifiedItems(subscription.items.map(item => ({
                                    productId: item.productId,
                                    quantity: item.quantity
                                  })))
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" /> Modify Items
                              </Button>
                            </DialogTrigger>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSubscription(subscription)}
                              >
                                <CalendarDays className="h-4 w-4 mr-2" /> Change Date
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Delivery Date</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="customDate">New Delivery Date</Label>
                                  <Input
                                    id="customDate"
                                    type="date"
                                    value={customDeliveryDate}
                                    onChange={(e) => setCustomDeliveryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleCustomDeliveryDate(subscription.id)}
                                  className="w-full"
                                >
                                  Update Delivery Date
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSkipDelivery(subscription.id)}
                            disabled={subscription.status !== "active"}
                          >
                            <SkipForward className="h-4 w-4 mr-2" /> Skip Next
                          </Button>

                          {subscription.status === "active" ? (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(subscription.id, "paused")}>
                              <Pause className="h-4 w-4 mr-2" /> Pause
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(subscription.id, "active")}>
                              <Play className="h-4 w-4 mr-2" /> Resume
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(subscription.id, "cancelled")}>
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

          {/* Cancelled Subscriptions */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cancelled Subscriptions</h2>
            {pastSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No cancelled subscriptions.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastSubscriptions.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Subscription #{subscription.id}
                            <Badge variant={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Cancelled on {new Date(subscription.updatedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            ${subscription.items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">total</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {subscription.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.product.name} x{item.quantity}
                            </span>
                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
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

          {/* Modify Items Dialog */}
          <Dialog open={modifyItemsOpen} onOpenChange={setModifyItemsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Modify Subscription Items</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedSubscription?.items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <Label>{item.product.name}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={modifiedItems[index]?.quantity || 0}
                        onChange={(e) => {
                          const newItems = [...modifiedItems]
                          newItems[index] = {
                            ...newItems[index],
                            productId: item.productId,
                            quantity: parseInt(e.target.value) || 0
                          }
                          setModifiedItems(newItems)
                        }}
                      />
                      <span className="text-sm text-gray-600">x ${item.product.price}</span>
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={() => selectedSubscription && handleModifyItems(selectedSubscription.id)}
                  className="w-full"
                >
                  Update Items
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
