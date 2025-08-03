import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { checkAdminRole } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called')
    const session = await getServerSession()
    console.log('Session:', session?.user?.id)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(session.user.id)
    console.log('Is admin:', isAdmin, 'for user ID:', session.user.id)
    
    // Let's also check what the user's role actually is
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    })
    console.log('User details:', user)
    
    if (!isAdmin) {
      console.log('User is not admin')
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    
    console.log('Fetching data for period:', period, 'days, from:', startDate)

    // Fetch all data
    const [orders, subscriptions, products, users] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  petType: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.subscription.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  petType: true
                }
              }
            }
          }
        }
      }),
      prisma.product.findMany({
        include: {
          orderItems: {
            include: {
              order: {
                select: {
                  createdAt: true,
                  total: true
                }
              }
            }
          },
          subscriptionItems: {
            include: {
              subscription: {
                select: {
                  createdAt: true,
                  status: true
                }
              }
            }
          }
        }
      }),
      prisma.user.findMany({
        include: {
          orders: {
            select: {
              id: true,
              total: true,
              createdAt: true
            }
          },
          subscriptions: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          }
        }
      })
    ])

    // Sales Reports
    const salesData = {
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      revenueByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + order.total
        return acc
      }, {} as Record<string, number>),
      dailyRevenue: orders.reduce((acc, order) => {
        const date = order.createdAt.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + order.total
        return acc
      }, {} as Record<string, number>)
    }

    // Customer Analytics
    const customerData = {
      totalCustomers: users.length,
      newCustomers: users.filter(user => user.createdAt >= startDate).length,
      customersWithOrders: users.filter(user => user.orders.length > 0).length,
      customersWithSubscriptions: users.filter(user => user.subscriptions.length > 0).length,
      customerRetention: calculateCustomerRetention(users, startDate),
      topCustomers: users
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
          orderCount: user.orders.length,
          subscriptionCount: user.subscriptions.length
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)
    }

    // Product Performance Metrics
    const productData = {
      totalProducts: products.length,
      topSellingProducts: products
        .map(product => {
          const orderSales = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const subscriptionSales = product.subscriptionItems
            .filter(item => item.subscription.status === 'active')
            .reduce((sum, item) => sum + (product.price * item.quantity), 0)
          return {
            id: product.id,
            name: product.name,
            category: product.category,
            petType: product.petType,
            totalRevenue: orderSales + subscriptionSales,
            orderQuantity: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
            subscriptionQuantity: product.subscriptionItems
              .filter(item => item.subscription.status === 'active')
              .reduce((sum, item) => sum + item.quantity, 0)
          }
        })
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10),
      categoryPerformance: products.reduce((acc, product) => {
        const revenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        acc[product.category] = (acc[product.category] || 0) + revenue
        return acc
      }, {} as Record<string, number>),
      petTypePerformance: products.reduce((acc, product) => {
        const revenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        acc[product.petType] = (acc[product.petType] || 0) + revenue
        return acc
      }, {} as Record<string, number>)
    }

    // Revenue Tracking
    const revenueData = {
      totalRevenue: salesData.totalRevenue,
      subscriptionRevenue: subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((sum, sub) => {
          return sum + sub.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0)
        }, 0),
      oneTimeRevenue: salesData.totalRevenue,
      revenueGrowth: calculateRevenueGrowth(orders, startDate),
      monthlyRevenue: calculateMonthlyRevenue(orders),
      revenueByCategory: productData.categoryPerformance
    }

    // Customer Retention Metrics
    const retentionData = {
      customerRetentionRate: customerData.customerRetention,
      repeatCustomerRate: calculateRepeatCustomerRate(users),
      averageCustomerLifetime: calculateAverageCustomerLifetime(users),
      churnRate: calculateChurnRate(subscriptions),
      subscriptionRetention: subscriptions.filter(sub => sub.status === 'active').length / Math.max(subscriptions.length, 1)
    }

    const analyticsResponse = {
      sales: salesData,
      customers: customerData,
      products: productData,
      revenue: revenueData,
      retention: retentionData,
      period: parseInt(period),
      lastUpdated: new Date().toISOString()
    }
    
    console.log('Analytics data prepared:', {
      ordersCount: orders.length,
      subscriptionsCount: subscriptions.length,
      productsCount: products.length,
      usersCount: users.length,
      totalRevenue: salesData.totalRevenue
    })

    return NextResponse.json(analyticsResponse)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper functions for calculations
function calculateCustomerRetention(users: any[], startDate: Date): number {
  const totalCustomers = users.length
  const activeCustomers = users.filter(user => 
    user.orders.some((order: any) => order.createdAt >= startDate) ||
    user.subscriptions.some((sub: any) => sub.status === 'active')
  ).length
  return totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0
}

function calculateRepeatCustomerRate(users: any[]): number {
  const customersWithOrders = users.filter(user => user.orders.length > 0)
  const repeatCustomers = customersWithOrders.filter(user => user.orders.length > 1).length
  return customersWithOrders.length > 0 ? (repeatCustomers / customersWithOrders.length) * 100 : 0
}

function calculateAverageCustomerLifetime(users: any[]): number {
  const customersWithOrders = users.filter(user => user.orders.length > 0)
  if (customersWithOrders.length === 0) return 0
  
  const totalLifetime = customersWithOrders.reduce((sum, user) => {
    const firstOrder = user.orders.reduce((earliest: any, order: any) => 
      order.createdAt < earliest.createdAt ? order : earliest
    )
    const lastOrder = user.orders.reduce((latest: any, order: any) => 
      order.createdAt > latest.createdAt ? order : latest
    )
    return sum + (lastOrder.createdAt.getTime() - firstOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  }, 0)
  
  return totalLifetime / customersWithOrders.length
}

function calculateChurnRate(subscriptions: any[]): number {
  const totalSubscriptions = subscriptions.length
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled').length
  return totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0
}

function calculateRevenueGrowth(orders: any[], startDate: Date): number {
  const currentPeriodOrders = orders.filter(order => order.createdAt >= startDate)
  const previousPeriodStart = new Date(startDate)
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  const previousPeriodOrders = orders.filter(order => 
    order.createdAt >= previousPeriodStart && order.createdAt < startDate
  )
  
  const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0)
  const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0)
  
  return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
}

function calculateMonthlyRevenue(orders: any[]): Record<string, number> {
  return orders.reduce((acc, order) => {
    const month = order.createdAt.toISOString().slice(0, 7) // YYYY-MM format
    acc[month] = (acc[month] || 0) + order.total
    return acc
  }, {} as Record<string, number>)
} 