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

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Find the pending subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
        status: "pending",
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
    console.error("Error activating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
