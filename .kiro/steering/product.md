# Product: PostSathi

**Tagline:** Create smarter. Post faster.

PostSathi is a web-based social media content management and scheduling SaaS platform. Users provide a topic, platform, and tone — the system generates platform-optimized captions and hashtags using a fine-tuned Phi-2 model trained on PostSathi's own dataset. Generated content can be published immediately or scheduled to connected social accounts.

## Core Features

- **Caption Generation** — Fine-tuned Phi-2 model (hosted on Hugging Face Inference API) generates platform-optimized captions and hashtags. Model client lives in `lib/model.ts`.
- **Multi-Platform Publishing** — Instagram, Facebook, YouTube, TikTok via OAuth-connected accounts using the Zernio API.
- **Post Scheduling** — Schedule posts for a future date/time or publish immediately. Calendar view for scheduled posts.
- **Social Account OAuth** — Users connect social accounts (Facebook, Instagram, YouTube, TikTok) via Zernio OAuth. Account IDs stored in the `SocialAccount` table.
- **Post Preview** — Live preview of Facebook Post, Facebook Reel, and Instagram formats before publishing. Fetches connected Facebook profile photo.
- **Usage Limits** — Per-user daily caption limits and monthly schedule limits enforced by plan tier (FREE: 10 captions/day, 15 schedules/month; PRO: unlimited). Daily caption limit is read from the `PlanLimit` DB table when available, with a hardcoded fallback. Monthly schedule limit is hardcoded in application logic.
- **Subscription Billing** — Stripe with FREE ($0) and PRO ($10/month) plans. Checkout via `/api/checkout`. Billing portal (manage/cancel subscription) via `/api/billing-portal`. Stripe webhook handler at `/api/webhooks/stripe`.
- **Admin Panel** — User management, analytics, content flagging/deletion, subscription overrides, activity log.
- **Media Uploads** — Images (JPEG, PNG, WebP, GIF, max 20MB) and videos (MP4, MOV, WebM, max 100MB) via ImageKit CDN.
- **User Dashboard** — Quick Actions, Recent Posts, Upcoming Posts, Plan Banner.
- **Dark Mode** — Full dark/light theme support via `next-themes`. Pure white foreground in dark mode.

## User Roles

- **USER** — Standard authenticated user with dashboard, generate, history, analytics, calendar, and platforms pages.
- **ADMIN** — Full admin panel access. Role stored in Clerk `publicMetadata.role` as lowercase `"admin"` or `"user"`.

## Supported Platforms

| Platform  | OAuth Route              |
|-----------|--------------------------|
| Instagram | `/api/auth/instagram`    |
| Facebook  | `/api/auth/facebook`     |
| YouTube   | `/api/auth/youtube`      |
| TikTok    | `/api/auth/tiktok`       |

> **Note:** LinkedIn is NOT supported. An empty route folder exists at `app/api/auth/linkedin/` but contains no implementation.

## Plans

| Plan | Daily Captions | Monthly Schedules | Price        |
|------|---------------|-------------------|--------------|
| FREE | 10            | 15                | $0           |
| PRO  | Unlimited     | Unlimited         | $10/mo       |

## Caption Model

- **Model**: Fine-tuned Phi-2 trained on PostSathi's own social media dataset
- **Hosting**: Hugging Face Inference API (when deployed)
- **Client**: `lib/model.ts`
- **Env vars**: `HF_MODEL_ID`, `HF_API_KEY`
- **Status**: Returns HTTP 503 with friendly message until model is deployed to HF Hub

## Known Gaps (Not Yet Implemented)

- **Draft posts** — `DRAFT` status is not in the Prisma `ScheduleStatus` enum; saving drafts is not supported
- **`PlanLimit` as full source of truth** — `dailyCaptions` is read from the DB table; `monthlySchedules` is hardcoded (the `PlanLimit` model has no `monthlySchedules` column)
- **`tone` field on `Generation`** — tone is accepted as input but not persisted to the DB
- **`BrandVoice` model** — exists in the Prisma schema but has no UI or API routes
- **Email notifications** — `lib/email.ts` defines `sendPostPublishedEmail` and `sendPostFailedEmail` via Resend, but these helpers are never called from any route
