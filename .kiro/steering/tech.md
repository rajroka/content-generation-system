# Tech Stack

## Framework & Language

- **Next.js 14.2.5** — App Router (not Pages Router)
- **TypeScript 5** — strict mode enabled
- **React 18**
- **Package manager:** pnpm

## AI / LLM

- **Groq SDK** (`groq-sdk`) — primary text generation using `llama-3.1-8b-instant` and `llama-3.3-70b-versatile`
- **OpenAI** (`openai`) — secondary / image generation
- AI helpers live in `lib/groq.ts` and `lib/openai.ts`

## Database

- **PostgreSQL** hosted on **Neon** (serverless)
- **Prisma 7** ORM — custom client output path: `lib/generated/prisma/`
- **`@prisma/adapter-pg`** (`PrismaPg`) — required for serverless compatibility; used in `lib/prisma.ts`
- Prisma singleton pattern with global variable guard for dev hot-reload safety
- Always import Prisma client from `@/lib/prisma`, never instantiate directly

## Authentication

- **Clerk** (`@clerk/nextjs` v5) — handles sign-in, sign-up, sessions
- Role stored in Clerk `publicMetadata.role` (`"admin"` | `"user"`) — this is the source of truth for authorization
- `middleware.ts` uses `clerkMiddleware` + `createRouteMatcher` for route protection
- Admin authorization re-verified in `app/admin/layout.tsx` via fresh `clerkClient` call (do not rely on session claims for admin checks)

## Payments

- **Stripe** (`stripe` v21) — subscriptions, checkout sessions, billing portal
- Webhook verification via `svix`
- Stripe client singleton in `lib/stripe.ts`

## Social Media Integration

**Zernio API** (`@zernio/node`) handles all OAuth connection and publishing. Platform-specific OAuth logic has been removed.

- **Client singleton** — `lib/zernio.ts` (reads `ZERNIO_API_KEY`)
- **Connect flow** — `app/api/auth/{platform}/route.ts` calls `zernio.connect.getConnectUrl()` and redirects the user. The callback stores the Zernio `account._id` in the local `SocialAccount.accountId` field.
- **Publishing** — `app/api/social/publish/route.ts` calls `zernio.posts.createPost({ publishNow: true, platforms: [...] })` using the stored Zernio account IDs
- **Scheduling** — `app/api/social/schedule/route.ts` calls `zernio.posts.createPost({ scheduledFor: "...", platforms: [...] })` for non-draft posts
- **Disconnect** — `app/api/social/disconnect/route.ts` calls `zernio.accounts.deleteAccount(accountId)` then removes the local DB record
- **Connections list** — `app/api/social/connections/route.ts` reads from local `SocialAccount` table (populated during callback)
- Supported platforms: `instagram`, `facebook`, `twitter`, `linkedin` (Zernio platform value is lowercase)

## Media

- **ImageKit** — CDN for image and video uploads
- Client: `imagekitio-next`, server: `imagekit`
- Public key exposed via `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`

## UI & Styling

- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **shadcn/ui** — component library, primitives live in `components/ui/`
- **Radix UI** — underlying primitives for shadcn components
- **lucide-react** — icons
- **framer-motion** — animations
- **recharts** — charts and analytics visualizations
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

# Database (Neon PostgreSQL)
DATABASE_URL

# AI
GROQ_API_KEY
OPENAI_API_KEY

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
# Social OAuth
FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET / TWITTER_REDIRECT_URI
INSTAGRAM_CLIENT_ID / INSTAGRAM_CLIENT_SECRET / INSTAGRAM_REDIRECT_URI
LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET / LINKEDIN_REDIRECT_URI
YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REDIRECT_URI / YOUTUBE_API_KEY

# App
NEXT_PUBLIC_APP_URL
ADMIN_EMAIL
```
