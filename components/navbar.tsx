"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Menu, Home, PawPrint, ListOrdered, LogIn, LogOut, Package } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context" // Import useAuth

export function Navbar() {
  const pathname = usePathname()
  const { state } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth() // Use auth context

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/subscription/manage", label: "My Subscription", icon: ListOrdered },
    // Admin link removed as per request
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-orange-600">KibbleDrop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                  pathname.startsWith(item.href) && "text-orange-600 font-semibold",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative bg-transparent">
                <ShoppingCart className="h-4 w-4" />
                {state.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {state.items.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoggedIn ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/pet-profile" className="flex items-center gap-1">
                      <PawPrint className="h-4 w-4" /> Pet Profile
                    </Link>
                  </Button>
                  <Button onClick={logout} size="sm">
                    <LogOut className="h-4 w-4 mr-1" /> Logout
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link href="/login" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-2",
                    pathname.startsWith(item.href) && "text-orange-600 font-semibold",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <div className="flex space-x-2 px-3 pt-2">
                {isLoggedIn ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link href="/dashboard/pet-profile" className="flex items-center justify-center gap-1">
                        <PawPrint className="h-4 w-4" /> Pet Profile
                      </Link>
                    </Button>
                    <Button onClick={logout} size="sm" className="flex-1">
                      <LogOut className="h-4 w-4 mr-1" /> Logout
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/login" className="flex items-center justify-center gap-1">
                      <LogIn className="h-4 w-4" /> Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
