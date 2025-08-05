"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { login, isLoggedIn, isLoading } = useAuth()

  // Redirect if user is already logged in when page loads
  useEffect(() => {
    console.log("[LoginPage] useEffect: isLoggedIn=", isLoggedIn, "isLoading=", isLoading)
    if (isLoggedIn && !isLoading) {
      console.log("[LoginPage] Detected logged in, redirecting to dashboard (router.replace)...")
      router.replace("/dashboard")
      // Fallback: force hard redirect if router.replace does not work
      setTimeout(() => {
        if (window.location.pathname !== "/dashboard") {
          console.log("[LoginPage] Fallback: Forcing hard redirect to /dashboard")
          window.location.href = "/dashboard"
        }
      }, 1500)
    }
  }, [isLoggedIn, isLoading, router])

  // Handle redirect after successful login
  useEffect(() => {
    if (isLoggedIn && !isLoading && isSubmitting) {
      console.log("Login successful, redirecting to dashboard...")
      setIsSubmitting(false)
      router.replace("/dashboard")
    }
  }, [isLoggedIn, isLoading, isSubmitting, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      console.log("Starting login process...")
      await login(formData.email, formData.password)
      
      console.log("Login successful, showing toast...")
      toast({
        title: "Success!",
        description: "Welcome back to KibbleDrop!",
      })
      
      // Don't redirect here - let the useEffect handle it
      console.log("Login completed, waiting for session to establish...")
    } catch (error) {
      console.error("Login error:", error)
      setIsSubmitting(false)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your KibbleDrop account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm">
                  Remember me
                </Label>
              </div>
              <Link href="#" className="text-sm text-orange-600 hover:text-orange-500">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-orange-600 hover:text-orange-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
