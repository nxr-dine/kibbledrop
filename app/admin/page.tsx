import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, DollarSign, TrendingUp } from "lucide-react"
import { products, orders } from "@/lib/data"

export default function AdminPage() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const activeSubscriptions = orders.filter((order) => order.status === "active").length

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
            <p className="text-xs text-muted-foreground">Monthly subscribers</p>
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
                    {product.category}
                  </Badge>
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders ({orders.length})</CardTitle>
            <CardDescription>Recent customer orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {orders.map((order) => (
                <li key={order.id} className="flex justify-between items-center text-sm">
                  <span>Order #{order.id}</span>
                  <Badge
                    variant={
                      order.status === "active" ? "default" : order.status === "delivered" ? "secondary" : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                  <span className="font-semibold">${order.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
