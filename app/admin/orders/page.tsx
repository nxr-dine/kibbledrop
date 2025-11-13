"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Loader2, Search, Filter, X, CheckSquare, Square } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Order {
  id: string
  status: string
  total: number
  deliveryName: string
  deliveryPhone: string
  deliveryAddress: string
  city: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    quantity: number
    product: {
      name: string
    }
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)))
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.size === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to update.",
        variant: "destructive",
      })
      return
    }

    setBulkUpdating(true)
    try {
      const updatePromises = Array.from(selectedOrders).map(orderId =>
        fetch(`/api/admin/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      )

      await Promise.all(updatePromises)
      
      toast({
        title: "Orders Updated",
        description: `Updated ${selectedOrders.size} orders to ${newStatus}.`,
      })
      
      setSelectedOrders(new Set())
      fetchOrders() // Refresh the list
    } catch (error) {
      console.error("Error updating orders:", error)
      toast({
        title: "Error",
        description: "Failed to update orders.",
        variant: "destructive",
      })
    } finally {
      setBulkUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "shipped": return "bg-purple-100 text-purple-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "canceled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and delivery status</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order ID, customer name, email, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || statusFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Orders ({filteredOrders.length} of {orders.length})</CardTitle>
              <CardDescription>All customer orders with delivery information</CardDescription>
            </div>
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedOrders.size} selected
                </span>
                <Select onValueChange={handleBulkStatusUpdate} disabled={bulkUpdating}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {orders.length === 0 ? "No orders found" : "No orders match your search criteria"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              {filteredOrders.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllOrders}
                    className="h-8 w-8 p-0"
                  >
                    {selectedOrders.size === filteredOrders.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {selectedOrders.size === filteredOrders.length ? "Deselect all" : "Select all"}
                  </span>
                </div>
              )}
              
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderSelection(order.id)}
                            className="h-6 w-6 p-0"
                          >
                            {selectedOrders.has(order.id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Customer</h4>
                          <p className="text-sm">{order.user.name}</p>
                          <p className="text-sm text-gray-600">{order.user.email}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Delivery</h4>
                          <p className="text-sm">{order.deliveryName}</p>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                          <p className="text-sm text-gray-600">{order.city}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Items ({order.items.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, index) => (
                            <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {item.product.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-48 mt-4 lg:mt-0">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-right lg:text-right">
                          <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 