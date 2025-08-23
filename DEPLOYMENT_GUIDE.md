# KibbleDrop Deployment Guide

## Environment Variables for Production

You need to set these environment variables in your Vercel dashboard:

### Database
```
DATABASE_URL="postgres://username:password@your-database-host:5432/database-name?sslmode=require"
```

### NextAuth Configuration
```
NEXTAUTH_URL="https://kibbledrop.com"
NEXTAUTH_SECRET="your-long-random-secret-key-here"
```

### Email Service (Resend)
```
RESEND_API_KEY="your-resend-api-key-here"
```

### Stripe (if using payments)
```
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key_here"
```

## Deployment Issues Fixed

### 1. File Upload Issue
- **Problem**: Local file system uploads don't work on Vercel
- **Solution**: Changed to base64 data URLs for immediate use
- **Files Modified**: `app/api/upload/route.ts`

### 2. File Size Limits
- **Problem**: 5MB limit too large for Vercel
- **Solution**: Reduced to 2MB for better performance
- **Files Modified**: 
  - `app/api/upload/route.ts`
  - `app/admin/products/[id]/edit/page.tsx`

### 3. Environment Variables
- **Problem**: Missing production environment variables
- **Solution**: Added comprehensive environment variable guide
- **Files Modified**: `vercel.json`

### 4. Error Logging
- **Problem**: No visibility into deployment errors
- **Solution**: Added comprehensive logging to API routes
- **Files Modified**: 
  - `app/api/upload/route.ts`
  - `app/api/orders/route.ts`

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the correct name and value
5. Redeploy your application

## Database Setup

### Option 1: Vercel Postgres
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

### Option 2: External Database
1. Use a service like Supabase, Railway, or Neon
2. Get the connection string
3. Add it to `DATABASE_URL`

## Email Service Setup

1. Sign up for Resend (resend.com)
2. Get your API key
3. Add it to `RESEND_API_KEY`
4. Verify your domain for sending emails

## Testing Deployment

After deployment, test these features:

1. **Admin Login**: `/admin`
2. **Product Upload**: Try uploading an image in admin product edit
3. **Order Placement**: Complete a checkout process
4. **Email Notifications**: Check if order confirmation emails are sent

## Common Issues and Solutions

### Issue: "Unauthorized" errors
- **Cause**: Missing or incorrect `NEXTAUTH_SECRET`
- **Solution**: Generate a new secret and update the environment variable

### Issue: Database connection errors
- **Cause**: Incorrect `DATABASE_URL` or database not accessible
- **Solution**: Check database connection string and network access

### Issue: File upload fails
- **Cause**: File too large or incorrect format
- **Solution**: Ensure files are under 2MB and in JPEG/PNG/WebP format

### Issue: Email not sending
- **Cause**: Missing `RESEND_API_KEY` or domain not verified
- **Solution**: Add API key and verify domain in Resend dashboard

## Monitoring and Debugging

1. **Vercel Logs**: Check function logs in Vercel dashboard
2. **Console Logs**: Added comprehensive logging to API routes
3. **Database**: Monitor database connections and queries
4. **Email**: Check Resend dashboard for email delivery status

## Performance Optimization

1. **Image Optimization**: Using base64 data URLs for immediate display
2. **File Size Limits**: 2MB limit for better performance
3. **Function Timeouts**: 30-second limits for API routes
4. **Database**: Use connection pooling for better performance

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **File Upload**: Validate file types and sizes
3. **Authentication**: Proper session management
4. **Database**: Use SSL connections in production
