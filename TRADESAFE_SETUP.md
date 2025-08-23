# Tradesafe Payment Gateway Integration Setup

## Overview
This document explains how to set up and use the Tradesafe payment gateway integration in your Next.js application.

## Environment Variables
Add these to your `.env.local` file:

```bash
# Tradesafe Configuration
TRADESAFE_MERCHANT_ID="your_merchant_id_here"
TRADESAFE_API_KEY="your_api_key_here"
TRADESAFE_ENVIRONMENT="sandbox"  # or "production"
TRADESAFE_WEBHOOK_SECRET="your_webhook_secret_here"
```

## API Endpoints Created

### 1. Checkout API
- **Route**: `POST /api/tradesafe/checkout`
- **Purpose**: Creates a Tradesafe payment session
- **Usage**: Called when user clicks "Pay Now with Tradesafe"

### 2. Webhook Handler
- **Route**: `POST /api/tradesafe/webhook`
- **Purpose**: Receives payment status updates from Tradesafe
- **Usage**: Automatically updates order status

### 3. Payment Status API
- **Route**: `GET /api/tradesafe/payment-status`
- **Purpose**: Check payment status for an order
- **Usage**: Real-time status checking

## Components Added

### 1. TradesafeCheckout
- **File**: `components/tradesafe-checkout.tsx`
- **Purpose**: Payment form component
- **Usage**: Integrated into checkout page

### 2. PaymentStatus
- **File**: `components/payment-status.tsx`
- **Purpose**: Display payment status information
- **Usage**: Order confirmation and status pages

### 3. useTradesafe Hook
- **File**: `hooks/use-tradesafe.tsx`
- **Purpose**: React hook for Tradesafe operations
- **Usage**: Payment processing and status checking

## Integration Points

### Checkout Page
The checkout page now has two options:
1. **Place Order (Pay Later)**: Creates order without immediate payment
2. **Pay Now with Tradesafe**: Creates order and redirects to payment gateway

### Payment Flow
1. User selects products and goes to checkout
2. User chooses payment method
3. If Tradesafe: redirects to payment gateway
4. After payment: returns to success/cancel page
5. Webhook updates order status automatically

## Testing

### Test Page
Visit `/test-tradesafe` to test the integration:
- Test checkout with sample products
- Check payment status
- View integration demo

### Sandbox Mode
- Set `TRADESAFE_ENVIRONMENT=sandbox` for testing
- Use test credentials provided by Tradesafe
- No real money is charged

## Production Deployment

### 1. Update Environment Variables
```bash
TRADESAFE_ENVIRONMENT="production"
TRADESAFE_MERCHANT_ID="your_live_merchant_id"
TRADESAFE_API_KEY="your_live_api_key"
TRADESAFE_WEBHOOK_SECRET="your_live_webhook_secret"
```

### 2. Webhook Configuration
- Configure webhook URL in Tradesafe dashboard
- URL: `https://yourdomain.com/api/tradesafe/webhook`
- Ensure webhook secret matches your environment variable

### 3. SSL Certificate
- Ensure your domain has valid SSL certificate
- Tradesafe requires HTTPS for webhooks

## Security Features

### Webhook Verification
- All webhooks are verified using HMAC signatures
- Invalid signatures are rejected
- Prevents webhook spoofing

### User Authentication
- All payment operations require user authentication
- Orders are tied to authenticated users
- Prevents unauthorized access

### Error Handling
- Comprehensive error handling for all operations
- User-friendly error messages
- Detailed logging for debugging

## Troubleshooting

### Common Issues

1. **Payment Creation Fails**
   - Check API credentials
   - Verify environment variables
   - Check network connectivity

2. **Webhook Not Working**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Ensure SSL certificate is valid

3. **Payment Status Not Updating**
   - Check webhook delivery
   - Verify order ID mapping
   - Check database connectivity

### Debug Mode
Enable debug logging by checking browser console and server logs for detailed error information.

## Support

For Tradesafe-specific issues:
- Contact Tradesafe support
- Check their API documentation
- Verify account configuration

For integration issues:
- Check server logs
- Verify environment variables
- Test with sandbox credentials first

