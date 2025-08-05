"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  petType: string
  image: string
  featured: boolean
  createdAt: string
  updatedAt: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItem, isLoading } = useCartStore()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const cartItem = getItem(product.id)

  const addToCart = async () => {
    setIsAdding(true)
    try {
      await addItem(product, quantity)
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <Badge
            className="absolute top-2 right-2 capitalize"
            variant={product.petType === "Dog" ? "default" : "secondary"}
          >
            {product.petType}
          </Badge>
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-orange-600 text-white">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
        <div className="mt-auto">
          <p className="text-2xl font-bold text-orange-600">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">per item</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-center w-full space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-16 sm:w-20 text-center text-sm sm:text-base"
            min="1"
          />
          <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => prev + 1)} className="h-8 w-8 sm:h-10 sm:w-10">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          onClick={addToCart} 
          disabled={isAdding || isLoading}
          className={`w-full ${cartItem ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding ? 'Adding...' : cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
