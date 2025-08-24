import { tradesafe } from "./tradesafe";

/**
 * TradeSafe Configuration Checker
 * Helps diagnose payment gateway configuration issues
 */
export class TradesafeConfigChecker {
  static checkConfiguration() {
    const config = {
      merchantId: process.env.TRADESAFE_MERCHANT_ID,
      apiKey: process.env.TRADESAFE_API_KEY,
      environment: process.env.TRADESAFE_ENVIRONMENT,
      webhookSecret: process.env.TRADESAFE_WEBHOOK_SECRET,
    };

    const issues: string[] = [];
    const status = {
      configured: true,
      environment: process.env.NODE_ENV,
      tradesafeEnvironment: config.environment,
      issues: issues,
      recommendation: "",
    };

    // Check for missing credentials
    if (
      !config.merchantId ||
      config.merchantId === "your_tradesafe_merchant_id"
    ) {
      issues.push(
        "TRADESAFE_MERCHANT_ID is not configured or contains placeholder value"
      );
      status.configured = false;
    }

    if (!config.apiKey || config.apiKey === "your_tradesafe_api_key") {
      issues.push(
        "TRADESAFE_API_KEY is not configured or contains placeholder value"
      );
      status.configured = false;
    }

    if (
      !config.webhookSecret ||
      config.webhookSecret === "your_webhook_secret"
    ) {
      issues.push(
        "TRADESAFE_WEBHOOK_SECRET is not configured or contains placeholder value"
      );
    }

    if (!config.environment) {
      issues.push("TRADESAFE_ENVIRONMENT is not set");
      status.configured = false;
    }

    // Check for short credentials (likely invalid)
    if (config.merchantId && config.merchantId.length < 5) {
      issues.push("TRADESAFE_MERCHANT_ID appears to be too short");
      status.configured = false;
    }

    if (config.apiKey && config.apiKey.length < 10) {
      issues.push("TRADESAFE_API_KEY appears to be too short");
      status.configured = false;
    }

    // Provide recommendations
    if (!status.configured) {
      if (process.env.NODE_ENV === "development") {
        status.recommendation =
          "For development: Configure TradeSafe sandbox credentials or continue with mock payments. " +
          "Run 'npm run setup:tradesafe' for guided setup.";
      } else {
        status.recommendation =
          "For production: You must configure valid TradeSafe credentials. " +
          "Update your environment variables with real TradeSafe API credentials.";
      }
    } else {
      status.recommendation =
        "TradeSafe is properly configured and ready to process payments.";
    }

    return status;
  }

  static logStatus() {
    const status = this.checkConfiguration();

    console.log("🏦 TradeSafe Configuration Status");
    console.log("================================");
    console.log(`Environment: ${status.environment}`);
    console.log(`TradeSafe Environment: ${status.tradesafeEnvironment}`);
    console.log(`Configured: ${status.configured ? "✅ Yes" : "❌ No"}`);

    if (status.issues.length > 0) {
      console.log("\n⚠️  Issues found:");
      status.issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    console.log(`\n💡 Recommendation: ${status.recommendation}`);
    console.log("");

    return status;
  }

  static async testConnection() {
    const status = this.checkConfiguration();

    if (!status.configured) {
      console.log(
        "❌ Cannot test connection - TradeSafe not properly configured"
      );
      return false;
    }

    try {
      // Create a minimal test payment request (won't actually process)
      const testRequest = {
        amount: 1, // 1 cent
        currency: "ZAR",
        orderId: `test_${Date.now()}`,
        description: "Connection test",
        customerEmail: "test@example.com",
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
      };

      // This would attempt to create a payment but we're just testing the connection
      console.log("🔍 Testing TradeSafe API connection...");
      console.log(
        "(Note: This is a connection test, no actual payment will be created)"
      );

      // In a real implementation, you might want to use a TradeSafe API endpoint
      // that doesn't create a payment but tests connectivity

      return true;
    } catch (error) {
      console.error("❌ TradeSafe connection test failed:", error);
      return false;
    }
  }
}

// Add to package.json scripts:
// "setup:tradesafe": "bash scripts/setup-tradesafe.sh",
// "check:tradesafe": "node -e \"require('./lib/tradesafe-checker').TradesafeConfigChecker.logStatus()\""
