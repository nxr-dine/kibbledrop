/**
 * Simple TradeSafe API Test
 * Tests the core TradeSafe functionality without database operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getTradeSafeUrls } from "@/lib/tradesafe-config";

interface TokenResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function GET() {
  try {
    console.log("🚀 Testing TradeSafe API integration...");

    // Skip external API calls during build time
    if (
      process.env.NODE_ENV === "production" &&
      !process.env.NEXTAUTH_URL?.includes("localhost")
    ) {
      return NextResponse.json({
        success: true,
        message: "TradeSafe API integration test skipped during build",
        build_mode: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 1: Test token endpoint
    console.log("🔑 Step 1: Testing token endpoint...");
    const tokenResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/tradesafe/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`
      );
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    if (!tokenData.success) {
      throw new Error("Failed to obtain access token");
    }

    console.log("✅ Token obtained successfully");

    return NextResponse.json({
      success: true,
      message: "TradeSafe API integration is working correctly",
      token_test: {
        success: true,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ TradeSafe API test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "TradeSafe API test failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
