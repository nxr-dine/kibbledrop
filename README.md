# KibbleDrop - Pet Food Subscription Platform

A modern pet food subscription platform built with Next.js, Prisma, PostgreSQL, and Stripe.

## Features

- 🔐 **Authentication**: NextAuth with email/password
- 🐾 **Pet Profiles**: Manage multiple pets with health information
- 🛍️ **Product Catalog**: Browse dog and cat food products
- 📦 **Subscription Management**: Weekly, bi-weekly, and monthly deliveries
- 💳 **Payment Processing**: Stripe integration for recurring payments
- 📧 **Email Notifications**: Resend integration for order confirmations
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: Resend
- **UI Components**: shadcn/ui, Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Stripe account
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kibbledrop
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your actual values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a random secret key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `RESEND_API_KEY`: Your Resend API key

4. **Set up the database**
   ```bash
   # Push the schema to your database
   pnpm db:push
   
   # Seed the database with sample products
   pnpm db:seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Pet Profiles
- `GET /api/pets` - Get user's pets
- `POST /api/pets` - Create new pet profile
- `PUT /api/pets/:id` - Update pet profile
- `DELETE /api/pets/:id` - Delete pet profile

### Products
- `GET /api/products` - Get products (with filtering)
  - Query params: `petType`, `category`, `featured`

### Subscriptions
- `GET /api/subscription` - Get user's subscriptions
- `POST /api/subscription` - Create new subscription
- `PUT /api/subscription/:id` - Update subscription
- `DELETE /api/subscription/:id` - Cancel subscription

### Payments
- `POST /api/stripe/checkout` - Create Stripe checkout session

## Database Schema

### Core Models
- **User**: Authentication and profile data
- **PetProfile**: Pet information and health details
- **Product**: Product catalog with categories
- **Subscription**: Subscription details and delivery info
- **SubscriptionItem**: Items within each subscription

### Relationships
- User has many PetProfiles
- User has many Subscriptions
- Subscription has many SubscriptionItems
- SubscriptionItem belongs to Product

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Your app's base URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |

## Development

### Database Commands
```bash
# Push schema changes
pnpm db:push

# Reset and seed database
pnpm db:seed

# Open Prisma Studio
npx prisma studio
```

### Adding New Features
1. Update the Prisma schema in `prisma/schema.prisma`
2. Run `pnpm db:push` to apply changes
3. Create API routes in `app/api/`
4. Update frontend components as needed

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure PostgreSQL database is accessible
- Set all required environment variables
- Build and deploy using platform-specific commands

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 