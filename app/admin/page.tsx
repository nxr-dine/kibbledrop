import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, DollarSign, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getAdminData() {
  try {
    const [products, subscriptions, users] = await Promise.all([
      prisma.product.findMany(),
      prisma.subscription.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }),
      prisma.user.findMany()
    ])

    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return sum + sub.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0)
    }, 0)

    const activeSubscriptions = subscriptions.filter(sub => sub.status === "active").length

    return {
      products,
      subscriptions,
      users,
      totalRevenue,
      activeSubscriptions
    }
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return {
      products: [],
      subscriptions: [],
      users: [],
      totalRevenue: 0,
      activeSubscriptions: 0
    }
  }
}

export default async function AdminPage() {
  const { products, subscriptions, users, totalRevenue, activeSubscriptions } = await getAdminData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge variant="secondary">Demo Mode</Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">From last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Simplified for frontend-only */}
      <h2 className="text-2xl font-semibold mb-6">Product and Order Overview</h2>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
            <CardDescription>Overview of all available products.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {products.map((product) => (
                <li key={product.id} className="flex justify-between items-center text-sm">
                  <span>{product.name}</span>
                  <Badge variant="outline" className="capitalize">
                    {product.petType}
                  </Badge>
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions ({subscriptions.length})</CardTitle>
            <CardDescription>Recent customer subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {subscriptions.map((subscription) => (
                <li key={subscription.id} className="flex justify-between items-center text-sm">
                  <span>Subscription #{subscription.id}</span>
                  <Badge
                    variant={
                      subscription.status === "active" ? "default" : subscription.status === "paused" ? "secondary" : "outline"
                    }
                  >
                    {subscription.status}
                  </Badge>
                  <span className="font-semibold">
                    ${subscription.items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
