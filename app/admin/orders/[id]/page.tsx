"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Truck, MapPin, Phone, Calendar, Loader2, Save, X, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
    category: string
    petType: string
  }
}

interface Order {
  id: string
  status: string
  subtotal: number
  shipping: number
  total: number
  deliveryName: string
  deliveryPhone: string
  deliveryAddress: string
  city: string
  postalCode: string
  instructions?: string
  deliveryMethod: string
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  items: OrderItem[]
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [formData, setFormData] = useState({
    status: "",
    trackingNumber: "",
    estimatedDelivery: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`)
      if (!response.ok) {
        throw new Error("Order not found")
      }
      const orderData = await response.json()
      setOrder(orderData)
      setFormData({
        status: orderData.status,
        trackingNumber: orderData.trackingNumber || "",
        estimatedDelivery: orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery).toISOString().split('T')[0] : ""
      })
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)
        toast({
          title: "Order Updated",
          description: "Order details have been updated successfully.",
        })
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order details.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return
    }

    setCanceling(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: "Order canceled by admin" }),
      })

      if (response.ok) {
        const result = await response.json()
        setOrder(result.order)
        toast({
          title: "Order Canceled",
          description: "Order has been canceled successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Error canceling order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel order.",
        variant: "destructive",
      })
    } finally {
      setCanceling(false)
    }
  }

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/invoice`)
      if (response.ok) {
        const invoice = await response.json()
        
        // Create a downloadable invoice
        const invoiceText = `
KibbleDrop Invoice
==================

Invoice Number: ${invoice.invoiceNumber}
Order ID: ${invoice.orderId}
Date: ${new Date(invoice.date).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Customer Information:
${invoice.customer.name}
${invoice.customer.email}
${invoice.customer.address}
${invoice.customer.city}, ${invoice.customer.postalCode}

Items:
${invoice.items.map(item => 
  `${item.name} (${item.category} - ${item.petType}) x${item.quantity} @ $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`
).join('\n')}

Subtotal: $${invoice.subtotal.toFixed(2)}
Shipping: $${invoice.shipping.toFixed(2)}
Total: $${invoice.total.toFixed(2)}

Status: ${invoice.status}
Payment Status: ${invoice.paymentStatus}
        `.trim()

        const blob = new Blob([invoiceText], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice.invoiceNumber}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Invoice Generated",
          description: "Invoice has been downloaded successfully.",
        })
      } else {
        throw new Error("Failed to generate invoice")
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to generate invoice.",
        variant: "destructive",
      })
    } finally {
      setGeneratingInvoice(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "shipped": return "bg-purple-100 text-purple-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "canceled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading order details...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600 mt-2">Manage order details and delivery status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Order Status</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Order Date</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Method</span>
                <span className="capitalize">{order.deliveryMethod} Delivery</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 justify-center sm:justify-start">
                        <Badge variant="outline">{item.product.category}</Badge>
                        <Badge variant="secondary">{item.product.petType}</Badge>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="font-medium">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Customer Details</h4>
                  <p className="text-sm">{order.user.name}</p>
                  <p className="text-sm text-gray-600">{order.user.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Delivery Information</h4>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm">{order.deliveryName}</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                      <p className="text-sm text-gray-600">{order.city}, {order.postalCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{order.deliveryPhone}</span>
                  </div>
                  {order.instructions && (
                    <div className="mt-2">
                      <p className="font-medium text-sm">Delivery Instructions:</p>
                      <p className="text-sm text-gray-600">{order.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Management */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Update */}
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tracking Number */}
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>

              {/* Estimated Delivery */}
              <div>
                <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                className="w-full" 
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              {/* Generate Invoice Button */}
              <Button 
                onClick={handleGenerateInvoice} 
                variant="outline"
                className="w-full" 
                disabled={generatingInvoice}
              >
                <FileText className="h-4 w-4 mr-2" />
                {generatingInvoice ? "Generating..." : "Generate Invoice"}
              </Button>

              {/* Cancel Order Button - Only show for pending/processing orders */}
              {["pending", "processing"].includes(order.status) && (
                <Button 
                  onClick={handleCancelOrder} 
                  variant="destructive"
                  className="w-full" 
                  disabled={canceling}
                >
                  <X className="h-4 w-4 mr-2" />
                  {canceling ? "Canceling..." : "Cancel Order"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 