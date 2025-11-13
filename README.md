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
