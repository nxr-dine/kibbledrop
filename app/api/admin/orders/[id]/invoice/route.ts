import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkAdminRole } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                petType: true,
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${order.id.slice(-8).toUpperCase()}`,
      orderId: order.id,
      date: order.createdAt,
      dueDate: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      customer: {
        name: order.deliveryName,
        email: order.user.email,
        address: order.deliveryAddress,
        city: order.city,
        postalCode: order.postalCode,
      },
      items: order.items.map(item => ({
        name: item.product.name,
        category: item.product.category,
        petType: item.product.petType,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      paymentStatus: order.status === "canceled" ? "Refunded" : "Paid",
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 