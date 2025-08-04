"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  PawPrint, 
  Package, 
  CalendarDays, 
  Truck, 
  CreditCard, 
  User, 
  Mail, 
  Calendar, 
  Shield,
  CheckCircle,
  TrendingUp,
  Heart,
  Settings,
  Bell,
  MapPin,
  Clock
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { formatDate } from "@/lib/utils"

export default function DashboardPage() {
  const { user, isLoggedIn, isLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)

  // Debug logging
  useEffect(() => {
    console.log("Dashboard - isLoggedIn:", isLoggedIn)
    console.log("Dashboard - user:", user)
    console.log("Dashboard - isLoading:", isLoading)
  }, [isLoggedIn, user, isLoading])

  // Fetch user profile and stats
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log("Fetching user data...")
      fetchUserProfile()
      fetchUserStats()
    }
  }, [isLoggedIn, user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mb-6">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard!</h1>
            <p className="text-xl text-gray-600 mb-8">Please log in to access your personalized dashboard</p>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <User className="h-5 w-5 mr-2" />
              Log In to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 🐾
          </h1>
          <p className="text-lg text-gray-600">Here's what's happening with your KibbleDrop account</p>
        </div>

        {/* User Account Information */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-white">
          <div className="bg-orange-600 p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="text-xl font-bold bg-white text-orange-600">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1 border-2 border-white">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user?.name || "User"}</h2>
                <p className="text-orange-100 mb-3">{user?.email}</p>
                <div className="flex items-center gap-4">
                  <Badge className="bg-white/10 text-white border-white/20">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                  </Badge>
                  <Badge className="bg-green-600/20 text-green-100 border-green-400/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active Account
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="lg" asChild className="bg-white/10 border-white text-white hover:bg-white hover:text-orange-600">
                <Link href="/dashboard/account">View Account</Link>
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Member Since</p>
                  <p className="text-gray-900 font-semibold">
                    {userProfile?.createdAt ? formatDate(new Date(userProfile.createdAt)) : "Unknown"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Subscription Status</p>
                  <p className="text-gray-900 font-semibold">
                    {userStats?.activeSubscriptions > 0 ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Next Delivery</p>
                  <p className="text-gray-900 font-semibold">
                    {userStats?.activeSubscriptionsList?.[0]?.nextDelivery 
                      ? formatDate(new Date(userStats.activeSubscriptionsList[0].nextDelivery))
                      : 'No active subscriptions'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <PawPrint className="h-4 w-4 text-gray-600" />
                </div>
                Pet Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Set up your pet's profile and preferences for personalized recommendations.</p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/dashboard/pet-profile">Manage Pets</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-gray-600" />
                </div>
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Browse and select premium products for your beloved pets.</p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/dashboard/products">View Products</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-gray-600" />
                </div>
                Delivery Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Manage your delivery preferences and schedule for convenience.</p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/dashboard/delivery">Manage Delivery</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-4 w-4 text-gray-600" />
                </div>
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">View and manage your active subscriptions and billing.</p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/dashboard/subscription/manage">Manage Subscriptions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                </div>
                Subscription Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Finalize your cart and choose delivery frequency.</p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/dashboard/subscription/setup">Setup Subscription</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Manage your account information and preferences.</p>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/dashboard/account">View Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
