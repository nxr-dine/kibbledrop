# Kibbledrop 🐾

Modern pet food subscription and e-commerce platform built with Next.js 14.

## ✨ Features

- �️ **E-commerce**: Complete product catalog with categories and search
- � **Subscriptions**: Automated recurring deliveries for pet food
- � **Authentication**: Secure user accounts with NextAuth
- � **Pet Profiles**: Multi-pet management with health tracking
- 💳 **Payments**: Integrated Stripe and TradeSafe payment processing
- 👨‍💼 **Admin Panel**: Comprehensive management dashboard
- 📧 **Notifications**: Email updates for orders and subscriptions
- 📱 **Responsive**: Mobile-first design with modern UI

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd kibbledrop
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Database setup
pnpm db:setup

# Start development
pnpm dev
```

## 💳 Payment Gateway Setup

To test orders, subscriptions, and analytics, you need to set up Stripe:

1. **Get Stripe API Keys** (Test Mode):
   - Sign up at [stripe.com](https://stripe.com)
   - Go to Developers → API keys
   - Copy your test keys (start with `sk_test_` and `pk_test_`)

2. **Add to `.env.local`**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

3. **Set up Webhooks** (for automatic order updates):
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
   - Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook secret to `.env.local`

4. **Test with test card**: `4242 4242 4242 4242`

📖 **Full setup guide**: See [docs/STRIPE_SETUP.md](./docs/STRIPE_SETUP.md)

**Live Demo:** https://kibbledrop-7vd7z8pnc-nxr-deens-projects.vercel.app

## 📚 Documentation

- 📖 **[Admin Guide](./docs/ADMIN_GUIDE.md)** - Complete admin panel documentation
- 🔧 **[TradeSafe Integration](./docs/TRADESAFE.md)** - Payment gateway setup
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- 📝 **[TODO List](./TODO.md)** - Current development tasks

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js
- **Payments**: Stripe + TradeSafe
- **Email**: Resend
- **Deployment**: Vercel

## 🏗️ Development

```bash
# Database commands
pnpm db:push      # Apply schema changes
pnpm db:seed      # Seed with sample data
npx prisma studio # Open database GUI

# Build and test
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Code linting
```

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for pet lovers everywhere** 🐕🐱

## License

This project is licensed under the MIT License.
