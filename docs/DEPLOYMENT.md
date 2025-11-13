# Deployment Guide

Complete guide for deploying Kibbledrop to production environments.

## 🚀 Environment Variables

### Required Environment Variables

#### Database Configuration

```bash
DATABASE_URL="postgres://username:password@your-database-host:5432/database-name?sslmode=require"
```

#### NextAuth Configuration

```bash
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-long-random-secret-key-here"
```

#### Email Service (Resend)

```bash
RESEND_API_KEY="your-resend-api-key-here"
```

#### Stripe Payment Processing

```bash
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key_here"
```

#### TradeSafe Payment Gateway

```bash
TRADESAFE_CLIENT_ID="your_tradesafe_client_id"
TRADESAFE_CLIENT_SECRET="your_tradesafe_client_secret"
TRADESAFE_ENVIRONMENT="production"
TRADESAFE_WEBHOOK_SECRET="your_webhook_secret"
```

## 📦 Deployment Platforms

### Vercel Deployment (Recommended)

1. **Connect Repository**

   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables**

   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required environment variables
   - Ensure production values are used

3. **Database Setup**
   ```bash
   # Run migrations on production database
   npx prisma migrate deploy
   npx prisma generate
   ```

### Railway Deployment

1. **Connect Repository**

   - Link GitHub repository to Railway
   - Configure build and start commands

2. **Environment Variables**
   - Add all required variables in Railway dashboard
   - Configure PostgreSQL database addon

### Self-Hosted Deployment

1. **Server Requirements**

   - Node.js 18+
   - PostgreSQL 14+
   - PM2 for process management

2. **Deployment Steps**

   ```bash
   # Clone repository
   git clone https://github.com/your-username/kibbledrop.git
   cd kibbledrop

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Set up database
   npx prisma migrate deploy
   npx prisma generate

   # Start with PM2
   pm2 start ecosystem.config.js
   ```

## 🛠️ Build Configuration

### Next.js Configuration

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  images: {
    domains: ["your-domain.com"],
  },
};

export default nextConfig;
```

### Environment-Specific Builds

```json
{
  "scripts": {
    "build": "prisma generate && prisma db push --accept-data-loss && next build",
    "build:prod": "prisma generate && next build",
    "start": "next start"
  }
}
```

## 🔧 Database Setup

### Production Database Migration

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

### Database Backup Strategy

```bash
# Daily backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/kibbledrop_$DATE.sql.gz"
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

## 📊 Monitoring & Logging

### Application Monitoring

```javascript
// lib/monitoring.js
export function logError(error, context) {
  console.error("Application Error:", {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

export function logPerformance(operation, duration) {
  console.log("Performance Metric:", {
    operation,
    duration,
    timestamp: new Date().toISOString(),
  });
}
```

### Health Check Endpoint

```javascript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        api: "operational",
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

## 🔒 Security Configuration

### Security Headers

```javascript
// middleware.ts
export function middleware(request) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}
```

### Environment Security

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Enable 2FA on all deployment platforms
- Regularly rotate API keys and secrets
- Use environment-specific configurations

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Reset database (development only)
npx prisma migrate reset
```

#### Environment Variable Issues

```bash
# Check environment variables
printenv | grep -E "(DATABASE_URL|NEXTAUTH_)"

# Verify Prisma configuration
npx prisma validate
```

### Performance Optimization

#### Image Optimization

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

#### Caching Strategy

```javascript
// app/api/products/route.ts
export async function GET() {
  const products = await getProducts();

  return Response.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

## 📈 Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Build process completes successfully
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Monitoring setup

### Post-Deployment

- [ ] Health check endpoint responding
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] Payment processing functional
- [ ] Email delivery operational
- [ ] Admin panel accessible
- [ ] Performance metrics baseline established

### Ongoing Maintenance

- [ ] Regular security updates
- [ ] Database backups verified
- [ ] Performance monitoring
- [ ] Log analysis
- [ ] Error tracking
- [ ] Capacity planning
