/**
 * TradeSafe Integration Demo Component
 *
 * This React component demonstrates how to create trades using the TradeSafe API.
 * It provides a simple interface to test the complete integration flow.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// TypeScript interface for trade response
interface TradeResponse {
  success: boolean;
  message?: string;
  data?: {
    tradeId: string;
    title: string;
    description: string;
    state: string;
    currency: string;
    reference: string;
    createdAt: string;
    buyer: {
      tokenId: string;
      name: string;
      email: string;
    };
    seller: {
      tokenId: string;
      name: string;
      email: string;
    };
  };
  error?: string;
}

export default function TradesafeIntegrationDemo() {
  // State for loading and trade result
  const [isLoading, setIsLoading] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResponse | null>(null);

  // State for form inputs
  const [formData, setFormData] = useState({
    title: "Premium Pet Food Subscription",
    description: "Monthly delivery of premium kibble and treats",
    amount: 250.0,
    currency: "ZAR",
    buyerName: "John Doe",
    buyerEmail: "john.doe@example.com",
    buyerMobile: "+27123456789",
    sellerName: "Jane Smith",
    sellerEmail: "jane.smith@kibbledrop.com",
    sellerMobile: "+27987654321",
    sellerCompany: "KibbleDrop",
  });

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Create a new trade by calling our API endpoint
   */
  const createTrade = async () => {
    setIsLoading(true);
    setTradeResult(null);

    try {
      console.log("🚀 Creating trade with data:", formData);

      // Call our /api/tradesafe/trade endpoint
      const response = await fetch("/api/tradesafe/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result: TradeResponse = await response.json();

      console.log("📋 Trade result:", result);
      setTradeResult(result);

      if (result.success) {
        console.log("✅ Trade created successfully:", result.data?.tradeId);
      } else {
        console.error("❌ Trade creation failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error creating trade:", error);
      setTradeResult({
        success: false,
        error: "Failed to create trade. Please check the console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TradeSafe Integration Demo
        </h1>
        <p className="text-gray-600">
          Test the complete TradeSafe GraphQL API integration
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create Trade</CardTitle>
          <CardDescription>
            Fill in the details below to create a sample trade using TradeSafe's
            GraphQL API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trade Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Trade Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter trade title"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount ({formData.currency})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  handleInputChange("amount", parseFloat(e.target.value))
                }
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter trade description"
              rows={3}
            />
          </div>

          {/* Buyer Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">
              Buyer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="buyerName">Name</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) =>
                    handleInputChange("buyerName", e.target.value)
                  }
                  placeholder="Buyer name"
                />
              </div>
              <div>
                <Label htmlFor="buyerEmail">Email</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) =>
                    handleInputChange("buyerEmail", e.target.value)
                  }
                  placeholder="buyer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="buyerMobile">Mobile</Label>
                <Input
                  id="buyerMobile"
                  value={formData.buyerMobile}
                  onChange={(e) =>
                    handleInputChange("buyerMobile", e.target.value)
                  }
                  placeholder="+27123456789"
                />
              </div>
            </div>
          </div>

          {/* Seller Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">
              Seller Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sellerName">Name</Label>
                <Input
                  id="sellerName"
                  value={formData.sellerName}
                  onChange={(e) =>
                    handleInputChange("sellerName", e.target.value)
                  }
                  placeholder="Seller name"
                />
              </div>
              <div>
                <Label htmlFor="sellerCompany">Company</Label>
                <Input
                  id="sellerCompany"
                  value={formData.sellerCompany}
                  onChange={(e) =>
                    handleInputChange("sellerCompany", e.target.value)
                  }
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="sellerEmail">Email</Label>
                <Input
                  id="sellerEmail"
                  type="email"
                  value={formData.sellerEmail}
                  onChange={(e) =>
                    handleInputChange("sellerEmail", e.target.value)
                  }
                  placeholder="seller@company.com"
                />
              </div>
              <div>
                <Label htmlFor="sellerMobile">Mobile</Label>
                <Input
                  id="sellerMobile"
                  value={formData.sellerMobile}
                  onChange={(e) =>
                    handleInputChange("sellerMobile", e.target.value)
                  }
                  placeholder="+27987654321"
                />
              </div>
            </div>
          </div>

          {/* Create Trade Button */}
          <div className="pt-4">
            <Button
              onClick={createTrade}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Trade...
                </>
              ) : (
                "Create Trade"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {tradeResult && (
        <Card>
          <CardHeader>
            <CardTitle
              className={
                tradeResult.success ? "text-green-600" : "text-red-600"
              }
            >
              {tradeResult.success
                ? "✅ Trade Created Successfully!"
                : "❌ Trade Creation Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tradeResult.success && tradeResult.data ? (
              <div className="space-y-4">
                {/* Success Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Trade ID:</strong> {tradeResult.data.tradeId}
                    </p>
                    <p>
                      <strong>Reference:</strong> {tradeResult.data.reference}
                    </p>
                    <p>
                      <strong>State:</strong>{" "}
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {tradeResult.data.state}
                      </span>
                    </p>
                    <p>
                      <strong>Currency:</strong> {tradeResult.data.currency}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Buyer:</strong> {tradeResult.data.buyer.name}
                    </p>
                    <p>
                      <strong>Buyer Email:</strong>{" "}
                      {tradeResult.data.buyer.email}
                    </p>
                    <p>
                      <strong>Seller:</strong> {tradeResult.data.seller.name}
                    </p>
                    <p>
                      <strong>Seller Email:</strong>{" "}
                      {tradeResult.data.seller.email}
                    </p>
                  </div>
                </div>

                {/* Raw JSON Response */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Complete API Response:
                  </Label>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(tradeResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Details */}
                <p className="text-red-600">{tradeResult.error}</p>

                {/* Raw Error Response */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Error Response:
                  </Label>
                  <pre className="mt-2 p-4 bg-red-50 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(tradeResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Integration Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-2">
          <p>
            <strong>Environment:</strong>{" "}
            {process.env.NEXT_PUBLIC_TRADESAFE_ENVIRONMENT ||
              process.env.TRADESAFE_ENVIRONMENT ||
              "sandbox"}{" "}
            (Safe for testing)
          </p>
          <p>
            <strong>API Endpoints:</strong>
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <code>/api/tradesafe/token</code> - OAuth authentication
            </li>
            <li>
              <code>/api/tradesafe/trade</code> - Trade creation
            </li>
            <li>
              <code>/api/tradesafe/callback?secret=your_secret</code> - Webhook
              handling
            </li>
          </ul>
          <p>
            <strong>URLs determined by environment:</strong> Automatically
            configured based on TRADESAFE_ENVIRONMENT
          </p>
          <p className="text-xs text-gray-500 mt-2">
            💡 Open your browser's developer console to see detailed API logs
            during trade creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
