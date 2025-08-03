import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sendOrderConfirmationEmail } from "@/lib/email"

// GET - Get user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items, deliveryInfo, subtotal, shipping, total } = body

    // Validation
    if (!items || !deliveryInfo || !subtotal || !shipping || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "pending",
        subtotal,
        shipping,
        total,
        deliveryName: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
        deliveryPhone: deliveryInfo.phone,
        deliveryAddress: deliveryInfo.address,
        city: deliveryInfo.city,
        postalCode: deliveryInfo.postalCode,
        instructions: deliveryInfo.deliveryInstructions,
        deliveryMethod: deliveryInfo.deliveryMethod,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Send order confirmation email
    try {
      const estimatedDelivery = new Date()
      estimatedDelivery.setDate(estimatedDelivery.getDate() + (deliveryInfo.deliveryMethod === "express" ? 2 : 7))
      
      await sendOrderConfirmationEmail(
        session.user.email!,
        session.user.name || "Customer",
        {
          orderId: order.id,
          total: order.total,
          estimatedDelivery,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          })),
          deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}`
        }
      )
    } catch (error) {
      console.error("Error sending order confirmation email:", error)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 