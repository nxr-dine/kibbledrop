# TradeSafe Production Deployment Guide

## 🚀 Making TradeSafe Work on kibbledrop.com

### 1. Environment Variables for Production

Your environment configuration has been simplified. For your deployment platform (Vercel, Netlify, etc.), set these environment variables:

```bash
# TradeSafe Production Configuration
TRADESAFE_CLIENT_ID="9fb3e8ec-741c-4e89-a504-cf88d34770d9"
TRADESAFE_CLIENT_SECRET="UKaVdbInSVfw3oYUyWYfv06qSUtrh0CtPSA1WyYU"
TRADESAFE_ENVIRONMENT="production"
TRADESAFE_WEBHOOK_SECRET="your_actual_webhook_secret_from_dashboard"

# Production site URL
NEXTAUTH_URL="https://kibbledrop.com"
```

**Important:** The API URLs are now automatically determined by `TRADESAFE_ENVIRONMENT`:

- `sandbox` → Uses TradeSafe's developer/sandbox endpoints
- `production` → Uses TradeSafe's production endpoints

### 2. Webhook Configuration

1. **In your TradeSafe Dashboard:**

   - Go to your application settings
   - Set webhook URL to: `https://kibbledrop.com/api/tradesafe/callback?secret=your_webhook_secret`
   - Copy the webhook secret and update `TRADESAFE_WEBHOOK_SECRET`

2. **Webhook Security:**
   - The webhook endpoint now verifies the secret for security
   - Include the secret as a query parameter: `?secret=your_secret`
   - Alternative: Send as header `x-tradesafe-webhook-secret`

### 3. API Endpoints Available

Your production site will have these TradeSafe endpoints:

- **Authentication:** `https://kibbledrop.com/api/tradesafe/token`
- **Create Trade:** `https://kibbledrop.com/api/tradesafe/trade`
- **Webhook Handler:** `https://kibbledrop.com/api/tradesafe/callback?secret=your_secret`
- **Test Interface:** `https://kibbledrop.com/tradesafe-test`

### 4. Testing in Production

1. **Visit the test page:**

   ```
   https://kibbledrop.com/tradesafe-test
   ```

2. **Create a real transaction:**
   - Fill in the form with real customer details
   - The transaction will be created in TradeSafe's production environment
   - **⚠️ Warning:** This will create real transactions with real money!

### 5. Production Differences from Sandbox

| Feature              | Sandbox                                     | Production                               |
| -------------------- | ------------------------------------------- | ---------------------------------------- |
| Environment Variable | `TRADESAFE_ENVIRONMENT="sandbox"`           | `TRADESAFE_ENVIRONMENT="production"`     |
| Auth URL             | https://auth.tradesafe.co.za/oauth/token    | https://auth.tradesafe.co.za/oauth/token |
| GraphQL URL          | https://api-developer.tradesafe.dev/graphql | https://api.tradesafe.co.za/graphql      |
| Transactions         | Test only                                   | Real money                               |
| Webhooks             | Optional secret                             | Required secret verification             |

### 6. Configuration Benefits

✅ **Simplified Setup**: Only need to change `TRADESAFE_ENVIRONMENT` to switch between sandbox/production
✅ **Automatic URL Resolution**: No need to hardcode URLs in environment variables
✅ **Enhanced Security**: Webhook secret verification prevents unauthorized requests
✅ **Clean Environment**: Removed legacy credentials that aren't needed for OAuth
✅ **Better Organization**: Clear sections in .env file for each service

### 6. Deployment Steps

1. **Update your deployment environment variables** with the production values above
2. **Deploy your code** with the updated configuration
3. **Test the integration** using the test page at `/tradesafe-test`
4. **Configure webhooks** in your TradeSafe dashboard
5. **Monitor the integration** through your application logs

### 7. Security Considerations

- ✅ **OAuth credentials** are properly configured for production
- ✅ **API endpoints** use HTTPS in production
- ✅ **Webhook verification** will validate incoming webhooks (update the secret!)
- ⚠️ **Test carefully** - production transactions involve real money

### 8. Integration Points in Your App

You can now integrate the TradeSafe functionality into your existing KibbleDrop pages:

```typescript
// Example: In your checkout page
const createTradeSafeTransaction = async (orderData) => {
  const response = await fetch("/api/tradesafe/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: orderData.productName,
      description: orderData.description,
      amount: orderData.total,
      buyerName: orderData.customer.name,
      buyerEmail: orderData.customer.email,
      // ... other fields
    }),
  });

  return response.json();
};
```

### 9. Next Steps

1. **Deploy to production** with the updated environment variables
2. **Test thoroughly** on kibbledrop.com
3. **Integrate into your checkout flow** where needed
4. **Set up monitoring** for webhook deliveries
5. **Update your webhook secret** from the TradeSafe dashboard

---

**🎉 Your TradeSafe integration is now production-ready for kibbledrop.com!**
