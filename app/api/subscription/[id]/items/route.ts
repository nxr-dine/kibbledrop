import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { sendSubscriptionStatusUpdateEmail } from "@/lib/email"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 })
    }

    // Verify the subscription belongs to the user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } }
      }
    })

    if (!existingSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Delete existing items
    await prisma.subscriptionItem.deleteMany({
      where: { subscriptionId: params.id }
    })

    // Create new items
    const newItems = await Promise.all(
      items.map((item: any) =>
        prisma.subscriptionItem.create({
          data: {
            subscriptionId: params.id,
            productId: item.productId,
            quantity: item.quantity
          },
          include: {
            product: { select: { id: true, name: true } }
          }
        })
      )
    )

    // Get updated subscription with new items
    const updatedSubscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } }
      }
    })

    // Send notification email
    if (updatedSubscription?.user.email) {
      await sendSubscriptionStatusUpdateEmail(
        updatedSubscription.user.email,
        updatedSubscription.user.name || "Customer",
        {
          subscriptionId: updatedSubscription.id,
          status: updatedSubscription.status,
          frequency: updatedSubscription.frequency,
          nextDelivery: updatedSubscription.nextDelivery || undefined,
          items: updatedSubscription.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity
          }))
        }
      )
    }

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error("Error updating subscription items:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 