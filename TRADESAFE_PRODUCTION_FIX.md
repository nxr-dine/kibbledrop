# TradeSafe Production Deployment Fix

## Problem

Your production site (kibbledrop.com) is showing "Payment Gateway Unavailable" because TradeSafe OAuth credentials are not properly configured in your hosting environment.

## Root Cause

1. Production environment variables are missing or using placeholder values
2. OAuth credentials might not be properly set for production environment
3. TradeSafe OAuth app redirect URL needs to point to production domain

## Immediate Fix Steps

### 1. Update Production Environment Variables

In your hosting provider (Vercel, Netlify, etc.), set these environment variables:

```bash
# TradeSafe OAuth Credentials (CRITICAL)
TRADESAFE_CLIENT_ID="your_production_oauth_client_id"
TRADESAFE_CLIENT_SECRET="your_production_oauth_client_secret"
TRADESAFE_ENVIRONMENT="production"
TRADESAFE_WEBHOOK_SECRET="your_production_webhook_secret"

# NextAuth (CRITICAL)
NEXTAUTH_URL="https://kibbledrop.com"
NEXTAUTH_SECRET="cc1RWwkjLO/24HiwjEdSU+P5MRPvGjNHtMv1AKfiGCo="

# Database (CRITICAL)
DATABASE_URL="your_production_database_url"
```

### 2. Update TradeSafe OAuth App Settings

1. Log into your TradeSafe merchant dashboard
2. Go to OAuth/API applications
3. Update redirect URL from `https://example.net/oauth/callback` to:
   - `https://kibbledrop.com/api/tradesafe/oauth/callback`
4. Ensure the OAuth app is set to "production" mode

### 3. Get Production OAuth Credentials

If you're using sandbox credentials in production:

1. Create a new OAuth application for production in TradeSafe
2. Use the production client ID and secret in your environment variables
3. Set `TRADESAFE_ENVIRONMENT="production"`

### 4. Verification Steps

After updating environment variables and redeploying:

1. Visit `https://kibbledrop.com`
2. Try to initiate a payment/subscription
3. Check browser console for any OAuth-related errors
4. Verify the redirect URL matches your TradeSafe OAuth app settings

## Current Code Status

✅ OAuth 2.0 authentication flow implemented
✅ Fallback handling for missing credentials
✅ Environment variable mapping updated to prefer OAuth credentials
✅ Callback endpoint created for OAuth flow

## Testing the Fix

1. Update environment variables in your hosting provider
2. Redeploy the application
3. Test the payment flow on kibbledrop.com
4. If still getting errors, check your hosting provider's logs for specific error messages

## Environment Variable Priority

The code now uses this priority:

1. `TRADESAFE_CLIENT_ID` (preferred for OAuth)
2. `TRADESAFE_MERCHANT_ID` (fallback)

This ensures compatibility with both OAuth and legacy setups.
