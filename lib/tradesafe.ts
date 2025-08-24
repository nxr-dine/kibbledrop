/**
 * TradeSafe Payment Gateway Integration
 *
 * This implementation uses OAuth 2.0 client credentials flow for authentication.
 *
 * Authentication Flow:
 * 1. Client credentials (clientId + clientSecret) are used to get access token
 * 2. Access token is used for subsequent API calls
 * 3. Token is automatically refreshed when it expires
 *
 * Configuration:
 * - TRADESAFE_CLIENT_ID: OAuth Client ID (from TradeSafe OAuth app)
 * - TRADESAFE_CLIENT_SECRET: OAuth Client Secret (from TradeSafe OAuth app)
 * - TRADESAFE_ENVIRONMENT: sandbox | production
 * - TRADESAFE_WEBHOOK_SECRET: For webhook signature verification
 */

export interface TradesafeConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
  webhookSecret: string;
  redirectUrl?: string;
}

export interface TradesafePaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface TradesafePaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
  message?: string;
}

export interface TradesafeWebhookPayload {
  paymentId: string;
  orderId: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  transactionId?: string;
  timestamp: string;
  signature: string;
}

export class TradesafeAPI {
  private config: TradesafeConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: TradesafeConfig) {
    this.config = config;
    // Updated TradeSafe API URLs - using the correct endpoints (.co.za domain)
    this.baseUrl =
      config.environment === "production"
        ? "https://api.tradesafe.co.za"
        : "https://api.tradesafe.co.za"; // TradeSafe appears to use same domain for sandbox
  }

  // OAuth 2.0 token acquisition
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log("🔑 Acquiring OAuth access token from TradeSafe...");
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "KibbleDrop/1.0",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OAuth token request failed: ${response.status} ${response.statusText}`
        );
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;

      // Set token expiry (usually expires_in is in seconds)
      const expiresInMs = (tokenData.expires_in || 3600) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiresInMs - 60000); // Refresh 1 minute early

      console.log("✅ OAuth access token acquired successfully");
      return this.accessToken!; // We know it's not null at this point
    } catch (error) {
      console.error("❌ Failed to acquire OAuth access token:", error);
      throw new Error("OAuth authentication failed");
    }
  }

  async createPayment(
    paymentRequest: TradesafePaymentRequest
  ): Promise<TradesafePaymentResponse> {
    try {
      // Check if we have proper TradeSafe credentials (not just existence, but valid values)
      const hasCredentials =
        this.config.clientId &&
        this.config.clientSecret &&
        this.config.clientId !== "your_tradesafe_merchant_id" &&
        this.config.clientSecret !== "your_tradesafe_api_key" &&
        this.config.clientId.length > 5 &&
        this.config.clientSecret.length > 5;

      console.log("🔍 TradeSafe Credentials Check:", {
        clientId: this.config.clientId
          ? `${this.config.clientId.substring(0, 6)}...`
          : "missing",
        clientSecret: this.config.clientSecret
          ? `${this.config.clientSecret.substring(0, 6)}...`
          : "missing",
        environment: this.config.environment,
        hasValidCredentials: hasCredentials,
      });

      // In development, use mock payment gateway if no credentials or if explicitly requested
      if (process.env.NODE_ENV === "development" && !hasCredentials) {
        console.log(
          "🧪 Using mock TradeSafe payment gateway for development (no valid credentials)"
        );
        return this.createMockPayment(paymentRequest);
      }

      // If we don't have credentials in production, redirect to unavailable page
      if (!hasCredentials) {
        console.error(
          "❌ TradeSafe credentials not configured or contain placeholder values"
        );
        const fallbackUrl = `${process.env.NEXTAUTH_URL}/payment-unavailable?orderId=${paymentRequest.orderId}&amount=${paymentRequest.amount}`;
        return {
          success: true,
          paymentId: "unavailable",
          redirectUrl: fallbackUrl,
          message:
            "Redirecting to payment unavailable page - credentials not configured",
        };
      }

      // Try to make the real API call
      console.log(
        `🌐 Attempting TradeSafe API call to: ${this.baseUrl}/api/payments`
      );
      console.log(`📋 Request payload preview:`, {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        orderId: paymentRequest.orderId,
        environment: this.config.environment,
      });

      // Get OAuth access token
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "KibbleDrop/1.0",
        },
        body: JSON.stringify({
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          order_id: paymentRequest.orderId,
          description: paymentRequest.description,
          customer_email: paymentRequest.customerEmail,
          customer_name: paymentRequest.customerName,
          customer_phone: paymentRequest.customerPhone,
          return_url: paymentRequest.returnUrl,
          cancel_url: paymentRequest.cancelUrl,
          webhook_url: paymentRequest.webhookUrl,
          metadata: paymentRequest.metadata,
        }),
        // Add timeout and SSL handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("TradeSafe API error:", data);
        return {
          success: false,
          error: data.error || "Payment creation failed",
          message: data.message || "Payment gateway returned an error",
        };
      }

      return {
        success: true,
        paymentId: data.payment_id,
        redirectUrl: data.redirect_url,
        message: data.message,
      };
    } catch (error) {
      console.error("Tradesafe payment creation error:", error);

      // Check if it's a network/SSL error
      if (
        error instanceof Error &&
        (error.message.includes("fetch failed") ||
          error.message.includes("SSL") ||
          error.message.includes("TLS") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("timeout"))
      ) {
        console.log("🔌 Network/SSL error detected. This could be:");
        console.log("   - TradeSafe API temporarily unavailable");
        console.log("   - SSL/TLS configuration issue");
        console.log("   - Network connectivity problem");
        console.log("   - Invalid API endpoint URL");
        console.log("   - API requires different authentication method");
        console.log("");
        console.log("💡 Recommendations:");
        console.log(
          "   1. Verify TradeSafe API documentation for correct endpoints"
        );
        console.log("   2. Check if API credentials are properly configured");
        console.log("   3. Test with TradeSafe's official API testing tools");
        console.log("   4. Contact TradeSafe support for API guidance");
      }

      // In development, fall back to mock if real API fails
      if (process.env.NODE_ENV === "development") {
        console.log("🧪 Falling back to mock payment gateway due to API error");
        console.log(
          "   This allows development to continue while API issues are resolved"
        );
        return this.createMockPayment(paymentRequest);
      }

      // In production, redirect to payment unavailable page if API fails
      const fallbackUrl = `${process.env.NEXTAUTH_URL}/payment-unavailable?orderId=${paymentRequest.orderId}&amount=${paymentRequest.amount}`;
      return {
        success: true,
        paymentId: "api_failed",
        redirectUrl: fallbackUrl,
        message: "Redirecting due to payment gateway issues",
      };
    }
  }

  private createMockPayment(
    paymentRequest: TradesafePaymentRequest
  ): TradesafePaymentResponse {
    const mockPaymentId = `mock_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const mockRedirectUrl = `${process.env.NEXTAUTH_URL}/mock-payment?paymentId=${mockPaymentId}&orderId=${paymentRequest.orderId}&amount=${paymentRequest.amount}`;

    console.log("Mock payment created:", {
      paymentId: mockPaymentId,
      orderId: paymentRequest.orderId,
      amount: paymentRequest.amount,
    });

    return {
      success: true,
      paymentId: mockPaymentId,
      redirectUrl: mockRedirectUrl,
      message: "Mock payment created successfully",
    };
  }

  async getPaymentStatus(paymentId: string): Promise<TradesafePaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "KibbleDrop/1.0",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to get payment status",
          message: data.message,
        };
      }

      return {
        success: true,
        paymentId: data.payment_id,
        message: `Payment status: ${data.status}`,
      };
    } catch (error) {
      console.error("Tradesafe payment status error:", error);
      return {
        success: false,
        error: "Network error occurred",
        message: "Failed to connect to payment gateway",
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature verification based on Tradesafe's documentation
    // This is a placeholder - you'll need to implement the actual verification logic
    const expectedSignature = this.generateSignature(payload);
    return signature === expectedSignature;
  }

  private generateSignature(payload: string): string {
    // Implement signature generation based on Tradesafe's documentation
    // This is a placeholder - you'll need to implement the actual signature logic
    const crypto = require("crypto");
    return crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(payload)
      .digest("hex");
  }
}

// Initialize Tradesafe with environment variables (OAuth configuration)
export const tradesafe = new TradesafeAPI({
  clientId:
    process.env.TRADESAFE_CLIENT_ID || process.env.TRADESAFE_MERCHANT_ID || "", // Prefer OAuth client ID, fallback to merchant ID
  clientSecret:
    process.env.TRADESAFE_CLIENT_SECRET || process.env.TRADESAFE_API_KEY || "", // Prefer OAuth client secret, fallback to API key
  environment:
    (process.env.TRADESAFE_ENVIRONMENT as "sandbox" | "production") ||
    "sandbox",
  webhookSecret: process.env.TRADESAFE_WEBHOOK_SECRET || "",
});
