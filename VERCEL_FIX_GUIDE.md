# 🚀 Vercel Deployment Fix Guide

## 🚨 Current Issues
- File uploads failing (serverless storage limitation)
- Database connection issues
- Environment variables not set correctly

## ✅ Step-by-Step Fix

### 1. **Set Environment Variables in Vercel Dashboard**

Go to your Vercel project dashboard: https://vercel.com/nxr-deens-projects/kibbledrop

Add these environment variables:

```bash
# Database (Get this from your Vercel Postgres dashboard)
DATABASE_URL=postgresql://username:password@your-vercel-postgres-url

# NextAuth
NEXTAUTH_URL=https://kibbledrop-7vd7z8pnc-nxr-deens-projects.vercel.app
NEXTAUTH_SECRET=cc1RWwkjLO/24HiwjEdSU+P5MRPvGjNHtMv1AKfiGCo=

# Stripe (if you have real keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Email
RESEND_API_KEY=your_resend_api_key_here
```

### 2. **Database Setup**
- Make sure your Vercel Postgres database has the admin user
- Run the admin creation script on production database

### 3. **Deploy the Fixes**
After setting environment variables, redeploy the app.

## 🔧 Alternative File Upload Solutions

### Option A: Use Cloudinary (Recommended)
```bash
npm install cloudinary
```

### Option B: Use Vercel Blob Storage
```bash
npm install @vercel/blob
```

### Option C: Use Base64 (Current Temporary Fix)
- Files stored as base64 in database
- 2MB limit for better performance
- Works immediately with current setup

## 📋 Testing Checklist

After deployment:
- [ ] Admin can log in
- [ ] File upload works (with 2MB limit)
- [ ] Product creation succeeds
- [ ] Database operations work
- [ ] All API endpoints respond correctly

## 🔍 Debug Commands

Check logs in Vercel dashboard or use:
```bash
vercel logs
```

## 🚀 Quick Fix Deploy

Run these commands to deploy the fixes:
```bash
git add .
git commit -m "fix: resolve Vercel deployment issues for file uploads and database"
git push origin main
```

Then redeploy in Vercel dashboard.
