import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      frequency,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      city,
      postalCode,
      instructions,
      items,
    } = body;

    if (
      !frequency ||
      !deliveryName ||
      !deliveryPhone ||
      !deliveryAddress ||
      !city ||
      !postalCode ||
      !items
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate next delivery date based on frequency
    const nextDelivery = new Date();
    switch (frequency) {
      case "weekly":
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case "bi-weekly":
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case "tri-weekly":
        nextDelivery.setDate(nextDelivery.getDate() + 21);
        break;
      case "monthly":
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
      case "custom-weeks":
        // For custom weeks, we'll default to monthly and handle the custom logic later
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
      case "custom-date":
        // For custom date, we'll default to monthly and handle the custom logic later
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
      default:
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        frequency,
        status: "active",
        deliveryName,
        deliveryPhone,
        deliveryAddress,
        city,
        postalCode,
        instructions,
        nextDelivery,
        items: {
          create: items.map((item: any) => ({
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

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
