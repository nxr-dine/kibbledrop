import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
    console.log("=== POST /api/orders called ===");
    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user);
    
    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body);
    const { items, deliveryInfo, subtotal, shipping, total } = body

    // Validation
    if (!items || !deliveryInfo || !subtotal || !shipping || !total) {
      console.log("❌ Missing required fields:", { items, deliveryInfo, subtotal, shipping, total });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.log("❌ Invalid items array:", items);
      return NextResponse.json(
        { error: "Invalid items array" },
        { status: 400 }
      )
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        console.log("❌ Invalid item:", item);
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 }
        )
      }
    }

    // Validate delivery info
    if (!deliveryInfo.firstName || !deliveryInfo.lastName || !deliveryInfo.address || !deliveryInfo.city) {
      console.log("❌ Invalid delivery info:", deliveryInfo);
      return NextResponse.json(
        { error: "Invalid delivery information" },
        { status: 400 }
      )
    }

    // Create order with items
    console.log("Creating order with data:", {
      userId: session.user.id,
      subtotal,
      shipping,
      total,
      itemsCount: items.length
    });
    
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "pending",
        subtotal,
        shipping,
        total,
        deliveryName: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
        deliveryPhone: deliveryInfo.phone || "",
        deliveryAddress: deliveryInfo.address,
        city: deliveryInfo.city,
        postalCode: deliveryInfo.postalCode || "",
        instructions: deliveryInfo.deliveryInstructions || "",
        deliveryMethod: deliveryInfo.deliveryMethod || "standard",
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
    
    console.log("✅ Order created successfully:", order.id);

    // Send order confirmation email (optional - don't fail if email fails)
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("Sending order confirmation email...");
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
        console.log("✅ Order confirmation email sent successfully");
      } catch (error) {
        console.error("❌ Error sending order confirmation email:", error)
        // Don't fail the order creation if email fails
      }
    } else {
      console.log("⚠️ RESEND_API_KEY not configured, skipping email");
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating order:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json(
          { error: "One or more products not found" },
          { status: 400 }
        )
      }
      if (error.message.includes("Database connection")) {
        return NextResponse.json(
          { error: "Database connection error" },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 