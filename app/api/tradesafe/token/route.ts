/**
 * TradeSafe OAuth Token API Route
 *
 * This endpoint handles OAuth 2.0 client credentials authentication with TradeSafe.
 * It exchanges your CLIENT_ID and CLIENT_SECRET for an access token.
 *
 * POST /api/tradesafe/token
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTradeSafeUrls,
  getTradeSafeCredentials,
} from "@/lib/tradesafe-config";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * POST /api/tradesafe/token
 *
 * Authenticates with TradeSafe using OAuth 2.0 client credentials flow
 * and returns an access token for subsequent API calls.
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔑 Starting TradeSafe OAuth token request...");
    
    // Get credentials and URLs from environment-based configuration
    console.log("📋 Step 1: Getting TradeSafe configuration...");
    const { clientId, clientSecret } = getTradeSafeCredentials();
    const { authUrl } = getTradeSafeUrls();

    console.log("🌐 OAuth URL:", authUrl);
    console.log("🔑 Client ID:", clientId ? `${clientId.substring(0, 8)}...` : "MISSING");
    console.log("🔐 Client Secret:", clientSecret ? `${clientSecret.length} chars` : "MISSING");

    if (!clientId || !clientSecret) {
      console.error("❌ Missing TradeSafe credentials");
      return NextResponse.json(
        { error: "TradeSafe credentials not configured" },
        { status: 500 }
      );
    }

    console.log("📡 Step 2: Making OAuth request to TradeSafe...");
    console.log("⏱️  Request started at:", new Date().toISOString());

    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    console.log("📝 Request body:", {
      grant_type: "client_credentials",
      client_id: `${clientId.substring(0, 8)}...`,
      client_secret: `${clientSecret.substring(0, 8)}...`
    });

    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let tokenResponse;
    try {
      tokenResponse = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "KibbleDrop/1.0"
        },
        body: requestBody,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log("✅ Request completed successfully");
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("❌ Network error during OAuth request:", fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: "Request timeout", message: "TradeSafe OAuth request timed out after 15 seconds" },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Network error", 
          message: fetchError instanceof Error ? fetchError.message : "Failed to connect to TradeSafe",
          details: {
            name: fetchError instanceof Error ? fetchError.name : "Unknown",
            code: (fetchError as any)?.code || "Unknown"
          }
        },
        { status: 503 }
      );
    }

    console.log("📊 Response status:", tokenResponse.status);
    console.log("📊 Response headers:", Object.fromEntries(tokenResponse.headers.entries()));
    console.log("⏱️  Response received at:", new Date().toISOString());

    // Check if the authentication was successful
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ TradeSafe authentication failed:", {
        status: tokenResponse.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          error: "Authentication failed",
          message: `TradeSafe returned ${tokenResponse.status}: ${errorText}`,
        },
        { status: tokenResponse.status }
      );
    }

    // Parse the token response
    const tokenData: TokenResponse = await tokenResponse.json();

    console.log("✅ Successfully obtained access token from TradeSafe");
    console.log(`⏰ Token expires in ${tokenData.expires_in} seconds`);

    // Return the access token to the client
    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
    });
  } catch (error) {
    console.error("❌ Unexpected error during token request:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
