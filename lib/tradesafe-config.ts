/**
 * TradeSafe Configuration Helper
 *
 * This module provides helper functions for getting TradeSafe API URLs
 * based on the environment configuration (sandbox vs production).
 */

/**
 * TradeSafe URL configuration object
 */
interface TradeSafeUrls {
  authUrl: string;
  graphqlUrl: string;
}

/**
 * Get TradeSafe API URLs based on environment configuration
 *
 * @returns Object containing auth and GraphQL URLs for the configured environment
 * @throws Error if TRADESAFE_ENVIRONMENT is not set or invalid
 */
export function getTradeSafeUrls(): TradeSafeUrls {
  const environment = process.env.TRADESAFE_ENVIRONMENT;

  if (!environment) {
    throw new Error(
      "TRADESAFE_ENVIRONMENT must be set in environment variables"
    );
  }

  // Auth URL is the same for both environments
  const authUrl = "https://auth.tradesafe.co.za/oauth/token";

  // GraphQL URL depends on environment
  let graphqlUrl: string;

  switch (environment.toLowerCase()) {
    case "sandbox":
      graphqlUrl = "https://api-developer.tradesafe.dev/graphql";
      break;
    case "production":
      graphqlUrl = "https://api.tradesafe.co.za/graphql";
      break;
    default:
      throw new Error(
        `Invalid TRADESAFE_ENVIRONMENT: "${environment}". Must be "sandbox" or "production"`
      );
  }

  return {
    authUrl,
    graphqlUrl,
  };
}

/**
 * Get TradeSafe OAuth credentials from environment variables
 *
 * @returns Object containing client ID and secret
 * @throws Error if credentials are not configured
 */
export function getTradeSafeCredentials() {
  console.log("🔍 Checking TradeSafe credentials in environment...");
  
  const clientId = process.env.TRADESAFE_CLIENT_ID;
  const clientSecret = process.env.TRADESAFE_CLIENT_SECRET;

  console.log("📊 Environment variables status:", {
    TRADESAFE_CLIENT_ID: clientId ? `${clientId.substring(0, 8)}... (${clientId.length} chars)` : "❌ MISSING",
    TRADESAFE_CLIENT_SECRET: clientSecret ? `${clientSecret.substring(0, 8)}... (${clientSecret.length} chars)` : "❌ MISSING",
    NODE_ENV: process.env.NODE_ENV,
    TRADESAFE_ENVIRONMENT: process.env.TRADESAFE_ENVIRONMENT
  });

  if (!clientId || !clientSecret) {
    const missingVars = [];
    if (!clientId) missingVars.push("TRADESAFE_CLIENT_ID");
    if (!clientSecret) missingVars.push("TRADESAFE_CLIENT_SECRET");
    
    console.error("❌ Missing TradeSafe credentials:", missingVars.join(", "));
    throw new Error(
      `Missing TradeSafe credentials: ${missingVars.join(", ")} must be set in environment variables`
    );
  }

  console.log("✅ TradeSafe credentials found and valid");
  return {
    clientId,
    clientSecret,
  };
}

/**
 * Get TradeSafe webhook secret from environment variables
 *
 * @returns Webhook secret string
 * @throws Error if webhook secret is not configured
 */
export function getTradeSafeWebhookSecret(): string {
  const webhookSecret = process.env.TRADESAFE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "TRADESAFE_WEBHOOK_SECRET must be set in environment variables"
    );
  }

  return webhookSecret;
}

/**
 * Get current TradeSafe environment
 *
 * @returns Environment string ('sandbox' or 'production')
 */
export function getTradeSafeEnvironment(): "sandbox" | "production" {
  const environment = process.env.TRADESAFE_ENVIRONMENT?.toLowerCase();

  if (environment !== "sandbox" && environment !== "production") {
    throw new Error(
      `Invalid TRADESAFE_ENVIRONMENT: "${environment}". Must be "sandbox" or "production"`
    );
  }

  return environment;
}
