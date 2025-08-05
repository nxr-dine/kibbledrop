"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Menu, Home, PawPrint, ListOrdered, LogIn, LogOut, Package, User, Settings } from "lucide-react"
import { useCartStore } from "@/lib/cart"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context" // Import useAuth

export function Navbar() {
  const pathname = usePathname()
  const { getItemCount, fetchCart } = useCartStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isLoggedIn, logout, user } = useAuth() // Use auth context

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch cart when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart()
    }
  }, [isLoggedIn, fetchCart])

  const navItems = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/dashboard/products", label: "Products", icon: Package, exact: false },
    { href: "/dashboard/pet-profile", label: "Pet Profile", icon: PawPrint, exact: false },
    { href: "/dashboard/subscription/manage", label: "My Subscription", icon: ListOrdered, exact: false },
    // Admin link - only show for admin users
    ...(user?.role === 'admin' ? [{ href: "/admin", label: "Admin", icon: Settings, exact: false }] : [])
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-bold text-orange-600">KibbleDrop</span>
          </Link>

          {/* Desktop Navigation - Centered, use flex-grow for centering */}
          <div className="hidden md:flex flex-grow justify-center items-center space-x-8">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href) && (item.href === "/" ? pathname === "/" : true)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                    isActive && "text-orange-600 font-semibold",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative bg-transparent">
                <ShoppingCart className="h-4 w-4" />
                {isMounted && getItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {isMounted && isLoggedIn ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard" className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Account
                    </Link>
                  </Button>
                  <Button onClick={logout} size="sm">
                    <LogOut className="h-4 w-4 mr-1" /> Logout
                  </Button>
                </>
              ) : isMounted ? (
                <Button asChild size="sm">
                  <Link href="/login" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                </Button>
              ) : (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden"
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg transition-transform duration-300 md:hidden"
            style={{ minHeight: '100vh' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between h-16 px-4">
              <span className="text-2xl font-bold text-orange-600">KibbleDrop</span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2 px-4 pb-6">
              {navItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href) && (item.href === "/" ? pathname === "/" : true)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-gray-700 hover:text-orange-600 px-4 py-3 rounded-lg text-base font-medium flex items-center gap-3 transition-colors",
                      isActive && "text-orange-600 font-semibold bg-orange-50",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
              <div className="flex flex-col gap-2 pt-4">
                {isMounted && isLoggedIn ? (
                  <>
                    <Button asChild variant="ghost" size="lg" className="w-full justify-center">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <User className="h-5 w-5" /> Account
                      </Link>
                    </Button>
                    <Button onClick={logout} size="lg" className="w-full justify-center">
                      <LogOut className="h-5 w-5 mr-1" /> Logout
                    </Button>
                  </>
                ) : isMounted ? (
                  <Button asChild size="lg" className="w-full justify-center">
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" /> Login
                    </Link>
                  </Button>
                ) : (
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
