"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestRegistrationPage() {
  const [testData, setTestData] = useState({
    name: "Test User",
    email: "testuser@example.com",
    password: "Password123"
  })
  const [result, setResult] = useState<any>(null)

  const testRegistration = async () => {
    try {
      console.log("Testing registration with:", testData)
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      console.log("Registration result:", { status: response.status, data })
      
      setResult({ status: response.status, data, success: response.ok })
    } catch (error) {
      console.error("Test registration error:", error)
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Registration API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={testData.name}
              onChange={(e) => setTestData({ ...testData, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={testData.email}
              onChange={(e) => setTestData({ ...testData, email: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={testData.password}
              onChange={(e) => setTestData({ ...testData, password: e.target.value })}
            />
          </div>
          
          <Button onClick={testRegistration} className="w-full">
            Test Registration
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 