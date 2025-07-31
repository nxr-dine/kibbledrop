"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/data"
import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  const addToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: { ...product, quantity } })
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your subscription.`,
    })
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
            variant={product.category === "dog" ? "default" : "secondary"}
          >
            {product.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
        <div className="mt-auto">
          <p className="text-2xl font-bold text-orange-600">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">per month</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-center w-full space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-16 text-center"
            min="1"
          />
          <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => prev + 1)} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={addToCart} className="w-full">
          Add to Subscription
        </Button>
      </CardFooter>
    </Card>
  )
}
