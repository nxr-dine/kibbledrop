import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

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
      instructions
    } = body

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

    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: params.id
      },
      data: {
        frequency,
        status,
        deliveryName,
        deliveryPhone,
        deliveryAddress,
        city,
        postalCode,
        instructions,
        nextDelivery
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

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