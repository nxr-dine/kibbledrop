import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * TradeSafe OAuth Callback Handler
 *
 * This endpoint handles the OAuth callback from TradeSafe after user authorization.
 * TradeSafe will redirect users here with an authorization code that we can
 * exchange for an access token.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("📞 TradeSafe OAuth callback received:", {
      code: code ? `${code.substring(0, 10)}...` : null,
      state,
      error,
    });

    // Check for OAuth errors
    if (error) {
      console.error("❌ OAuth error from TradeSafe:", error);
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL
        }/payment/error?error=oauth_failed&message=${encodeURIComponent(error)}`
      );
    }

    // Check for authorization code
    if (!code) {
      console.error("❌ No authorization code received from TradeSafe");
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/error?error=no_code&message=No authorization code received`
      );
    }

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("❌ No user session found during OAuth callback");
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?callbackUrl=${encodeURIComponent(
          request.url
        )}`
      );
    }

    // Exchange authorization code for access token
    try {
      const tokenResponse = await fetch(
        `${
          process.env.TRADESAFE_API_URL || "https://api.tradesafe.co.za"
        }/oauth/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "KibbleDrop/1.0",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id:
              process.env.TRADESAFE_CLIENT_ID ||
              process.env.TRADESAFE_MERCHANT_ID ||
              "",
            client_secret:
              process.env.TRADESAFE_CLIENT_SECRET ||
              process.env.TRADESAFE_API_KEY ||
              "",
            code: code,
            redirect_uri: `${process.env.NEXTAUTH_URL}/api/tradesafe/oauth/callback`,
          }),
        }
      );

      if (!tokenResponse.ok) {
        throw new Error(
          `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`
        );
      }

      const tokenData = await tokenResponse.json();
      console.log("✅ Successfully exchanged code for access token");

      // Store the access token (you might want to save this to database)
      // For now, we'll redirect to a success page
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/oauth-success?state=${state}`
      );
    } catch (tokenError) {
      console.error("❌ Failed to exchange authorization code:", tokenError);
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL
        }/payment/error?error=token_exchange_failed&message=${encodeURIComponent(
          String(tokenError)
        )}`
      );
    }
  } catch (error) {
    console.error("❌ OAuth callback handler error:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXTAUTH_URL
      }/payment/error?error=callback_error&message=${encodeURIComponent(
        String(error)
      )}`
    );
  }
}

/**
 * Handle POST requests (some OAuth providers use POST for callbacks)
 */
export async function POST(request: NextRequest) {
  console.log("📞 TradeSafe OAuth POST callback received");
  // Redirect POST to GET handler
  return GET(request);
}
