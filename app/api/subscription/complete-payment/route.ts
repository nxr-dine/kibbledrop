import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Find the order and verify it belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: 'paid' // Only process paid orders
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not paid" },
        { status: 404 }
      );
    }

    // Check if order already has a subscription
    if (order.subscriptionId) {
      const existingSubscription = await prisma.subscription.findUnique({
        where: { id: order.subscriptionId }
      });
      
      if (existingSubscription) {
        return NextResponse.json(
          { subscription: existingSubscription },
          { status: 200 }
        );
      }
    }

    // Get pending subscription data from order metadata
    let subscriptionData;
    try {
      subscriptionData = order.metadata ? JSON.parse(order.metadata as string) : null;
    } catch (e) {
      console.error("Failed to parse order metadata:", e);
    }

    if (!subscriptionData || !subscriptionData.subscriptionData) {
      return NextResponse.json(
        { error: "No subscription data found in order" },
        { status: 400 }
      );
    }

    const parsedSubscriptionData = JSON.parse(subscriptionData.subscriptionData);

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        petProfileId: parsedSubscriptionData.petProfileId,
        frequency: parsedSubscriptionData.frequency,
        status: 'active',
        deliveryName: parsedSubscriptionData.deliveryName,
        deliveryPhone: parsedSubscriptionData.deliveryPhone,
        deliveryAddress: parsedSubscriptionData.deliveryAddress,
        city: parsedSubscriptionData.city,
        postalCode: parsedSubscriptionData.postalCode,
        instructions: parsedSubscriptionData.instructions,
        activatedAt: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: {
          create: parsedSubscriptionData.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update the order to link it to the subscription
    await prisma.order.update({
      where: { id: orderId },
      data: {
        subscriptionId: subscription.id,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });

  } catch (error) {
    console.error("Error completing subscription payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
