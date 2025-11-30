# Stripe Payment Gateway Setup Guide

This guide will help you set up Stripe payment gateway for testing orders, subscriptions, and analytics.

## 🚀 Quick Setup

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account setup

### 2. Get Your API Keys

1. Log in to your Stripe Dashboard
2. Navigate to **Developers** → **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### 3. Set Up Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Required for payment redirects
NEXTAUTH_URL=http://localhost:3000
```

### 4. Set Up Webhook (For Production/Testing)

#### Local Development (Using Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Production Setup

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your production environment variables

## 🧪 Testing

### Test Cards

Stripe provides test cards for testing different scenarios:

#### Successful Payments
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

#### Declined Payments
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

#### 3D Secure Authentication
- **Card Number**: `4000 0025 0000 3155`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

### Testing Flow

1. **Add products to cart**
2. **Go to checkout** (`/checkout`)
3. **Fill in delivery information**
4. **Click "Proceed to Payment"**
5. **You'll be redirected to Stripe Checkout**
6. **Use test card**: `4242 4242 4242 4242`
7. **Complete payment**
8. **You'll be redirected back** to `/payment/success`
9. **Order status** will be updated to "processing" via webhook

## 📊 What's Integrated

### ✅ One-Time Payments
- Checkout page integrated with Stripe
- Order creation before payment
- Payment processing via Stripe Checkout
- Webhook confirmation updates order status

### ✅ Subscriptions
- Subscription creation with Stripe
- Recurring billing setup
- Subscription management

### ✅ Analytics
- Orders are tracked in the database
- Payment status updates automatically
- Order history available in admin panel

## 🔧 Troubleshooting

### Payment Not Processing

1. **Check API Keys**: Ensure `STRIPE_SECRET_KEY` is set correctly
2. **Check Webhook**: Verify webhook secret is correct
3. **Check Console**: Look for errors in browser console and server logs

### Webhook Not Working

1. **Local Development**: Use Stripe CLI to forward webhooks
2. **Production**: Ensure webhook endpoint is publicly accessible
3. **Verify Secret**: Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### Redirect Issues

1. **Check NEXTAUTH_URL**: Must match your domain
2. **Check Success URL**: Should be `/payment/success`
3. **Check Cancel URL**: Should be `/payment/cancelled`

## 📝 Important Notes

- **Test Mode**: All test transactions use `sk_test_` and `pk_test_` keys
- **No Real Charges**: Test mode never charges real cards
- **Webhook Required**: For automatic order status updates, webhook must be configured
- **Currency**: All payments are in ZAR (South African Rand)

## 🚀 Going Live

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live API keys** (start with `sk_live_` and `pk_live_`)
3. Update environment variables with live keys
4. Set up production webhook endpoint
5. Test with real card (small amount first!)

---

**Need Help?** Check Stripe's documentation: https://stripe.com/docs

