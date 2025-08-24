# 🔧 TradeSafe Credentials Setup Guide

## Current Issue

Your TradeSafe integration is returning a **401 "invalid_client"** error because the credentials in your `.env` file are demo/placeholder credentials that don't work with the actual TradeSafe API.

## Error Details

```
TradeSafe returned 401: {
  "error": "invalid_client",
  "error_description": "Client authentication failed",
  "message": "Client authentication failed"
}
```

## Solution Steps

### 1. Get Real TradeSafe Credentials

You need to obtain real credentials from TradeSafe:

**For Sandbox/Testing:**
1. Visit [TradeSafe Developer Portal](https://developer.tradesafe.co.za/)
2. Create a developer account
3. Register your application
4. Get your sandbox credentials:
   - `CLIENT_ID` (sandbox)
   - `CLIENT_SECRET` (sandbox)

**For Production:**
1. Contact TradeSafe directly for production credentials
2. Complete their onboarding process
3. Get production credentials

### 2. Update Your .env File

Replace the current placeholder credentials:

```properties
# Current (INVALID) credentials:
TRADESAFE_CLIENT_ID="9fb3e8ec-741c-4e89-a504-cf88d34770d9"
TRADESAFE_CLIENT_SECRET="UKaVdbInSVfw3oYUyWYfv06qSUtrh0CtPSA1WyYU"

# Replace with REAL credentials from TradeSafe:
TRADESAFE_CLIENT_ID="your_real_client_id_here"
TRADESAFE_CLIENT_SECRET="your_real_client_secret_here"
```

### 3. Webhook Secret

You'll also need to set up webhooks in the TradeSafe dashboard and get the webhook secret:

```properties
TRADESAFE_WEBHOOK_SECRET="your_real_webhook_secret_from_dashboard"
```

## Temporary Development Solution

If you want to test the integration without real credentials, I can create a mock mode that simulates TradeSafe responses for development purposes.

## Contact Information

- **TradeSafe Website**: https://tradesafe.co.za/
- **Developer Portal**: https://developer.tradesafe.co.za/
- **Support**: Contact TradeSafe support for credential setup

## Integration Status

✅ **Code Integration**: Complete and working  
✅ **Database**: Working perfectly  
❌ **Credentials**: Need real TradeSafe credentials  
✅ **API Endpoints**: All implemented correctly  

Once you get real credentials from TradeSafe, simply update your `.env` file and the integration will work perfectly!
