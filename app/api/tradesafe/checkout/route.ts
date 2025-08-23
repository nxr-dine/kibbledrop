import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { tradesafe } from "@/lib/tradesafe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, items, customerInfo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    // Get product details for the items
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    // Calculate total amount
    const totalAmount = items.reduce((total: number, item: any) => {
      const product = products.find(p => p.id === item.productId);
      return total + ((product?.price || 0) * (item.quantity || 1));
    }, 0);

    // Create or get order
    let order;
    if (subscriptionId) {
      // For subscription orders
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId: session.user.id
        }
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
          subscriptionId: subscriptionId,
          status: 'pending',
          total: totalAmount,
          items: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: products.find(p => p.id === item.productId)?.price || 0
          })),
          customerInfo: customerInfo || {},
        }
      });
    } else {
      // For one-time orders
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: 'pending',
          total: totalAmount,
          items: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: products.find(p => p.id === item.productId)?.price || 0
          })),
          customerInfo: customerInfo || {},
        }
      });
    }

    // Create Tradesafe payment
    const paymentRequest = {
      amount: totalAmount,
      currency: 'ZAR', // South African Rand
      orderId: order.id,
      description: `Order ${order.id} - ${products.map(p => p.name).join(', ')}`,
      customerEmail: session.user.email!,
      customerName: customerInfo?.name || session.user.name || '',
      customerPhone: customerInfo?.phone || '',
      returnUrl: `${process.env.NEXTAUTH_URL}/payment/success?orderId=${order.id}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/payment/cancelled?orderId=${order.id}`,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/tradesafe/webhook`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        subscriptionId: subscriptionId || null,
        items: items,
      }
    };

    const paymentResponse = await tradesafe.createPayment(paymentRequest);

    if (!paymentResponse.success) {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'failed' }
      });

      return NextResponse.json(
        { error: paymentResponse.error || 'Payment creation failed' },
        { status: 400 }
      );
    }

    // Update order with payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        paymentId: paymentResponse.paymentId,
        status: 'payment_pending'
      }
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.paymentId,
      redirectUrl: paymentResponse.redirectUrl,
      orderId: order.id
    });

  } catch (error) {
    console.error("Error creating Tradesafe checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

