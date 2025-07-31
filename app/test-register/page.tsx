"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function TestRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== TEST REGISTRATION START ===")
    console.log("Form data:", formData)
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "User created successfully!",
        })
        console.log("=== TEST REGISTRATION SUCCESS ===")
      } else {
        toast({
          title: "Error",
          description: data.error || "Registration failed",
          variant: "destructive",
        })
        console.log("=== TEST REGISTRATION FAILED ===")
      }
    } catch (error) {
      console.error("Test registration error:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
      console.log("=== TEST REGISTRATION ERROR ===")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Test Registration</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="Test User"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="test@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="Password123"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Test Register
          </button>
        </form>
        
        <div className="text-center">
          <a href="/register" className="text-blue-500 hover:underline">
            Go back to real registration
          </a>
        </div>
      </div>
    </div>
  )
} 