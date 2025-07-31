"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart, type CartItem as CartItemType } from "@/contexts/cart-context"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { dispatch } = useCart()

  const updateQuantity = (newQuantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: item.id, quantity: newQuantity },
    })
  }

  const removeItem = () => {
    dispatch({ type: "REMOVE_ITEM", payload: item.id })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded-lg" />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 truncate pr-2">{item.name}</h3>
              <Badge variant="secondary" className="capitalize flex-shrink-0">
                {item.category}
              </Badge>
            </div>
            <p className="text-orange-600 font-semibold">${item.price.toFixed(2)}/month</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <span className="w-8 text-center font-medium">{item.quantity}</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={removeItem}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Item Total */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Item total:</span>
            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}/month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
