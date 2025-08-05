"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"

export default function DeliveryInformationPage() {
  const { state } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  
  // Redirect if cart is empty
  if (state.items.length === 0) {
    router.push("/dashboard/products")
    toast({
      title: "Your cart is empty!",
      description: "Please add products to your cart before setting up a subscription.",
      variant: "destructive",
    })
    return null
  }
  
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    instructions: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get the frequency from localStorage
      const frequency = localStorage.getItem('subscriptionFrequency') || 'monthly'
      
      // Prepare subscription data
      const subscriptionData = {
        frequency,
        deliveryName: formData.fullName,
        deliveryPhone: formData.phone,
        deliveryAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        instructions: formData.instructions,
        items: state.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }

      // Create subscription
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      })

      if (response.ok) {
        const subscription = await response.json()
        
        // Clear cart and localStorage
        localStorage.removeItem('subscriptionFrequency')
        
        toast({
          title: "Subscription Created!",
          description: "Your subscription has been set up successfully.",
        })
        
        // Redirect to subscription management
        router.push("/dashboard/subscription/manage")
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Delivery Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Delivery Details</CardTitle>
          <CardDescription>Please provide your shipping address and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={handleChange} required />
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
                <Input id="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" value={formData.postalCode} onChange={handleChange} required />
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
              <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="e.g., Leave package by the back door"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Subscription..." : "Create Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
