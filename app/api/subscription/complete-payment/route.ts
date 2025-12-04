import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order and verify it belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "paid", // Only process paid orders
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not paid" },
        { status: 404 }
      );
    }

    // Get subscription ID from order metadata
    let subscriptionId;
    try {
      const orderMetadata = (order as any).metadata
        ? JSON.parse((order as any).metadata as string)
        : null;
      subscriptionId = orderMetadata?.subscriptionId;
    } catch (e) {
      console.error("Failed to parse order metadata:", e);
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No subscription ID found in order" },
        { status: 400 }
      );
    }

    // Find and activate the pending subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
        status: "pending",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Pending subscription not found" },
        { status: 404 }
      );
    }

    // Activate the subscription
    const activatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "active",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      { subscription: activatedSubscription },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing subscription payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
