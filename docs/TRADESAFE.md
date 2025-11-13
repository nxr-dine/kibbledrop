# TradeSafe Payment Integration Guide

This comprehensive guide covers the complete TradeSafe payment gateway integration for Kibbledrop, configured for South African Rands (ZAR) and subscription-based recurring payments.

## 🚀 Features

- **OAuth 2.0 Authentication**: Secure client credentials flow
- **Trade Creation**: Complete buyer/seller token and transaction creation
- **ZAR Currency**: All payments processed in South African Rands
- **Subscription Payments**: Initial payment with recurring billing setup
- **Webhook Handling**: Real-time transaction state updates
- **Sandbox & Production**: Easy environment switching
- **Demo Interface**: Interactive React component for testing

## 💰 Payment Model

Kibbledrop uses a **"Pay Now, Recurring Later"** model:

1. **Initial Payment**: Customer pays immediately for first subscription delivery via TradeSafe
2. **Subscription Setup**: System creates recurring billing schedule in background
3. **Future Payments**: Automatic recurring payments for subsequent deliveries
4. **Currency**: All transactions in South African Rands (ZAR)

### Payment Flow

```
Customer Places Subscription → Pay First Delivery (ZAR) → Setup Recurring → Automated Future Payments
```

## 📁 File Structure

```
lib/
├── tradesafe-graphql-client.ts     # Main GraphQL client with OAuth
├── tradesafe-config.ts             # Configuration utilities

app/api/tradesafe/
├── token/route.ts                  # OAuth token endpoint
├── trade/route.ts                  # Trade creation endpoint
├── callback/route.ts               # Webhook callback handler
├── test/route.ts                   # API testing endpoint
└── mock-trade/route.ts             # Mock trade creation

components/
├── tradesafe-demo.tsx              # Demo React component
└── trade-button.tsx                # Trade action button

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

   - Use sandbox environment
   - Test credentials provided by TradeSafe
   - Mock webhook endpoints for local testing

2. **Production (.env.production)**:
   - Use production environment
   - Live credentials from TradeSafe dashboard
   - Real webhook endpoints

## 🛠️ Setup Instructions

### 1. Credentials Setup

1. **Obtain TradeSafe credentials**:

   - Register at [TradeSafe Developer Portal](https://developer.tradesafe.co.za)
   - Create application and get OAuth credentials
   - Set up webhook endpoints

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

### 2. Database Integration

The integration includes a Trade model in Prisma:

```prisma
model Trade {
  id                    String   @id @default(cuid())
  tradeId              String?  @unique
  title                String
  description          String?
  value                Float
  feeAllocation        String   @default("BUYER")
  industryId           String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  // Parties
  buyerUserId          String?
  sellerUserId         String?

  // State tracking
  state                String?

  // Relations
  buyerUser            User?    @relation("BuyerTrades", fields: [buyerUserId], references: [id])
  sellerUser           User?    @relation("SellerTrades", fields: [sellerUserId], references: [id])
}
```

### 3. API Integration

#### OAuth Token Management

```typescript
// Automatic token refresh and management
const client = new TradeSafeGraphQLClient();
const token = await client.getAccessToken();
```

#### Trade Creation

```typescript
const trade = await client.createTrade({
  title: "Pet Food Purchase",
  description: "Premium kibble order",
  value: 299.99,
  feeAllocation: "BUYER",
});
```

#### Webhook Handling

```typescript
// Automatic webhook verification and processing
export async function POST(request: Request) {
  const webhook = await verifyWebhook(request);
  // Process trade state changes
}
```

## 🧪 Testing

### Development Testing

1. **Use sandbox environment**
2. **Test with demo interface**: `/demo/tradesafe`
3. **Monitor API responses**: `/api/tradesafe/test`

### Production Deployment

1. **Switch to production environment**
2. **Update webhook URLs**
3. **Test with real transactions**

## 🔒 Security Notes

- All credentials stored as environment variables
- Webhook signatures verified automatically
- OAuth tokens managed securely
- No sensitive data in client-side code

## 📚 API Reference

### Endpoints

- `POST /api/tradesafe/token` - OAuth token management
- `POST /api/tradesafe/trade` - Create new trade
- `POST /api/tradesafe/callback` - Webhook handler
- `GET /api/tradesafe/test` - API testing

### Components

- `<TradeSafeDemo />` - Interactive demo component
- `<TradeButton />` - Trade action button

## 🐛 Troubleshooting

### Common Issues

1. **OAuth failures**: Check credentials and environment URLs
2. **Webhook timeouts**: Verify endpoint accessibility
3. **Trade creation errors**: Validate required fields
4. **Database sync issues**: Run Prisma migrations

### Debug Tools

- API test endpoint: `/api/tradesafe/test`
- Demo interface: `/demo/tradesafe`
- Database inspection: Prisma Studio

## 📞 Support

For TradeSafe-specific issues:

- [TradeSafe Documentation](https://developer.tradesafe.co.za)
- [TradeSafe Support](mailto:support@tradesafe.co.za)
