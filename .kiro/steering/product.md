# Product: PostSathi

**Tagline:** Create smarter. Post faster.

PostSathi is an AI-powered social media content generation and scheduling SaaS platform. Users provide a topic, platform, and tone — the app generates captions, hashtags, and images, then lets them schedule or publish directly to connected social accounts.

## Core Features

- **AI Content Generation** — Groq (Llama 3) generates platform-optimized captions, titles, and hashtags. OpenAI handles image generation.
- **Multi-Platform Publishing** — Instagram, Facebook, Twitter/X, LinkedIn, YouTube via OAuth-connected accounts.
- **Post Scheduling** — Draft, schedule, or publish immediately. Calendar view for scheduled posts.
- **Social Account OAuth** — Users connect real social accounts (Facebook, Instagram, Twitter/X, LinkedIn) via OAuth 2.0. Tokens are stored in the `SocialAccount` table and used to call platform APIs directly.
- **Usage Limits** — Per-user daily limits enforced by plan tier (FREE: 10 captions/day, PRO/ENTERPRISE: higher limits).
- **Subscription Billing** — Stripe with FREE / PRO / ENTERPRISE plans.
- **Admin Panel** — User management, analytics, content flagging/deletion, subscription overrides.
- **Media Uploads** — Images and videos via ImageKit CDN.

## User Roles

- **USER** — Standard authenticated user with dashboard, generation, history, analytics, calendar, and platforms pages.
- **ADMIN** — Full admin panel access. Role stored in Clerk `publicMetadata.role`.

## Plans

| Plan | Daily Captions | Notes |
|------|---------------|-------|
| FREE | 10 | Limited platforms |
| PRO | Unlimited | All platforms |
| ENTERPRISE | Unlimited | Priority support |
