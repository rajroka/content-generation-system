# Project Structure

## Root Layout

```
/
├── app/                    # Next.js App Router — all routes and API handlers
├── componentss/            # App-specific React components (note: double-s is intentional in this codebase)
├── components/ui/          # shadcn/ui primitives (Button, Card, Badge, Dialog, etc.)
├── lib/                    # Shared utilities, singletons, and AI helpers
├── prisma/                 # Prisma schema and migrations
├── types/                  # Shared TypeScript type definitions
├── middleware.ts           # Clerk auth middleware — route protection
├── next.config.js
├── tsconfig.json
├── tailwind.config.*
└── components.json         # shadcn/ui config
```

## `app/` — Route Structure

```
app/
├── layout.tsx                      # Root layout: ClerkProvider + ThemeProvider + Toaster
├── globals.css
├── (auth)/                         # Route group — Clerk sign-in/sign-up UI
│   ├── layout.tsx
│   ├── sign-in/[[...sign-in]]/
│   └── sign-up/[[...sign-up]]/
├── (landing)/                      # Route group — public marketing pages
│   ├── layout.tsx
│   └── page.tsx                    # Landing page + pricing
├── auth/redirect/                  # Post-login role-based redirect (reads Clerk metadata → /admin or /user/dashboard)
├── admin/                          # Admin-only area (role checked in layout.tsx)
│   ├── layout.tsx                  # Auth + role guard; renders AdminSidebar + AdminNavbar
│   ├── page.tsx
│   ├── analytics/
│   ├── users/
│   ├── content/
│   ├── subscriptions/
│   └── activity/
├── user/                           # Authenticated user area
│   ├── layout.tsx
│   ├── dashboard/
│   ├── generate/                   # Main content composer with caption generation
│   ├── history/
│   ├── analytics/
│   ├── calendar/                   # Scheduled posts calendar
│   └── platforms/                  # Social account connections
└── api/                            # API route handlers
    ├── generate/
    │   └── caption/route.ts        # Caption generation via fine-tuned Phi-2 model
    ├── social/
    │   ├── publish/route.ts
    │   ├── schedule/route.ts
    │   ├── scheduled/route.ts      # GET/PATCH/DELETE for scheduled posts
    │   ├── connections/route.ts
    │   ├── disconnect/route.ts
    │   └── toggle-active/route.ts
    ├── upload/                     # ImageKit upload (image + video)
    ├── auth/                       # OAuth flows: facebook, instagram, youtube, tiktok
    │   └── {platform}/
    │       ├── route.ts            # Initiate OAuth via Zernio
    │       └── callback/route.ts   # Handle OAuth callback, store SocialAccount
    ├── admin/                      # Admin CRUD endpoints
    │   ├── users/
    │   │   ├── route.ts
    │   │   ├── toggle-active/route.ts
    │   │   └── update-plan/route.ts
    │   ├── generations/
    │   │   ├── route.ts
    │   │   ├── flag/route.ts
    │   │   └── delete/route.ts
    │   ├── analytics/route.ts
    │   ├── subscriptions/route.ts
    │   └── activity/route.ts
    ├── user/                       # User profile, usage, plan, notifications
    ├── checkout/route.ts           # Stripe checkout session
    ├── billing-portal/route.ts     # ⚠️ Currently a duplicate Stripe webhook — Billing Portal redirect not yet implemented
    └── webhooks/
        ├── clerk/route.ts
        └── stripe/route.ts
```

## `componentss/` — App Components

Note: the folder is named `componentss/` (double-s) — this is the existing convention, do not rename it.

```
componentss/
├── admin/
│   ├── AdminSidebar.tsx
│   └── AdminNavbar.tsx
├── dashboard/
│   ├── Sidebar.tsx
│   ├── DashboardNavbar.tsx
│   └── UpgradeNotifier.tsx
├── landing/
│   ├── Hero.tsx
│   ├── SocialConnect.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Testimonials.tsx
│   └── Footer.tsx
├── shared/
│   ├── Navbar.tsx
│   ├── Logo.tsx
│   ├── ThemeProvider.tsx
│   ├── ModeToggle.tsx
│   └── CopyButton.tsx
└── auth-buttons.tsx
```

## `components/ui/` — shadcn Primitives

Auto-generated shadcn/ui components (Button, Card, Badge, Dialog, Select, Tabs, etc.). Do not manually edit these — use the shadcn CLI to add new ones.

## `lib/` — Shared Utilities & Singletons

```
lib/
├── prisma.ts           # Prisma client singleton (always import from here)
├── model.ts            # Caption generation client — fine-tuned Phi-2 via Hugging Face Inference API
├── stripe.ts           # Stripe client singleton
├── zernio.ts           # Zernio API client singleton (reads ZERNIO_API_KEY)
├── admin.ts            # makeUserAdmin / removeAdminRole Clerk helpers
├── user.ts             # getUserByClerkId helper
├── email.ts            # Resend email helpers — sendPostPublishedEmail, sendPostFailedEmail (not yet called)
├── utils.ts            # cn() — clsx + tailwind-merge
└── generated/prisma/   # Prisma-generated client (do not edit manually; regenerate with `pnpm prisma generate`)
```

## `types/index.ts` — Shared Types

Central file for shared TypeScript interfaces and type aliases: `Platform`, `Tone`, `Plan`, `Role`, `GeneratedContent`, `UserProfile`, `UsageStats`, `StatCardProps`.

Prisma-generated enums (from `lib/generated/prisma`) are used directly in DB operations; `types/index.ts` mirrors them for UI/API layer use.

## Charts

- **User analytics** (`app/user/analytics/page.tsx`) — uses `@mui/x-charts` (`BarChart`, `LineChart`, `PieChart`)
- **Admin analytics** (`app/admin/analytics/page.tsx`) — uses `recharts` (`LineChart`, `BarChart`, `PieChart`, `ResponsiveContainer`)

Both libraries are installed. Do not mix them within the same page.

## Key Conventions

- **Server Components by default** — use `"use client"` only when interactivity or browser APIs are needed.
- **Layouts handle auth** — route group layouts (`admin/layout.tsx`, `user/layout.tsx`) are the auth/role gatekeepers. Don't duplicate auth checks in every page.
- **API routes always start with auth** — call `auth()` from `@clerk/nextjs/server` as the first step in every handler.
- **`export const dynamic = "force-dynamic"`** — add to all API routes and pages that read auth or request data.
- **Prisma enums** — import from `@/lib/generated/prisma`, not from `@prisma/client`.
- **Path alias** — `@/` maps to the project root. Use it for all internal imports.
- **No test framework** — there is no Jest/Vitest setup; do not assume tests exist.
- **Clerk role values** — stored as lowercase strings in `publicMetadata.role`: `"admin"` or `"user"`. Admin checks compare against lowercase `"admin"`.
