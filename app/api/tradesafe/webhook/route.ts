import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tradesafe } from "@/lib/tradesafe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-tradesafe-signature');

    if (!signature) {
      console.error('Missing Tradesafe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const payload = JSON.stringify(body);
    if (!tradesafe.verifyWebhookSignature(payload, signature)) {
      console.error('Invalid Tradesafe webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const {
      paymentId,
      orderId,
      status,
      amount,
      currency,
      transactionId,
      timestamp
    } = body;

    console.log(`Tradesafe webhook received: ${status} for order ${orderId}`);

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      console.error(`Order ${orderId} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status based on payment status
    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    switch (status) {
      case 'completed':
        orderStatus = 'paid';
        paymentStatus = 'completed';
        break;
      case 'failed':
        orderStatus = 'failed';
        paymentStatus = 'failed';
        break;
      case 'cancelled':
        orderStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      case 'pending':
        orderStatus = 'payment_pending';
        paymentStatus = 'pending';
        break;
      default:
        console.warn(`Unknown payment status: ${status}`);
        return NextResponse.json({ error: 'Unknown status' }, { status: 400 });
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        paymentCompletedAt: status === 'completed' ? new Date() : null,
        transactionId: transactionId || null,
      }
    });

    // If payment is completed and this is a subscription order, activate the subscription
    if (status === 'completed' && order.subscriptionId) {
      await prisma.subscription.update({
        where: { id: order.subscriptionId },
        data: {
          status: 'active',
          activatedAt: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      });

      console.log(`Subscription ${order.subscriptionId} activated for order ${orderId}`);
    }

    // Send confirmation email if payment is completed
    if (status === 'completed' && order.user?.email) {
      try {
        // You can implement email sending here using your existing email service
        console.log(`Sending confirmation email to ${order.user.email} for order ${orderId}`);
        
        // Example email sending (uncomment and implement based on your email service):
        // await sendOrderConfirmationEmail(order.user.email, order);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Tradesafe webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

