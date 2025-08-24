# TradeSafe Payment Gateway Configuration

This document explains how to configure the TradeSafe payment gateway for KibbleDrop.

## Overview

KibbleDrop supports three payment modes:

1. **TradeSafe Production** - Live payments (real money)
2. **TradeSafe Sandbox** - Test payments (fake money)
3. **Mock Payments** - Development simulation (no external API calls)

## Current Status

The system is currently using **mock payments** because TradeSafe credentials are not configured or contain placeholder values.

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
npm run setup:tradesafe
```

This will guide you through the configuration process interactively.

### Option 2: Manual Setup

1. Copy the environment template:

   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and update these values:
   ```env
   TRADESAFE_MERCHANT_ID="your_actual_merchant_id"
   TRADESAFE_API_KEY="your_actual_api_key"
   TRADESAFE_ENVIRONMENT="sandbox"  # or "production"
   TRADESAFE_WEBHOOK_SECRET="your_webhook_secret"
   ```

## Getting TradeSafe Credentials

### 1. Sign Up

- Visit [TradeSafe](https://tradesafe.co.za)
- Create a business account
- Complete verification process

### 2. Access Dashboard

- Log into your TradeSafe dashboard
- Navigate to API settings
- Generate your credentials:
  - Merchant ID
  - API Key
  - Webhook Secret

### 3. Environment Setup

**For Development/Testing:**

```env
TRADESAFE_ENVIRONMENT="sandbox"
```

**For Production:**

```env
TRADESAFE_ENVIRONMENT="production"
```

## Configuration Check

Check your current configuration:

```bash
npm run check:tradesafe
```

Or visit: `http://localhost:3000/api/tradesafe/config-status`

## Payment Flow

### With Mock Payments (Current)

1. User initiates payment
2. System detects missing credentials
3. Redirects to mock payment page
4. User can simulate success/failure
5. Subscription activated on success

### With TradeSafe Configured

1. User initiates payment
2. System creates TradeSafe payment
3. User redirected to TradeSafe checkout
4. Real payment processing
5. Webhook confirms payment
6. Subscription activated automatically

## Environment Variables

| Variable                   | Description                        | Required |
| -------------------------- | ---------------------------------- | -------- |
| `TRADESAFE_MERCHANT_ID`    | Your TradeSafe merchant identifier | Yes      |
| `TRADESAFE_API_KEY`        | Your TradeSafe API key             | Yes      |
| `TRADESAFE_ENVIRONMENT`    | `sandbox` or `production`          | Yes      |
| `TRADESAFE_WEBHOOK_SECRET` | Secret for webhook validation      | Yes      |

## Troubleshooting

### Issue: Still seeing mock payments after configuration

**Check:**

1. Restart your development server: `npm run dev`
2. Verify credentials are not placeholder values
3. Check console logs for configuration warnings
4. Run: `npm run check:tradesafe`

### Issue: TradeSafe API errors

**Solutions:**

1. Verify credentials are correct
2. Check TradeSafe account status
3. Ensure environment (sandbox/production) matches your credentials
4. Check TradeSafe API documentation for updates

### Issue: Webhooks not working

**Check:**

1. Webhook URL is publicly accessible
2. HTTPS is properly configured
3. Webhook secret matches TradeSafe dashboard
4. Firewall allows TradeSafe IP addresses

## Development vs Production

### Development

- Use sandbox credentials
- Mock payments as fallback
- Extensive logging enabled
- Test with fake payment data

### Production

- Use production credentials
- No mock payment fallback
- Error handling for payment failures
- Real payment processing

## Security Notes

1. **Never commit credentials to git**
2. **Use environment variables only**
3. **Validate webhook signatures**
4. **Use HTTPS in production**
5. **Monitor failed payment attempts**

## Support

- TradeSafe Documentation: https://docs.tradesafe.co.za
- TradeSafe Support: support@tradesafe.co.za
- KibbleDrop Issues: Create a GitHub issue

## Next Steps

1. **Get TradeSafe account** if you don't have one
2. **Configure credentials** using the setup script
3. **Test in sandbox** environment first
4. **Switch to production** when ready for live payments

---

**Note:** Always test thoroughly in sandbox before switching to production!
