import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user statistics
    const stats = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        _count: {
          select: {
            orders: true,
            subscriptions: {
              where: {
                status: "active"
              }
            },
            petProfiles: true
          }
        },
        subscriptions: {
          where: {
            status: "active"
          },
          select: {
            id: true,
            status: true,
            nextDelivery: true
          }
        },
        orders: {
          take: 5,
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true
          }
        }
      }
    })

    if (!stats) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate additional stats
    const totalSpent = await prisma.order.aggregate({
      where: {
        userId: session.user.id,
        status: "completed"
      },
      _sum: {
        total: true
      }
    })

    const response = {
      ordersCompleted: stats._count.orders,
      activeSubscriptions: stats._count.subscriptions,
      petsRegistered: stats._count.petProfiles,
      totalSpent: totalSpent._sum.total || 0,
      recentOrders: stats.orders,
      activeSubscriptionsList: stats.subscriptions
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 