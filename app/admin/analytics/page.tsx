"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart,
  UserPlus,
  Repeat,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  sales: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueByStatus: Record<string, number>
    dailyRevenue: Record<string, number>
  }
  customers: {
    totalCustomers: number
    newCustomers: number
    customersWithOrders: number
    customersWithSubscriptions: number
    customerRetention: number
    topCustomers: Array<{
      id: string
      name: string
      email: string
      totalSpent: number
      orderCount: number
      subscriptionCount: number
    }>
  }
  products: {
    totalProducts: number
    topSellingProducts: Array<{
      id: string
      name: string
      category: string
      petType: string
      totalRevenue: number
      orderQuantity: number
      subscriptionQuantity: number
    }>
    categoryPerformance: Record<string, number>
    petTypePerformance: Record<string, number>
  }
  revenue: {
    totalRevenue: number
    subscriptionRevenue: number
    oneTimeRevenue: number
    revenueGrowth: number
    monthlyRevenue: Record<string, number>
    revenueByCategory: Record<string, number>
  }
  retention: {
    customerRetentionRate: number
    repeatCustomerRate: number
    averageCustomerLifetime: number
    churnRate: number
    subscriptionRetention: number
  }
  period: number
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('Fetching analytics for period:', period)
      
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      console.log('Analytics response status:', response.status)
      
      if (response.ok) {
        const analyticsData = await response.json()
        console.log('Analytics data received:', analyticsData)
        setData(analyticsData)
      } else {
        const errorData = await response.json()
        console.error('Analytics API error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.sales.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.revenue.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              {Math.abs(data.revenue.revenueGrowth).toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sales.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${data.sales.averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customers.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {data.customers.totalCustomers} total customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.retention.customerRetentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.retention.repeatCustomerRate.toFixed(1)}% repeat customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>One-time Sales</span>
                    <span className="font-semibold">${data.revenue.oneTimeRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Subscription Revenue</span>
                    <span className="font-semibold">${data.revenue.subscriptionRevenue.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Revenue</span>
                      <span>${data.revenue.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Customers</span>
                    <span className="font-semibold">{data.customers.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customers with Orders</span>
                    <span className="font-semibold">{data.customers.customersWithOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customers with Subscriptions</span>
                    <span className="font-semibold">{data.customers.customersWithSubscriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Customer Lifetime</span>
                    <span className="font-semibold">{data.retention.averageCustomerLifetime.toFixed(1)} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.sales.revenueByStatus).map(([status, revenue]) => (
                    <div key={status} className="flex justify-between items-center">
                      <Badge variant="outline" className="capitalize">{status}</Badge>
                      <span className="font-semibold">${revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.sales.dailyRevenue)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(-7)
                    .map(([date, revenue]) => (
                      <div key={date} className="flex justify-between items-center text-sm">
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <span className="font-semibold">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.customers.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{customer.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      <div className="text-xs text-gray-500">
                        {customer.orderCount} orders, {customer.subscriptionCount} subscriptions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${customer.totalSpent.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">#{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.products.topSellingProducts.map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {product.category} • {product.petType}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.orderQuantity} orders, {product.subscriptionQuantity} subscriptions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${product.totalRevenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">#{index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.products.categoryPerformance)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, revenue]) => (
                      <div key={category} className="flex justify-between items-center">
                        <Badge variant="outline" className="capitalize">{category}</Badge>
                        <span className="font-semibold">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.revenue.monthlyRevenue)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, revenue]) => (
                      <div key={month} className="flex justify-between items-center">
                        <span>{new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                        <span className="font-semibold">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Retention Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Customer Retention Rate</span>
                    <span className="font-semibold">{data.retention.customerRetentionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Repeat Customer Rate</span>
                    <span className="font-semibold">{data.retention.repeatCustomerRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Subscription Retention</span>
                    <span className="font-semibold">{(data.retention.subscriptionRetention * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Churn Rate</span>
                    <span className="font-semibold text-red-600">{data.retention.churnRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 