# TradeSafe GraphQL API Integration

This implementation provides a complete integration with TradeSafe's GraphQL API using OAuth 2.0 authentication. The integration includes trade creation, webhook handling, and a demo interface.

## 🚀 Features

- **OAuth 2.0 Authentication**: Secure client credentials flow
- **Trade Creation**: Complete buyer/seller token and transaction creation
- **Webhook Handling**: Real-time transaction state updates
- **Sandbox & Production**: Easy environment switching
- **Demo Interface**: Interactive React component for testing

## 📁 File Structure

```
lib/
├── tradesafe-graphql-client.ts     # Main GraphQL client with OAuth

app/api/tradesafe/
├── token/route.ts                  # OAuth token endpoint
├── trade/route.ts                  # Trade creation endpoint
└── callback/route.ts               # Webhook callback handler

components/
└── tradesafe-demo.tsx              # Demo React component

app/demo/tradesafe/
└── page.tsx                        # Demo page
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# TradeSafe OAuth 2.0 Credentials
TRADESAFE_CLIENT_ID="your_client_id"
TRADESAFE_CLIENT_SECRET="your_client_secret"
TRADESAFE_ENVIRONMENT="sandbox"  # or "production"
TRADESAFE_WEBHOOK_SECRET="your_webhook_secret"

# TradeSafe API URLs
TRADESAFE_AUTH_URL="https://auth.tradesafe.co.za"
TRADESAFE_GRAPHQL_URL="https://api-developer.tradesafe.dev/graphql"  # sandbox
# Production: https://api.tradesafe.co.za/graphql
```

### Environment Setup

1. **Development (.env.local)**:

   ```bash
   TRADESAFE_ENVIRONMENT="sandbox"
   TRADESAFE_GRAPHQL_URL="https://api-developer.tradesafe.dev/graphql"
   ```

2. **Production (.env.production)**:
   ```bash
   TRADESAFE_ENVIRONMENT="production"
   TRADESAFE_GRAPHQL_URL="https://api.tradesafe.co.za/graphql"
   ```

## 🔐 Authentication Flow

1. **Client Credentials Grant**: Uses OAuth 2.0 client credentials flow
2. **Token Caching**: Tokens are cached and automatically refreshed
3. **GraphQL Authorization**: Bearer token authentication for all API calls

```typescript
// Example: Get access token
const response = await fetch("/api/tradesafe/token");
const { access_token } = await response.json();
```

## 🏗️ API Endpoints

### 1. Token Endpoint: `/api/tradesafe/token`

**GET** - Obtain OAuth access token

```typescript
// Response
{
  "success": true,
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": "2024-01-01T12:00:00Z"
}
```

### 2. Trade Endpoint: `/api/tradesafe/trade`

**POST** - Create a new trade/transaction

```typescript
// Request
{
  "title": "Premium Pet Food Order",
  "description": "Monthly subscription delivery",
  "amount": 250.00,
  "currency": "ZAR",
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "buyerMobile": "+27123456789",
  "sellerName": "Jane Smith",
  "sellerEmail": "jane@kibbledrop.com",
  "sellerMobile": "+27987654321",
  "sellerCompany": "KibbleDrop"
}

// Response
{
  "success": true,
  "data": {
    "transaction": {
      "id": "L6rWqEcUlm2gWfUvT05Pj",
      "title": "Premium Pet Food Order",
      "state": "CREATED",
      "currency": "ZAR",
      "reference": "TRADE-1703174400000"
    },
    "buyer": {
      "tokenId": "15Ndyzw4lUfWnTTeV0ggOY",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "seller": {
      "tokenId": "1Mm0z59pN5g31BeOElntAw",
      "name": "Jane Smith",
      "email": "jane@kibbledrop.com",
      "organization": "KibbleDrop"
    },
    "paymentLink": {
      "id": "UGF5bWVudEludGVudA==",
      "url": "https://pay-sandbox.tradesafe.dev/ZtCX4HYqjRN",
      "expiresAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

**GET** - Retrieve transaction details

```
GET /api/tradesafe/trade?id={transactionId}
```

### 3. Callback Endpoint: `/api/tradesafe/callback`

**POST** - Handle TradeSafe webhooks

```typescript
// Webhook payload from TradeSafe
{
  "url": "https://yourapp.com/api/tradesafe/callback",
  "data": {
    "id": "L6rWqEcUlm2gWfUvT05Pj",
    "reference": "TRADE-1703174400000",
    "state": "FUNDS_RECEIVED",
    "balance": "0.0000",
    "updated_at": "2024-01-01 12:00:00",
    "allocations": [
      {
        "id": "4RwHQ1bQsmA5v4tjf5o0m6",
        "state": "CREATED",
        "updated_at": "2024-01-01 12:00:00"
      }
    ]
  }
}
```

**GET** - Check webhook status and recent transactions

## 🔔 Webhook Events

The callback endpoint handles these TradeSafe events:

- **FUNDS_RECEIVED**: Buyer has made a deposit
- **COMPLETED**: Transaction completed successfully
- **CANCELLED**: Transaction was cancelled
- **REFUNDED**: Funds were refunded to buyer

### Webhook Security

1. **IP Whitelisting**: Configure TradeSafe IP addresses
2. **Webhook Secret**: Use query parameter or inline secret
3. **Signature Validation**: Verify webhook authenticity

```bash
# Webhook URL examples
https://yourapp.com/api/tradesafe/callback?secret=your_webhook_secret
https://yourapp.com/api/tradesafe/callback/your_webhook_secret
```

## 📊 GraphQL Client Usage

### Create User Tokens

```typescript
import { tradesafeGraphQL } from "@/lib/tradesafe-graphql-client";

// Create buyer token
const buyerToken = await tradesafeGraphQL.createUserToken({
  givenName: "John",
  familyName: "Doe",
  email: "john@example.com",
  mobile: "+27123456789",
});

// Create seller token with organization
const sellerToken = await tradesafeGraphQL.createUserToken({
  givenName: "Jane",
  familyName: "Smith",
  email: "jane@company.com",
  mobile: "+27987654321",
  organizationName: "Company Name",
  tradeName: "Trading Name",
  organizationType: "PRIVATE",
});
```

### Create Transactions

```typescript
// Create transaction
const transaction = await tradesafeGraphQL.createTransaction({
  title: "Order #12345",
  description: "Premium pet food delivery",
  industry: "GENERAL_GOODS_SERVICES",
  currency: "ZAR",
  feeAllocation: "SELLER",
  buyerTokenId: buyerToken.id,
  sellerTokenId: sellerToken.id,
  allocations: [
    {
      title: "Product Delivery",
      description: "Delivery of ordered products",
      value: 250.0,
      daysToDeliver: 7,
      daysToInspect: 3,
    },
  ],
});

// Create payment link
const paymentLink = await tradesafeGraphQL.createPaymentLink(transaction.id);
```

## 🎮 Demo Interface

Access the interactive demo at `/demo/tradesafe` to:

1. **Test OAuth Authentication**: Get access tokens
2. **Create Sample Trades**: Generate transactions with sample data
3. **Monitor Webhooks**: View real-time callback data
4. **Copy Payment Links**: Test the payment flow

### Demo Features

- **Form Validation**: Real-time input validation
- **Copy to Clipboard**: Easy copying of IDs and URLs
- **Status Indicators**: Visual feedback for all operations
- **Error Handling**: Detailed error messages and recovery

## 🔄 Production Deployment

### 1. TradeSafe Application Setup

1. **Create Production App**: Register new application in TradeSafe production
2. **Configure URLs**:
   - OAuth Callback: `https://yourapp.com/api/tradesafe/oauth/callback`
   - API Callback: `https://yourapp.com/api/tradesafe/callback`
   - Success URL: `https://yourapp.com/payment/success`
   - Failure URL: `https://yourapp.com/payment/error`

### 2. Environment Variables

```bash
# Production environment
TRADESAFE_ENVIRONMENT="production"
TRADESAFE_CLIENT_ID="prod_client_id"
TRADESAFE_CLIENT_SECRET="prod_client_secret"
TRADESAFE_GRAPHQL_URL="https://api.tradesafe.co.za/graphql"
TRADESAFE_WEBHOOK_SECRET="prod_webhook_secret"
```

### 3. Webhook Configuration

Configure your TradeSafe application to send webhooks to:

```
https://yourapp.com/api/tradesafe/callback?secret=your_webhook_secret
```

## 🐛 Debugging

### Enable Debug Logging

```typescript
// Check console logs for detailed operation tracking
console.log("🔑 Acquiring OAuth access token...");
console.log("✅ Transaction created:", transaction.id);
console.log("🔔 Webhook received:", webhook.data.state);
```

### Common Issues

1. **Authentication Errors**:

   - Verify client ID and secret
   - Check environment configuration
   - Ensure OAuth application is active

2. **GraphQL Errors**:

   - Validate query syntax
   - Check required fields
   - Verify token permissions

3. **Webhook Issues**:
   - Confirm callback URL accessibility
   - Verify webhook secret
   - Check IP whitelisting

### Testing Tools

- **Postman**: Test API endpoints directly
- **ngrok**: Expose localhost for webhook testing
- **GraphQL Playground**: Test queries interactively

## 📚 Additional Resources

- [TradeSafe Documentation](https://docs.tradesafe.co.za/)
- [GraphQL Playground](https://api-developer.tradesafe.dev/)
- [TradeSafe Community](https://github.com/orgs/tradesafe/discussions)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS Only**: Always use HTTPS in production
3. **Webhook Validation**: Implement proper webhook signature verification
4. **Token Security**: Store tokens securely and implement proper rotation
5. **Error Handling**: Don't expose sensitive information in error messages

## 📝 License

This integration code is provided as-is for demonstration purposes. Ensure compliance with TradeSafe's terms of service and your application's security requirements.
