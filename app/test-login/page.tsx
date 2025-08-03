"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLoginPage() {
  const { login, user, isLoggedIn, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "admin@kibbledrop.com",
    password: "Password123"
  })
  const [loginResult, setLoginResult] = useState<any>(null)

  const handleLogin = async () => {
    try {
      await login(formData.email, formData.password)
      setLoginResult({ success: true, message: "Login successful" })
    } catch (error) {
      setLoginResult({ success: false, error: error.message })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Login Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button onClick={handleLogin}>Test Login</Button>
              
              {loginResult && (
                <div className={`p-4 rounded ${loginResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <pre className="text-sm">{JSON.stringify(loginResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Is Logged In:</strong> {isLoggedIn ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Name:</strong> {user?.name || 'None'}</p>
              <p><strong>User Role:</strong> {user?.role || 'None'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 