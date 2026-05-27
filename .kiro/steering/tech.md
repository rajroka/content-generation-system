# Tech Stack

## Framework & Language

- **Next.js 14.2.5** — App Router (not Pages Router)
- **TypeScript 5** — strict mode enabled
- **React 18**
- **Package manager:** pnpm

## Model / Caption Generation

- **Fine-tuned Phi-2** — custom model trained on PostSathi's own dataset, hosted on Hugging Face Inference API
- Model client lives in `lib/model.ts`
- Requires `HF_MODEL_ID` and `HF_API_KEY` in `.env.local` (set when model is deployed to HF Hub)
- Until deployed, caption route returns HTTP 503 with a friendly message
- Caption route: `app/api/generate/caption/route.ts`

## Database

- **PostgreSQL** hosted on **Neon** (serverless)
- **Prisma 7** ORM — custom client output path: `lib/generated/prisma/`
- **`@prisma/adapter-pg`** (`PrismaPg`) — required for serverless compatibility; used in `lib/prisma.ts`
- Prisma singleton pattern with global variable guard for dev hot-reload safety
- Always import Prisma client from `@/lib/prisma`, never instantiate directly

## Authentication

- **Clerk** (`@clerk/nextjs` v5) — handles sign-in, sign-up, sessions
- Role stored in Clerk `publicMetadata.role` as **lowercase strings**: `"admin"` or `"user"` — this is the source of truth for authorization
- `middleware.ts` uses `clerkMiddleware` + `createRouteMatcher` for route protection
- Admin authorization re-verified in `app/admin/layout.tsx` via fresh `clerkClient` call (do not rely on session claims for admin checks)
- Admin checks compare against lowercase `"admin"` — do not use uppercase `"ADMIN"` in Clerk metadata comparisons

## Payments

- **Stripe** (`stripe` v21) — subscriptions, checkout sessions
- Checkout: `app/api/checkout/route.ts` — creates a Stripe Checkout session at $10/month; if user is already PRO, redirects to billing portal instead
- Billing portal: `app/api/billing-portal/route.ts` — creates a Stripe Billing Portal session and redirects the user to manage/cancel their subscription; redirects to `/pricing` if no `stripeCustomerId`
- Webhook handler: `app/api/webhooks/stripe/route.ts` — handles `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
- Webhook verification via `stripe.webhooks.constructEvent` + `STRIPE_WEBHOOK_SECRET`
- Stripe client singleton in `lib/stripe.ts`

## Social Media Integration

**Zernio API** (`@zernio/node`) handles all OAuth connection and publishing.

- **Client singleton** — `lib/zernio.ts` (reads `ZERNIO_API_KEY`)
- **Connect flow** — `app/api/auth/{platform}/route.ts` calls `zernio.connect.getConnectUrl()` and redirects the user. The callback stores the Zernio `account._id` in the local `SocialAccount.accountId` field.
- **Publishing** — `app/api/social/publish/route.ts` calls `zernio.posts.createPost({ publishNow: true, platforms: [...] })` using the stored Zernio account IDs
- **Scheduling** — `app/api/social/schedule/route.ts` calls `zernio.posts.createPost({ scheduledFor: "...", platforms: [...] })` for scheduled posts
- **Disconnect** — `app/api/social/disconnect/route.ts` calls `zernio.accounts.deleteAccount(accountId)` (best-effort) then removes the local DB record
- **Connections list** — `app/api/social/connections/route.ts` reads from local `SocialAccount` table (populated during callback)
- **Supported platforms**: `instagram`, `facebook`, `youtube`, `tiktok` (Zernio platform value is lowercase)
- ⚠️ LinkedIn and Twitter/X are NOT supported. Empty route folders exist at `app/api/auth/linkedin/` and `app/api/auth/twitter/` but contain no implementation. Do not add code there.

## Media

- **ImageKit** — CDN for image and video uploads
- Client: `imagekitio-next`, server: `imagekit`
- Public key exposed via `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`

## Email Notifications

- **Resend** — transactional email via `lib/email.ts`
- Helpers: `sendPostPublishedEmail`, `sendPostFailedEmail`
- Requires `RESEND_API_KEY` in `.env.local`; silently skips if not configured
- ⚠️ These helpers exist but are not yet called from any route — email notifications are not active

## UI & Styling

- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **shadcn/ui** — component library, primitives live in `components/ui/`
- **Radix UI** — underlying primitives for shadcn components
- **lucide-react** — icons
- **framer-motion** — animations
- **recharts** — used in admin analytics (`app/admin/analytics/page.tsx`)
- **@mui/x-charts** — used in user analytics (`app/user/analytics/page.tsx`)
- **react-hot-toast** + **sonner** — toast notifications
- **next-themes** — dark/light mode
- **date-fns** + **react-day-picker** — date handling
- `cn()` utility in `lib/utils.ts` (clsx + tailwind-merge) — always use for conditional class names

## Common Commands

```bash
# Development
pnpm dev          # start dev server (Next.js)
pnpm build        # production build
pnpm start        # serve production build
pnpm lint         # ESLint

# Prisma
pnpm prisma generate      # regenerate Prisma client after schema changes
pnpm prisma migrate dev   # create and apply a new migration
pnpm prisma migrate deploy # apply migrations in production
pnpm prisma studio        # open Prisma DB GUI
```

## Environment Variables

Key names required in `.env.local`:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
CLERK_WEBHOOK_SECRET

# Database (Neon PostgreSQL)
DATABASE_URL

# AI
HF_MODEL_ID        # Hugging Face model ID (e.g. your-org/phi2-postsathi)
HF_API_KEY         # Hugging Face API key

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Zernio
ZERNIO_API_KEY
ZERNIO_PROFILE_ID   # Default profile ID from zernio.com — accounts are connected under this profile

# Email (optional — notifications silently skipped if not set)
RESEND_API_KEY

# App
NEXT_PUBLIC_APP_URL
ADMIN_EMAIL
```
