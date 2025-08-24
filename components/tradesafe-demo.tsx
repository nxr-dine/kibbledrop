/**
 * TradeSafe Demo Component
 *
 * This React component demonstrates how to interact with the TradeSafe API
 * from the frontend. It allows users to:
 * 1. Get an OAuth access token
 * 2. Create a new trade/transaction
 * 3. View transaction details
 * 4. Monitor webhook callbacks
 */

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: string;
  error?: string;
}

interface TradeResponse {
  success: boolean;
  data?: {
    transaction: {
      id: string;
      title: string;
      description: string;
      state: string;
      currency: string;
      reference: string;
      createdAt: string;
      parties: any[];
      allocations: any[];
    };
    buyer: {
      tokenId: string;
      name: string;
      email: string;
    };
    seller: {
      tokenId: string;
      name: string;
      email: string;
      organization?: string;
    };
    paymentLink: {
      id: string;
      url: string;
      expiresAt: string;
    };
  };
  error?: string;
}

interface WebhookStatus {
  message: string;
  status: string;
  webhookSecret: string;
  mockDatabase: {
    transactionCount: number;
    transactions: any[];
  };
}

export default function TradesafeDemo() {
  const { toast } = useToast();

  // State for token management
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);

  // State for trade creation
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeData, setTradeData] = useState<TradeResponse | null>(null);

  // State for webhook monitoring
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookData, setWebhookData] = useState<WebhookStatus | null>(null);

  // Form state for trade creation
  const [tradeForm, setTradeForm] = useState({
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
   * Get OAuth access token from TradeSafe
   */
  const handleGetToken = async () => {
    setTokenLoading(true);
    try {
      const response = await fetch("/api/tradesafe/token");
      const data: TokenResponse = await response.json();

      setTokenData(data);

      if (data.success) {
        toast({
          title: "✅ Token obtained successfully",
          description: `Expires in ${data.expires_in} seconds`,
        });
      } else {
        toast({
          title: "❌ Failed to obtain token",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to communicate with API",
        variant: "destructive",
      });
    } finally {
      setTokenLoading(false);
    }
  };

  /**
   * Create a new trade/transaction
   */
  const handleCreateTrade = async () => {
    setTradeLoading(true);
    try {
      const response = await fetch("/api/tradesafe/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeForm),
      });

      const data: TradeResponse = await response.json();
      setTradeData(data);

      if (data.success) {
        toast({
          title: "✅ Trade created successfully",
          description: `Transaction ID: ${data.data?.transaction.id}`,
        });
      } else {
        toast({
          title: "❌ Failed to create trade",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create trade",
        variant: "destructive",
      });
    } finally {
      setTradeLoading(false);
    }
  };

  /**
   * Check webhook status and recent transactions
   */
  const handleCheckWebhooks = async () => {
    setWebhookLoading(true);
    try {
      const response = await fetch("/api/tradesafe/callback");
      const data: WebhookStatus = await response.json();

      setWebhookData(data);
      toast({
        title: "✅ Webhook status updated",
        description: `Found ${data.mockDatabase.transactionCount} transactions`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to check webhook status",
        variant: "destructive",
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 Copied to clipboard",
        description: text.length > 50 ? `${text.substring(0, 50)}...` : text,
      });
    } catch (error) {
      toast({
        title: "❌ Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TradeSafe GraphQL API Demo
        </h1>
        <p className="text-gray-600">
          Demonstration of TradeSafe integration with OAuth authentication,
          trade creation, and webhook handling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: OAuth Token */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                1
              </span>
              OAuth Authentication
            </CardTitle>
            <CardDescription>
              Get an access token using OAuth 2.0 client credentials flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGetToken}
              disabled={tokenLoading}
              className="w-full"
            >
              {tokenLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting
                  Token...
                </>
              ) : (
                <>🔑 Get Access Token</>
              )}
            </Button>

            {tokenData && (
              <div className="space-y-2">
                {tokenData.success ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>
                          <strong>Token Type:</strong> {tokenData.token_type}
                        </p>
                        <p>
                          <strong>Expires:</strong> {tokenData.expires_at}
                        </p>
                        <div className="flex items-center gap-2">
                          <strong>Token:</strong>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(tokenData.access_token || "")
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">
                          {tokenData.access_token}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{tokenData.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Create Trade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                2
              </span>
              Create Trade Contract
            </CardTitle>
            <CardDescription>
              Create a trade with sample buyer and seller details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="title">Trade Title</Label>
                <Input
                  id="title"
                  value={tradeForm.title}
                  onChange={(e) =>
                    setTradeForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (ZAR)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={tradeForm.amount}
                  onChange={(e) =>
                    setTradeForm((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={tradeForm.description}
                onChange={(e) =>
                  setTradeForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>

            <Button
              onClick={handleCreateTrade}
              disabled={tradeLoading}
              className="w-full"
            >
              {tradeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Trade...
                </>
              ) : (
                <>🏗️ Create Trade</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trade Results */}
      {tradeData && tradeData.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Trade Created Successfully
              <Badge variant="secondary">
                {tradeData.data?.transaction.state}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Transaction Details */}
              <div className="space-y-2">
                <h4 className="font-semibold">Transaction</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>ID:</strong> {tradeData.data?.transaction.id}
                  </p>
                  <p>
                    <strong>Reference:</strong>{" "}
                    {tradeData.data?.transaction.reference}
                  </p>
                  <p>
                    <strong>Currency:</strong>{" "}
                    {tradeData.data?.transaction.currency}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(
                      tradeData.data?.transaction.createdAt || ""
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Buyer Details */}
              <div className="space-y-2">
                <h4 className="font-semibold">Buyer</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {tradeData.data?.buyer.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {tradeData.data?.buyer.email}
                  </p>
                  <p>
                    <strong>Token ID:</strong> {tradeData.data?.buyer.tokenId}
                  </p>
                </div>
              </div>

              {/* Seller Details */}
              <div className="space-y-2">
                <h4 className="font-semibold">Seller</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {tradeData.data?.seller.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {tradeData.data?.seller.email}
                  </p>
                  <p>
                    <strong>Company:</strong>{" "}
                    {tradeData.data?.seller.organization}
                  </p>
                  <p>
                    <strong>Token ID:</strong> {tradeData.data?.seller.tokenId}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Link */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Payment Link</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(tradeData.data?.paymentLink.url, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Payment Page
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(tradeData.data?.paymentLink.url || "")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Expires:{" "}
                {new Date(
                  tradeData.data?.paymentLink.expiresAt || ""
                ).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Webhook Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded">
              3
            </span>
            Webhook Monitoring
          </CardTitle>
          <CardDescription>
            Monitor webhook callbacks and transaction state changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCheckWebhooks}
            disabled={webhookLoading}
            className="w-full"
          >
            {webhookLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking
                Webhooks...
              </>
            ) : (
              <>🔔 Check Webhook Status</>
            )}
          </Button>

          {webhookData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge variant="outline">{webhookData.status}</Badge>
                  </p>
                  <p>
                    <strong>Secret:</strong>{" "}
                    <Badge variant="secondary">
                      {webhookData.webhookSecret}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Transactions:</strong>{" "}
                    {webhookData.mockDatabase.transactionCount}
                  </p>
                  <p className="text-sm text-gray-500">
                    Recent webhook callbacks
                  </p>
                </div>
              </div>

              {webhookData.mockDatabase.transactions.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Recent Transactions</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {webhookData.mockDatabase.transactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm border-b pb-1"
                      >
                        <span className="font-mono">{tx.id}</span>
                        <Badge variant="outline">{tx.state}</Badge>
                        <span className="text-gray-500">
                          {new Date(tx.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Environment:</strong> Sandbox mode - safe for testing
          </p>
          <p>
            <strong>Webhook URL:</strong>{" "}
            {typeof window !== "undefined"
              ? `${window.location.origin}/api/tradesafe/callback`
              : "/api/tradesafe/callback"}
          </p>
          <p>
            <strong>Token Endpoint:</strong> /api/tradesafe/token
          </p>
          <p>
            <strong>Trade Endpoint:</strong> /api/tradesafe/trade
          </p>
          <p className="text-xs">
            💡 To test webhooks, configure your TradeSafe application callback
            URL to point to the webhook endpoint above. For local development,
            use ngrok or similar tools to expose your localhost.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
