import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { tradesafe } from "@/lib/tradesafe";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "Order ID or Payment ID is required" },
        { status: 400 }
      );
    }

    let order;
    if (orderId) {
      order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: session.user.id
        }
      });
    } else if (paymentId) {
      order = await prisma.order.findFirst({
        where: {
          paymentId: paymentId,
          userId: session.user.id
        }
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // If we have a payment ID, also check with Tradesafe for the latest status
    if (order.paymentId) {
      try {
        const paymentStatus = await tradesafe.getPaymentStatus(order.paymentId);
        
        if (paymentStatus.success) {
          // Update local order status if it differs from Tradesafe
          if (order.status !== paymentStatus.message?.includes('completed') ? 'paid' : 'pending') {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: paymentStatus.message?.includes('completed') ? 'paid' : 'pending'
              }
            });
            order.status = paymentStatus.message?.includes('completed') ? 'paid' : 'pending';
          }
        }
      } catch (error) {
        console.error('Error checking payment status with Tradesafe:', error);
        // Continue with local order status if Tradesafe check fails
      }
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      paymentId: order.paymentId,
      transactionId: order.transactionId,
      createdAt: order.createdAt,
      paymentCompletedAt: order.paymentCompletedAt,
    });

  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

