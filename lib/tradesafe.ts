export interface TradesafeConfig {
  merchantId: string;
  apiKey: string;
  environment: "sandbox" | "production";
  webhookSecret: string;
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

  constructor(config: TradesafeConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === "production"
        ? "https://api.tradesafe.com"
        : "https://sandbox-api.tradesafe.com";
  }

  async createPayment(
    paymentRequest: TradesafePaymentRequest
  ): Promise<TradesafePaymentResponse> {
    try {
      // Check if we have proper TradeSafe credentials (not just existence, but valid values)
      const hasCredentials = this.config.merchantId && 
                           this.config.apiKey && 
                           this.config.merchantId !== "your_tradesafe_merchant_id" &&
                           this.config.apiKey !== "your_tradesafe_api_key" &&
                           this.config.merchantId.length > 5 &&
                           this.config.apiKey.length > 5;

      console.log("🔍 TradeSafe Credentials Check:", {
        merchantId: this.config.merchantId ? `${this.config.merchantId.substring(0, 6)}...` : "missing",
        apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 6)}...` : "missing",
        environment: this.config.environment,
        hasValidCredentials: hasCredentials
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
        console.error("❌ TradeSafe credentials not configured or contain placeholder values");
        const fallbackUrl = `${process.env.NEXTAUTH_URL}/payment-unavailable?orderId=${paymentRequest.orderId}&amount=${paymentRequest.amount}`;
        return {
          success: true,
          paymentId: "unavailable",
          redirectUrl: fallbackUrl,
          message: "Redirecting to payment unavailable page - credentials not configured",
        };
      }

      // Try to make the real API call
      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          "X-Merchant-ID": this.config.merchantId,
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

      // In development, fall back to mock if real API fails
      if (process.env.NODE_ENV === "development") {
        console.log("🧪 Falling back to mock payment gateway due to API error");
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
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "X-Merchant-ID": this.config.merchantId,
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

// Initialize Tradesafe with environment variables
export const tradesafe = new TradesafeAPI({
  merchantId: process.env.TRADESAFE_MERCHANT_ID || "",
  apiKey: process.env.TRADESAFE_API_KEY || "",
  environment:
    (process.env.TRADESAFE_ENVIRONMENT as "sandbox" | "production") ||
    "sandbox",
  webhookSecret: process.env.TRADESAFE_WEBHOOK_SECRET || "",
});
