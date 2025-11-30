import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createSubscriptionSession, createOneTimePaymentSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId, items, orderId, customerEmail } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      )
    }

    // Get product details for the items
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    })

    // Map items with product details
    const itemsWithDetails = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item,
        price: product?.price || 0,
        name: product?.name || 'Unknown Product'
      }
    })

    let stripeSession

    if (subscriptionId) {
      // Get subscription details
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId: session.user.id
        }
      })

      if (!subscription) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        )
      }

      stripeSession = await createSubscriptionSession(
        subscriptionId,
        session.user.email!,
        itemsWithDetails,
        subscription.frequency
      )
    } else {
      // Enable one-time payment checkout
      stripeSession = await createOneTimePaymentSession(
        itemsWithDetails,
        orderId,
        customerEmail || session.user.email || undefined
      )
    }

    return NextResponse.json({ sessionId: stripeSession.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 