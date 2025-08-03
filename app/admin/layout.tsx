import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminGuard } from "@/components/admin-guard"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Settings
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation Bar */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-orange-600" />
                  <span className="text-xl font-bold text-gray-900">KibbleDrop Admin</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin" className="flex items-center space-x-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/analytics" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/products" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Products</span>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/orders" className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/users" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </Link>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm">
                  <span className="sr-only">Open menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>

              {/* Status Badge */}
              <div className="hidden md:block">
                <Badge variant="secondary">Admin Mode</Badge>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
} 