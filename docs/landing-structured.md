# Landing — Structured Reference

## Purpose
This document catalogs the landing page implementation: components, props/data, editable text/assets, styling notes, routing, and run instructions.

## Summary

- Entry page: `app/(landing)/page.tsx`
- Layout: `app/(landing)/layout.tsx`
- Navbar: `componentss/shared/Navbar.tsx`
- Landing components: `componentss/landing/` — `Hero.tsx`, `SocialConnect.tsx`, `Features.tsx`, `Pricing.tsx`, `Testimonials.tsx`, `Footer.tsx`

**Note:** `Marquee.tsx` has been removed from the landing page.

---

## Component Reference

### `Hero` — `componentss/landing/Hero.tsx`
- Purpose: primary hero block with headline, CTAs, metrics, and hero person image.
- Exports: `Hero()` (client component).
- Image: `/public/newheroimage.png` — replace to change hero image.
- Data: `metrics` array — `[{ value, label }]` for the 3 stat cards.
- CTAs: `/sign-up` (Start creating) and `/sign-in` (Open dashboard).

### `SocialConnect` — `componentss/landing/SocialConnect.tsx`
- Purpose: decorative showcase of social platform brand icons (not a list of connectable platforms).
- Exports: `SocialConnect()`.
- Icons: served from `cdn.simpleicons.org` CDN.
- Heading: "Connect your favorite accounts" (italic Georgia font).
- Icons shown: Facebook, Instagram, X (Twitter), YouTube, TikTok, Threads, Telegram, Snapchat, WhatsApp.
- **Note:** X (Twitter) appears here as a visual element only. The connectable platforms in the app are Instagram, Facebook, YouTube, and TikTok.

### `Features` — `componentss/landing/Features.tsx`
- Purpose: bento-grid feature showcase.
- Exports: `Features()` (client component).
- Cards:
  1. Multi-Platform Scheduling — concentric arc with platform icons
  2. Analytics & Reports — teal line chart, real-time follower count badge
  3. Media Upload — "Choose Media" upload zone with progress bars
  4. Caption Generator — Phi-2 model reference, tone selectors, sample output
  5. Content Calendar — mini calendar with Published/Scheduled color coding

### `Pricing` — `componentss/landing/Pricing.tsx`
- Purpose: pricing cards with CTA logic for logged-in state.
- Exports: `Pricing({ currentPlan?: string })`.
- Plans: Free ($0) and Premium ($10/mo billed yearly).
- Data: `plans` array — `label`, `price`, `period`, `blurb`, `features[]`, `featuresLabel`, CTAs, `planKey`, `highlighted`.

### `Testimonials` — `componentss/landing/Testimonials.tsx`
- Purpose: 3 customer quote cards with tilted side cards.
- Exports: `Testimonials()`.
- Data: `testimonials` array — `{ photo, name, handle, rating, quote }`.
- Layout: left card rotates -2.5deg, right card +2.5deg, center scales 1.03.

### `Footer` — `componentss/landing/Footer.tsx`
- Purpose: site footer with link groups and social icons.
- Exports: `Footer()`.
- Data: `footerLinks` (Product, Resources, Company) and `socials` arrays.

---

## Shared

### `Navbar` — `componentss/shared/Navbar.tsx`
- Uses Clerk `useUser()` for sign-in state.
- Nav links: `#features`, `#pricing`, `#testimonials` (hash anchors).
- Text color: `text-slate-400` at rest, `hover:text-foreground` on hover.
- Includes `ModeToggle` for dark/light theme switching.
- Mobile: hamburger menu with full nav links.

---

## Routing & Layout

- Landing route group: `app/(landing)/`
- Layout: `Navbar` + page children + `Footer`
- Section order in `app/(landing)/page.tsx`:
  ```tsx
  <Hero />
  <SocialConnect />
  <Features />
  <Pricing />
  <Testimonials />
  ```

---

## Styling & Theme

- Tailwind CSS inline classes throughout.
- Dark mode: `dark:` utilities + `next-themes`.
- Primary color: `#0d7c8a` (teal) for CTAs and accents.
- Font: Inter (set globally via `--font-inter` CSS variable in `app/layout.tsx`).
- Dark mode foreground: pure white `hsl(0 0% 100%)`.
- Secondary text: cool blue-gray `hsl(220 20% 65%)`.

---

## Caption Generation

- Model: fine-tuned Phi-2 on Hugging Face Inference API.
- Client: `lib/model.ts`.
- Route: `app/api/generate/caption/route.ts`.
- Env vars needed: `HF_MODEL_ID`, `HF_API_KEY`.
- Returns HTTP 503 until model is deployed.

---

## Supported Platforms

| Platform  | OAuth Route              |
|-----------|--------------------------|
| Instagram | `/api/auth/instagram`    |
| Facebook  | `/api/auth/facebook`     |
| YouTube   | `/api/auth/youtube`      |
| TikTok    | `/api/auth/tiktok`       |

> LinkedIn and Twitter/X are NOT connectable platforms. They do not have backend OAuth implementation.

---

## Assets

- Hero image: `public/newheroimage.png`
- Logo: `public/logo.png`
- Social icons: `cdn.simpleicons.org` CDN
- Testimonial avatars: `i.pravatar.cc` placeholders

---

## Run & Build

```bash
pnpm dev    # http://localhost:3000
pnpm build  # prisma generate + next build
```
