# PostSathi — Landing Page Documentation

## Overview

The landing page showcases PostSathi and converts visitors to sign-up. It is built with composable React components and Tailwind CSS in the Next.js App Router.

---

## File Locations

| File | Purpose |
|------|---------|
| `app/(landing)/page.tsx` | Page entry — section order defined here |
| `app/(landing)/layout.tsx` | Layout wrapper — Navbar + children + Footer |
| `componentss/landing/Hero.tsx` | Hero section with person image and CTA |
| `componentss/landing/SocialConnect.tsx` | Social platform icons section |
| `componentss/landing/Features.tsx` | Features section with dashboard mock |
| `componentss/landing/Pricing.tsx` | Pricing cards (Free / Premium) |
| `componentss/landing/Testimonials.tsx` | Testimonials with tilted cards |
| `componentss/landing/Footer.tsx` | Footer with links and social icons |
| `componentss/shared/Navbar.tsx` | Navigation bar (used by landing layout) |

---

## Section Order

```tsx
// app/(landing)/page.tsx
<Hero />
<SocialConnect />
<Features />
<Pricing />
<Testimonials />
```

To change section order, reorder the imports in `app/(landing)/page.tsx`.

---

## Component Notes

### Hero.tsx
- Displays tagline "Create once. Post everywhere."
- Right side shows `/public/newheroimage.png` — replace this file to change the hero image
- `metrics` array at top controls the 3 stat cards (social channels, caption drafts, scheduled queue)
- CTA buttons link to `/sign-up` and `/sign-in`

### SocialConnect.tsx
- Shows brand icons from Simple Icons CDN (`cdn.simpleicons.org`)
- `platforms` array — add/remove platforms or change icon colors
- Title uses italic Georgia font — edit the `<p>` tag to change text

### Features.tsx
- `features` array — edit `title` and `desc` for each feature card
- Dashboard mock UI is hardcoded in JSX — edit directly for visual changes
- `platforms` and `queue` arrays control the mock composer and publishing queue

### Pricing.tsx
- `plans` array — edit `label`, `price`, `blurb`, `features`, `featuresLabel`, CTA labels
- Accepts optional `currentPlan?: string` prop to show logged-in states (Current Plan / Upgrade / Manage Billing)
- Highlighted card (Premium) uses `highlighted: true`

### Testimonials.tsx
- `testimonials` array — update `photo` (pravatar.cc URL), `name`, `handle`, `rating`, `quote`
- Side cards are tilted via inline `style={{ transform: "rotate(±2.5deg)" }}`
- Center card scales up slightly with `scale(1.03)`

### Footer.tsx
- `footerLinks` object — edit categories and links
- `socials` array — edit social icon links

---

## Styling

- All styling uses Tailwind CSS utility classes directly in JSX
- Dark mode: uses `dark:` utility classes throughout; theme is managed by `next-themes`
- Primary color: `#0d7c8a` (teal) used for CTA buttons
- Font: Inter (set globally in `app/layout.tsx`)
- Dark mode foreground: pure white; secondary text: cool blue-gray `hsl(220 20% 65%)`

---

## Adding a New Section

1. Create `componentss/landing/NewSection.tsx`
2. Export a React function component
3. Import and add it in `app/(landing)/page.tsx`

---

## Images

- Hero image: `public/newheroimage.png` — replace with your own (recommended: 900×1000px PNG)
- Logo: `public/logo.png` — used in Navbar and auth layout
- Social icons: served from `cdn.simpleicons.org` CDN (no local files needed)

---

## Local Development

```bash
pnpm dev
# open http://localhost:3000
```

---

## Caption Generation

Captions are generated via a fine-tuned **Phi-2** model hosted on Hugging Face Inference API.

**To activate when model is deployed:**
1. Upload your fine-tuned Phi-2 model to Hugging Face Hub
2. Add to `.env.local`:
   ```
   HF_MODEL_ID=your-org/phi2-postsathi
   HF_API_KEY=hf_xxxxxxxxxxxx
   ```
3. The caption route at `/api/generate/caption` will call your model automatically

**Until deployed:** the API returns HTTP 503 with a friendly message.

Model client: `lib/model.ts`
Caption route: `app/api/generate/caption/route.ts`

---

## Supported Platforms

PostSathi supports the following social media platforms:

| Platform | OAuth Route | Callback |
|----------|------------|---------|
| Facebook | `/api/auth/facebook` | `/api/auth/facebook/callback` |
| Instagram | `/api/auth/instagram` | `/api/auth/instagram/callback` |
| YouTube | `/api/auth/youtube` | `/api/auth/youtube/callback` |
| TikTok | `/api/auth/tiktok` | `/api/auth/tiktok/callback` |

All OAuth flows use the Zernio API (`@zernio/node`).
