"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, AlertTriangle } from "lucide-react"

export default function TestAdminAccessPage() {
  const { user, isLoggedIn, isLoading } = useAuth()
  const [testResults, setTestResults] = useState<any>({})

  const testAdminAccess = async () => {
    const results: any = {}
    
    // Test admin products API
    try {
      const response = await fetch('/api/admin/products')
      results.productsAPI = {
        status: response.status,
        success: response.ok,
        data: response.ok ? await response.json() : await response.text()
      }
    } catch (error) {
      results.productsAPI = { error: error.message }
    }

    // Test admin users API
    try {
      const response = await fetch('/api/admin/users')
      results.usersAPI = {
        status: response.status,
        success: response.ok,
        data: response.ok ? await response.json() : await response.text()
      }
    } catch (error) {
      results.usersAPI = { error: error.message }
    }

    // Test admin orders API
    try {
      const response = await fetch('/api/admin/orders')
      results.ordersAPI = {
        status: response.status,
        success: response.ok,
        data: response.ok ? await response.json() : await response.text()
      }
    } catch (error) {
      results.ordersAPI = { error: error.message }
    }

    setTestResults(results)
  }

  const getAccessStatus = () => {
    if (isLoading) return { status: 'loading', icon: '⏳', color: 'text-gray-500' }
    if (!isLoggedIn) return { status: 'not-logged-in', icon: '❌', color: 'text-red-500' }
    if (user?.role === 'admin') return { status: 'admin', icon: '✅', color: 'text-green-500' }
    return { status: 'customer', icon: '⚠️', color: 'text-orange-500' }
  }

  const accessStatus = getAccessStatus()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Access Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${accessStatus.color}`}>{accessStatus.icon}</span>
                <div>
                  <p className="font-semibold">Status: {accessStatus.status}</p>
                  <p className="text-sm text-gray-600">
                    {accessStatus.status === 'admin' && 'You have admin access'}
                    {accessStatus.status === 'customer' && 'You have customer access only'}
                    {accessStatus.status === 'not-logged-in' && 'You are not logged in'}
                    {accessStatus.status === 'loading' && 'Checking access...'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p><strong>Is Logged In:</strong> {isLoggedIn ? 'Yes' : 'No'}</p>
                <p><strong>User Role:</strong> 
                  <Badge className="ml-2" variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role || 'None'}
                  </Badge>
                </p>
                <p><strong>User Email:</strong> {user?.email || 'None'}</p>
                <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              </div>

              <Button onClick={testAdminAccess} className="w-full">
                Test Admin API Access
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(testResults).length === 0 ? (
              <p className="text-gray-500">Click "Test Admin API Access" to see results</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(testResults).map(([api, result]: [string, any]) => (
                  <div key={api} className="border rounded p-3">
                    <h3 className="font-semibold capitalize">{api.replace('API', '')} API</h3>
                    <div className="text-sm">
                      <p><strong>Status:</strong> {result.status || 'N/A'}</p>
                      <p><strong>Success:</strong> {result.success ? '✅ Yes' : '❌ No'}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">View Data</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {result.error && (
                        <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 