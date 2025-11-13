"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Calendar,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { formatZAR } from "@/lib/currency";

interface Subscription {
  id: string;
  userId: string;
  frequency: string;
  status: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  city: string;
  postalCode: string;
  nextDelivery: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  items: SubscriptionItem[];
}

interface SubscriptionItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else {
        throw new Error("Failed to fetch subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, status: newStatus } : sub
          )
        );
        toast({
          title: "Success",
          description: `Subscription ${newStatus}`,
        });
      } else {
        throw new Error("Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Pause className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "bi-weekly":
        return "Bi-weekly";
      case "tri-weekly":
        return "Tri-weekly";
      case "monthly":
        return "Monthly";
      default:
        return frequency;
    }
  };

  const calculateSubscriptionValue = (items: SubscriptionItem[]) => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.deliveryName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    const matchesFrequency =
      frequencyFilter === "all" || subscription.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFrequency;
  });

  // Statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    paused: subscriptions.filter((s) => s.status === "paused").length,
    canceled: subscriptions.filter((s) => s.status === "canceled").length,
    totalValue: subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + calculateSubscriptionValue(s.items), 0),
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Manage Subscriptions
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage customer subscriptions
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.paused}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.canceled}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name, email, or delivery name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="tri-weekly">Tri-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            Manage customer subscriptions and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery Info</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Next Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.user.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {subscription.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.deliveryName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {subscription.deliveryAddress}, {subscription.city}
                          </div>
                          <div className="text-sm text-gray-600">
                            {subscription.deliveryPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getFrequencyDisplay(subscription.frequency)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {subscription.items.map((item, index) => (
                            <div key={item.id}>
                              {item.quantity}x {item.product.name}
                              {index < subscription.items.length - 1 && <br />}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatZAR(
                            calculateSubscriptionValue(subscription.items)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {subscription.nextDelivery
                            ? format(
                                new Date(subscription.nextDelivery),
                                "MMM dd, yyyy"
                              )
                            : "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {subscription.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSubscriptionStatus(
                                  subscription.id,
                                  "paused"
                                )
                              }
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          {subscription.status === "paused" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSubscriptionStatus(
                                  subscription.id,
                                  "active"
                                )
                              }
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {subscription.status !== "canceled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSubscriptionStatus(
                                  subscription.id,
                                  "canceled"
                                )
                              }
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
