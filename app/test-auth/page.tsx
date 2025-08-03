"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const { user, isLoggedIn, isLoading } = useAuth()
  const [authTest, setAuthTest] = useState<any>(null)
  const [productsTest, setProductsTest] = useState<any>(null)

  const testAuth = async () => {
    try {
      const response = await fetch('/api/test-auth')
      const data = await response.json()
      setAuthTest(data)
    } catch (error) {
      setAuthTest({ error: error.message })
    }
  }

  const testProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      setProductsTest(data)
    } catch (error) {
      setProductsTest({ error: error.message })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth Context</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testAuth}>Test Auth API</Button>
              <Button onClick={testProducts}>Test Products API</Button>
              
              {authTest && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold">Auth Test Result:</h3>
                  <pre className="text-sm">{JSON.stringify(authTest, null, 2)}</pre>
                </div>
              )}
              
              {productsTest && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold">Products Test Result:</h3>
                  <pre className="text-sm">{JSON.stringify(productsTest, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 