# Unick Robins Store

Unick Robins Store is a polished e-commerce experience for hair care, beauty, and lifestyle products. The storefront is built for customers to browse product rituals, preview products quickly, manage cart intent, complete secure checkout, and return to their account for order history. The admin dashboard gives store operators a focused control room for products, orders, users, analytics, inventory signals, and product publishing.

The project is designed around a premium beauty retail flow: rich product cards, responsive product galleries, category-aware product detail sections, quick-view modals, wishlist/cart state, OTP-based account verification, Paystack payment initialization, and Supabase-backed catalog operations.

## What This Project Does

- Customer storefront with product browsing, product detail pages, quick product preview modals, cart, checkout, wishlist, reviews, and account order history.
- Dynamic product detail rendering based on product category, so topical products show benefits, usage, and ingredients while apparel/accessories show benefits and materials.
- Admin dashboard for managing products, users, orders, analytics, stock status, and product images.
- Category-first product creation flow with generated category-matched product summaries/descriptions.
- Secure authentication flow with registration, login, OTP verification, password reset OTP, and persistent pending OTP state for tab switching.
- Checkout flow with localized pricing, shipping method selection, country-aware phone code entry, and Paystack payment handoff.
- Supabase database schema for users, products, categories, orders, reviews, wishlist, and newsletter subscribers.

## Tech Stack

- **Next.js 16 App Router** for routing, server components, route handlers, layouts, loading states, and production builds.
- **React 19** for interactive UI, client components, state-driven forms, and storefront/admin experiences.
- **TypeScript** for safer product, order, checkout, auth, and admin data handling.
- **Tailwind CSS 4** for the visual system, responsive layouts, premium product styling, and utility-driven UI.
- **shadcn-style UI primitives** with Radix UI foundations for buttons, dialogs, sheets, dropdowns, tables, and inputs.
- **Supabase** for authentication, database, row-level security, product storage, orders, reviews, users, and admin data.
- **Paystack** for payment initialization, verification, callbacks, and webhooks.
- **Zustand** for cart and wishlist state.
- **React Hook Form + Zod** for admin product validation and structured form handling.
- **Lucide React** for consistent iconography across storefront, checkout, admin, and account surfaces.
- **pnpm** for package management.

## Key Features

### Storefront

- Responsive product catalog and product cards.
- Quick product preview modal with mobile-friendly image sizing.
- Full product detail pages with gallery, pricing, reviews, related products, and category-aware details.
- Cart view with quantity controls, localized pricing, and checkout entry.
- Newsletter subscription endpoint.

### Product Intelligence

Products carry category, benefits, ingredients/materials, usage instructions, hydration level, transfer-ready state, complimentary shipping, gallery images, and pricing metadata.

The product details utility generates consistent fallback content and chooses the right detail grid based on category:

- Hair oils, serums, sprays, waxes, curl creams, edge care, leave-in care, and mists show **Benefits**, **How to use**, and **Ingredients**.
- Caps, hair nets, hair bands, hoodies, durags, and accessories show **Benefits** and **Material/Ingredients**.

### Admin Dashboard

- Protected admin layout with role checks.
- Products table with add/edit/delete flows.
- Category-first add-product form.
- Product image and gallery upload flow.
- Generated category-matched descriptions for faster product publishing.
- Orders table with payment and fulfillment context.
- Users table for role/customer visibility.
- Admin loading states and nav feedback so page transitions feel responsive.

### Authentication

- Email/password login and registration.
- Signup OTP verification.
- Password reset OTP verification.
- Session refresh handling.
- Pending OTP state stored in `sessionStorage` so users can leave the tab to check email and return without losing the verification step.

### Checkout & Payments

- Shipping/contact form.
- Country and phone calling code support, with African country codes prioritized before US/UK.
- Standard and express delivery options.
- Localized NGN/USD pricing.
- Paystack initialization, callback handling, webhook verification, and payment status reconciliation.

## Project Structure

```txt
app/                  Next.js App Router routes and API handlers
components/           Shared UI, product, checkout, auth, account, and admin components
src/actions/          Server actions for admin, checkout, reviews, and users
src/lib/              Supabase, auth, checkout, Paystack, account, and admin helpers
src/services/         Product and review data access
src/store/            Zustand cart and wishlist stores
src/types/            Product and review TypeScript types
src/utils/            Formatting, pricing, and product detail utilities
supabase/             Database schema, migrations, config, and email templates
public/               Static images and public assets
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

Build for production:

```bash
pnpm build
```

Run lint:

```bash
pnpm lint
```

## Environment

The app expects Supabase and Paystack configuration in environment variables. Exact values depend on the deployment environment, but the project uses:

- Supabase browser/server clients.
- Supabase service role access for admin/server-only operations.
- Paystack transaction initialization and verification.
- Optional public NGN/USD conversion configuration through `NEXT_PUBLIC_NGN_PER_USD`.

## Deployment

The application is built for deployment on Vercel with Next.js App Router support. Supabase provides the database/auth/storage layer, while Paystack handles payment processing.

## Status

This is a full-stack e-commerce build with a production-oriented structure: storefront, admin, authentication, payments, database schema, checkout, and operational tooling are all represented in the codebase.
