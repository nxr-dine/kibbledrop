import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { checkAdminRole } from "@/lib/utils";

// GET - Get single order (admin view)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                category: true,
                petType: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, estimatedDelivery } = body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status || existingOrder.status,
        trackingNumber: trackingNumber || existingOrder.trackingNumber,
        estimatedDelivery: estimatedDelivery
          ? new Date(estimatedDelivery)
          : existingOrder.estimatedDelivery,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                category: true,
                petType: true,
              },
            },
          },
        },
      },
    });

    // Send status update email if status changed
    if (status && status !== existingOrder.status && existingOrder.user.email) {
      try {
        await sendOrderStatusUpdateEmail(
          existingOrder.user.email,
          existingOrder.user.name || "Customer",
          {
            orderId: order.id,
            status: order.status,
            trackingNumber: order.trackingNumber ?? undefined,
            estimatedDelivery: order.estimatedDelivery ?? undefined,
            items: order.items.map((item: any) => ({
              name: item.product.name,
              quantity: item.quantity,
            })),
          }
        );
      } catch (error) {
        console.error("Error sending order status update email:", error);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order and process refund (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason = "Order canceled by admin" } = body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation of pending or processing orders
    if (!["pending", "processing"].includes(existingOrder.status)) {
      return NextResponse.json(
        { error: "Cannot cancel order that has already been shipped" },
        { status: 400 }
      );
    }

    // Update order status to canceled
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "canceled",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Send cancellation email
    if (existingOrder.user.email) {
      try {
        await sendOrderStatusUpdateEmail(
          existingOrder.user.email,
          existingOrder.user.name || "Customer",
          {
            orderId: order.id,
            status: "canceled",
            items: order.items.map((item: any) => ({
              name: item.product.name,
              quantity: item.quantity,
            })),
          }
        );
      } catch (error) {
        console.error("Error sending order cancellation email:", error);
      }
    }

    return NextResponse.json({
      message: "Order canceled successfully",
      order,
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
