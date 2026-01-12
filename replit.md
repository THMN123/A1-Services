# A1 Services App

## Overview

A1 Services is a campus-first super-app described as "The World's Biggest Mall in Your Pocket." It's a pre-ordering and discovery platform that connects customers with local vendors (food stalls, shops, service providers) on campus. The core value proposition is eliminating queues, reducing vendor fees (5% commission), and bringing offline local businesses online.

The application supports three user types:
- **Customers**: Discover vendors, pre-order food/services, pay via wallet/cash, track orders, earn loyalty points
- **Vendors**: Receive and manage orders, update inventory, accept payments, gain digital visibility
- **Admins**: Vendor onboarding, analytics, promotions, quality assurance

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a mobile-first design with a bottom navigation pattern. Pages include Home, Shops, Orders, Rewards, and Profile. Components are organized with custom hooks for data fetching (`use-vendors`, `use-orders`, `use-profiles`).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: REST endpoints with Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: express-session with connect-pg-simple for PostgreSQL-backed sessions

The backend uses a storage abstraction layer (`IStorage` interface) for database operations, making it easier to swap implementations. Routes are defined in a shared contract (`shared/routes.ts`) with Zod schemas for type-safe API interactions.

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Implementation**: Passport.js with custom Replit OIDC strategy

Users authenticate through Replit's OAuth flow. The system maintains a `users` table for identity and a separate `profiles` table for app-specific user data (role, wallet balance, loyalty points).

### Database Schema
Key tables:
- `users` / `sessions`: Replit Auth managed tables
- `profiles`: Extended user data (role, wallet, loyalty points)
- `vendors`: Business listings with category, location, hours
- `products`: Vendor inventory with pricing
- `orders` / `order_items`: Order tracking with status workflow
- `rewards` / `redemptions`: Loyalty program
- `vendor_categories`: Categorization system

### Payment Integration
- **Provider**: Stripe via Replit's Stripe connector
- **Features**: Wallet top-up via Stripe Checkout, webhook handling for payment confirmation
- **Sync**: Uses `stripe-replit-sync` package for managed webhooks and data synchronization

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations with `db:push` command

### Authentication
- **Replit Auth**: OAuth/OIDC provider via `ISSUER_URL`
- **Session Secret**: Required `SESSION_SECRET` environment variable

### Payments
- **Stripe**: Payment processing via Replit's managed Stripe connector
- **Webhook**: Auto-configured webhook endpoint at `/api/stripe/webhook`

### Frontend Libraries
- **shadcn/ui**: Pre-built accessible components (dialog, toast, form, etc.)
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities

### Development
- **Vite**: Development server with HMR
- **esbuild**: Production bundling for server
- **TypeScript**: Full type coverage across client/server/shared