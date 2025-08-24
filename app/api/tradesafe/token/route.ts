/**
 * TradeSafe OAuth Token API Route
 * 
 * This endpoint handles OAuth 2.0 client credentials authentication with TradeSafe.
 * It exchanges your CLIENT_ID and CLIENT_SECRET for an access token.
 * 
 * POST /api/tradesafe/token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTradeSafeUrls, getTradeSafeCredentials } from '@/lib/tradesafe-config';

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
    // Get credentials and URLs from environment-based configuration
    const { clientId, clientSecret } = getTradeSafeCredentials();
    const { authUrl } = getTradeSafeUrls();

    console.log('🔑 Requesting OAuth access token from TradeSafe...');

    // Make OAuth token request to TradeSafe auth server
    const tokenResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',  // OAuth 2.0 client credentials flow
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    // Check if the authentication was successful
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ TradeSafe authentication failed:', {
        status: tokenResponse.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: `TradeSafe returned ${tokenResponse.status}: ${errorText}`,
        },
        { status: tokenResponse.status }
      );
    }

    // Parse the token response
    const tokenData: TokenResponse = await tokenResponse.json();
    
    console.log('✅ Successfully obtained access token from TradeSafe');
    console.log(`⏰ Token expires in ${tokenData.expires_in} seconds`);

    // Return the access token to the client
    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

  } catch (error) {
    console.error('❌ Unexpected error during token request:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
