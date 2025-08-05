"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Save, 
  Edit, 
  X, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Bell,
  Lock,
  Eye,
  Phone,
  MapPin,
  CreditCard,
  Heart,
  Truck
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

export default function AccountPage() {
  const { user, isLoggedIn } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Fetch user profile and stats
  useEffect(() => {
    if (isLoggedIn && user) {
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
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || ""
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Failed to load profile data')
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mb-6">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome Back!</h1>
            <p className="text-xl text-gray-600 mb-8">Please log in to access your account settings</p>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <User className="h-5 w-5 mr-2" />
              Log In to Your Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(updatedProfile)
        toast.success("Profile updated successfully!")
        setIsEditing(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address || ""
    })
    setIsEditing(false)
  }

  const handlePasswordChange = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      if (response.ok) {
        toast.success("Password updated successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        setIsChangingPassword(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update password")
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error("Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setIsChangingPassword(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="text-lg text-gray-600 mt-2">Manage your profile, preferences, and account security</p>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              size="lg"
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "border-gray-300 hover:bg-gray-50" : "bg-orange-600 hover:bg-orange-700"}
            >
              {isEditing ? (
                <>
                  <X className="h-5 w-5 mr-2" />
                  Cancel Editing
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 overflow-x-auto">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Profile Hero Card */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white">
              <div className="bg-orange-600 p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
                      <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                      <AvatarFallback className="text-xl sm:text-3xl font-bold bg-white text-orange-600">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2 border-2 border-white">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{userProfile?.name || user?.name || "User"}</h2>
                    <p className="text-orange-100 text-base sm:text-lg mb-3 break-all">{userProfile?.email || user?.email}</p>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 justify-center sm:justify-start">
                      <Badge className="bg-white/10 text-white border-white/20">
                        <Shield className="h-3 w-3 mr-1" />
                        {userProfile?.role || user?.role === 'admin' ? 'Administrator' : 'Customer'}
                      </Badge>
                      <Badge className="bg-green-600/20 text-green-100 border-green-400/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active Account
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
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
                        <Mail className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Email Status</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={userProfile?.emailVerified ? "default" : "secondary"} className="text-xs">
                            {userProfile?.emailVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Verified
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
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
                            : 'No active subscriptions'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 w-full"
                        />
                      ) : (
                        <div className="h-12 px-4 bg-gray-50 rounded-md flex items-center border border-gray-200 w-full">
                          <span className="text-gray-900">{userProfile?.name || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 w-full"
                        />
                      ) : (
                        <div className="h-12 px-4 bg-gray-50 rounded-md flex items-center border border-gray-200 w-full">
                          <span className="text-gray-900">{userProfile?.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 w-full"
                        />
                      ) : (
                        <div className="h-12 px-4 bg-gray-50 rounded-md flex items-center border border-gray-200 w-full">
                          <span className="text-gray-900">{userProfile?.phone || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                        Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Enter your address"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 w-full"
                        />
                      ) : (
                        <div className="h-12 px-4 bg-gray-50 rounded-md flex items-center border border-gray-200 w-full">
                          <span className="text-gray-900">{userProfile?.address || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="border-gray-300">
                  Cancel
                </Button>
              </div>
            )}
          </div>

                     {/* Sidebar */}
           <div className="space-y-6">
                          {/* Account Stats */}
             <Card className="shadow-lg border-0 bg-gray-50">
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg">Account Stats</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                                   <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{userStats?.ordersCompleted || 0}</div>
                    <div className="text-sm text-gray-600">Orders Completed</div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{userStats?.activeSubscriptions || 0}</div>
                    <div className="text-sm text-gray-600">Active Subscriptions</div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{userStats?.petsRegistered || 0}</div>
                    <div className="text-sm text-gray-600">Pets Registered</div>
                  </div>
                </CardContent>
              </Card>

                             {/* Change Password Card */}
               <Card className="shadow-lg border-0">
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                       <Lock className="h-3 w-3 text-gray-600" />
                     </div>
                     Change Password
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {!isChangingPassword ? (
                     <Button 
                       onClick={() => setIsChangingPassword(true)}
                       className="w-full bg-orange-600 hover:bg-orange-700"
                     >
                       <Lock className="h-4 w-4 mr-2" />
                       Change Password
                     </Button>
                   ) : (
                     <>
                       <div className="space-y-3">
                         <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                           Current Password
                         </Label>
                         <Input
                           id="currentPassword"
                           type="password"
                           value={passwordData.currentPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                           placeholder="Enter current password"
                           className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                         />
                       </div>
                       
                       <div className="space-y-3">
                         <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                           New Password
                         </Label>
                         <Input
                           id="newPassword"
                           type="password"
                           value={passwordData.newPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                           placeholder="Enter new password"
                           className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                         />
                       </div>
                       
                       <div className="space-y-3">
                         <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                           Confirm Password
                         </Label>
                         <Input
                           id="confirmPassword"
                           type="password"
                           value={passwordData.confirmPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                           placeholder="Confirm new password"
                           className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                         />
                       </div>
                       
                       <div className="flex gap-2">
                         <Button 
                           onClick={handlePasswordChange}
                           disabled={isLoading}
                           className="flex-1 bg-orange-600 hover:bg-orange-700"
                         >
                           <Lock className="h-4 w-4 mr-2" />
                           {isLoading ? "Updating..." : "Update Password"}
                         </Button>
                         <Button 
                           variant="outline" 
                           onClick={handlePasswordCancel}
                           disabled={isLoading}
                           className="border-gray-300"
                         >
                           Cancel
                         </Button>
                       </div>
                     </>
                   )}
                 </CardContent>
               </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 