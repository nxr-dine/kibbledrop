import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { sendSubscriptionStatusUpdateEmail, sendSkipDeliveryEmail } from "@/lib/email"

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
    const {
      frequency,
      status,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      city,
      postalCode,
      instructions,
      customDeliveryDate,
      skipNextDelivery
    } = body

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

    // Handle skip delivery
    if (skipNextDelivery && existingSubscription.nextDelivery) {
      const skippedDate = existingSubscription.nextDelivery
      const skippedDateString = skippedDate.toISOString().split('T')[0]
      
      // Add to skipped deliveries array
      const updatedSkippedDeliveries = [
        ...(existingSubscription.skippedDeliveries || []),
        skippedDateString
      ]

      // Calculate next delivery date
      let nextDelivery = new Date(skippedDate)
      switch (existingSubscription.frequency) {
        case "weekly":
          nextDelivery.setDate(nextDelivery.getDate() + 7)
          break
        case "bi-weekly":
          nextDelivery.setDate(nextDelivery.getDate() + 14)
          break
        case "monthly":
          nextDelivery.setMonth(nextDelivery.getMonth() + 1)
          break
        default:
          nextDelivery.setMonth(nextDelivery.getMonth() + 1)
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { id: params.id },
        data: {
          skippedDeliveries: updatedSkippedDeliveries,
          nextDelivery: nextDelivery
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, name: true } } } }
        }
      })

      // Send skip delivery email
      if (existingSubscription.user.email) {
        await sendSkipDeliveryEmail(
          existingSubscription.user.email,
          existingSubscription.user.name || "Customer",
          {
            subscriptionId: updatedSubscription.id,
            skippedDate: skippedDate,
            nextDelivery: nextDelivery,
            items: updatedSubscription.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity
            }))
          }
        )
      }

      return NextResponse.json(updatedSubscription)
    }

    // Calculate next delivery date if frequency changed
    let nextDelivery = existingSubscription.nextDelivery
    if (frequency && frequency !== existingSubscription.frequency) {
      nextDelivery = new Date()
      switch (frequency) {
        case "weekly":
          nextDelivery.setDate(nextDelivery.getDate() + 7)
          break
        case "bi-weekly":
          nextDelivery.setDate(nextDelivery.getDate() + 14)
          break
        case "monthly":
          nextDelivery.setMonth(nextDelivery.getMonth() + 1)
          break
        default:
          nextDelivery.setMonth(nextDelivery.getMonth() + 1)
      }
    }

    // Use custom delivery date if provided
    if (customDeliveryDate) {
      nextDelivery = new Date(customDeliveryDate)
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        frequency: frequency || existingSubscription.frequency,
        status: status || existingSubscription.status,
        deliveryName: deliveryName || existingSubscription.deliveryName,
        deliveryPhone: deliveryPhone || existingSubscription.deliveryPhone,
        deliveryAddress: deliveryAddress || existingSubscription.deliveryAddress,
        city: city || existingSubscription.city,
        postalCode: postalCode || existingSubscription.postalCode,
        instructions: instructions || existingSubscription.instructions,
        nextDelivery: nextDelivery,
        customDeliveryDate: customDeliveryDate || null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } }
      }
    })

    // Send status update email if status changed
    if (status && status !== existingSubscription.status && existingSubscription.user.email) {
      await sendSubscriptionStatusUpdateEmail(
        existingSubscription.user.email,
        existingSubscription.user.name || "Customer",
        {
          subscriptionId: updatedSubscription.id,
          status: status,
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
    console.error("Error updating subscription:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the subscription belongs to the user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Delete subscription items first (due to foreign key constraints)
    await prisma.subscriptionItem.deleteMany({
      where: {
        subscriptionId: params.id
      }
    })

    // Delete the subscription
    await prisma.subscription.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Subscription deleted successfully" })
  } catch (error) {
    console.error("Error deleting subscription:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 