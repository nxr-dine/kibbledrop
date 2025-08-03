import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update cart" },
        { status: 401 }
      )
    }

    const { quantity } = await request.json()
    const cartItemId = params.id

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      )
    }

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: session.user.id
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      )
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      })
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      })
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    const items = updatedCart?.items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
      category: item.product.category,
      petType: item.product.petType,
    })) || []

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}

// DELETE - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to remove cart items" },
        { status: 401 }
      )
    }

    const cartItemId = params.id

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: session.user.id
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      )
    }

    // Remove the item
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    const items = updatedCart?.items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
      category: item.product.category,
      petType: item.product.petType,
    })) || []

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    )
  }
} 