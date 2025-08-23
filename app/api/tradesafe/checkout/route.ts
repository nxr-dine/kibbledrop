import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { tradesafe } from "@/lib/tradesafe";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, items, customerInfo, metadata } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Get product details for the items
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Calculate total amount
    const totalAmount = items.reduce((total: number, item: any) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product?.price || 0) * (item.quantity || 1);
    }, 0);

    // Create or get order
    let order;

    // Calculate shipping (you can add logic here for different shipping costs)
    const shippingCost = 0; // Free shipping for now
    const subtotal = totalAmount;

    if (subscriptionId) {
      // For subscription orders - verify subscription exists
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId: session.user.id,
        },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }

      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "pending",
          subtotal: subtotal,
          shipping: shippingCost,
          total: totalAmount,
          deliveryName: customerInfo?.name || "",
          deliveryPhone: customerInfo?.phone || "",
          deliveryAddress: metadata?.deliveryInfo?.street || "",
          city: metadata?.deliveryInfo?.city || "",
          postalCode: metadata?.deliveryInfo?.postalCode || "",
          instructions: metadata?.deliveryInfo?.instructions || "",
          deliveryMethod: "standard",
        },
      });
    } else if (metadata?.isSubscriptionPayment) {
      // For new subscription creation payment
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "pending",
          subtotal: subtotal,
          shipping: shippingCost,
          total: totalAmount,
          deliveryName: customerInfo?.name || "",
          deliveryPhone: customerInfo?.phone || "",
          deliveryAddress: metadata?.deliveryInfo?.street || "",
          city: metadata?.deliveryInfo?.city || "",
          postalCode: metadata?.deliveryInfo?.postalCode || "",
          instructions: metadata?.deliveryInfo?.instructions || "",
          deliveryMethod: "standard",
        },
      });
    } else {
      // For one-time orders
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "pending",
          subtotal: subtotal,
          shipping: shippingCost,
          total: totalAmount,
          deliveryName: customerInfo?.name || "",
          deliveryPhone: customerInfo?.phone || "",
          deliveryAddress: customerInfo?.address || "",
          city: customerInfo?.city || "",
          postalCode: customerInfo?.postalCode || "",
          instructions: customerInfo?.instructions || "",
          deliveryMethod: "standard",
        },
      });
    }

    // Create order items separately
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity || 1,
            price: product.price,
          },
        });
      }
    }

    // Create Tradesafe payment
    const paymentRequest = {
      amount: totalAmount,
      currency: "ZAR", // South African Rand
      orderId: order.id,
      description: `Order ${order.id} - ${products
        .map((p) => p.name)
        .join(", ")}`,
      customerEmail: session.user.email!,
      customerName: customerInfo?.name || session.user.name || "",
      customerPhone: customerInfo?.phone || "",
      returnUrl: metadata?.isSubscriptionPayment
        ? `${process.env.NEXTAUTH_URL}/payment/subscription-success?orderId=${order.id}`
        : `${process.env.NEXTAUTH_URL}/payment/success?orderId=${order.id}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/payment/cancelled?orderId=${order.id}`,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/tradesafe/webhook`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        subscriptionId: subscriptionId || null,
        items: items,
        isSubscriptionPayment: metadata?.isSubscriptionPayment || false,
        deliveryInfo: metadata?.deliveryInfo || null,
        subscriptionData: metadata?.subscriptionData || null,
      },
    };

    const paymentResponse = await tradesafe.createPayment(paymentRequest);

    if (!paymentResponse.success) {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: paymentResponse.error || "Payment creation failed" },
        { status: 400 }
      );
    }

    // Update order status (remove paymentId as it's not in the schema)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "payment_pending",
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.paymentId,
      redirectUrl: paymentResponse.redirectUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error creating Tradesafe checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
