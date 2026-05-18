## Landing Page — Documentation

Overview
- Purpose: the landing page showcases the product and converts visitors to sign-up. It is implemented with composable React components and Tailwind CSS in the Next.js `app` directory.

Where to find files
- Page entry: [app/(landing)/page.tsx](app/(landing)/page.tsx)
- Page layout: [app/(landing)/layout.tsx](app/(landing)/layout.tsx)
- Landing components: [componentss/landing/Hero.tsx](componentss/landing/Hero.tsx), [componentss/landing/Marquee.tsx](componentss/landing/Marquee.tsx), [componentss/landing/Features.tsx](componentss/landing/Features.tsx), [componentss/landing/Pricing.tsx](componentss/landing/Pricing.tsx), [componentss/landing/Testimonials.tsx](componentss/landing/Testimonials.tsx), [componentss/landing/Footer.tsx](componentss/landing/Footer.tsx)
- Shared UI: [componentss/shared/Navbar.tsx](componentss/shared/Navbar.tsx) (used by the landing layout)

Quick component notes (editable spots)
- `Hero.tsx`: headline, subcopy, CTA links, `metrics` and `queue` arrays at top — edit these arrays to update visible stats and sample queue items.
- `Marquee.tsx`: `marqueeItems` array — edit labels/icons for the scrolling capabilities list.
- `Features.tsx`: `features` array and the two highlighted blocks — edit `title` / `desc` for each feature card.
- `Pricing.tsx`: `plans` array — price, blurb, features, CTA labels. The component accepts an optional `currentPlan?: string` prop to show logged-in states.
- `Testimonials.tsx`: `testimonials` array — update photo URLs, `name`, `role`, `quote`.
- `Footer.tsx`: `footerLinks` and `socials` objects — edit links, labels, or social icons.

How layout & routing works
- `app/(landing)/layout.tsx` composes the landing layout (`Navbar` + `children` + `Footer`). Edit this file to change global wrappers for the landing section.
- The landing page is implemented under `app/(landing)/page.tsx`. To change section order, add/remove imports here and change the JSX order.

Styling
- Styling is Tailwind CSS classes applied directly in each component. For visual tweaks, edit class names in the JSX.
- Dark mode: components use `dark:` utility classes; the project uses `next-themes` so theme toggling is supported in the shared components.

Editing guidance
- Copy/text changes: modify text strings or arrays at the top of each component file (examples above).
- New section: create a new file under `componentss/landing/`, export the section (React function), then import and add it in [app/(landing)/page.tsx](app/(landing)/page.tsx).
- Images: components mostly use external URLs or uploaded assets. For local/static images, add files to `public/` and reference with `/your-path`.

Previewing locally
- Start the dev server and open the app in a browser:

```bash
pnpm dev
# then open http://localhost:3000
```

Notes & next steps
- `Pricing.tsx` contains logic for logged-in vs logged-out CTA labels; if you need to wire current plan data, pass `currentPlan` from server or client props.
- Consider centralizing editable copy in a small `data/landing.ts` file if you expect non-developer editors to update content frequently.

Contact
- If you want, I can update copy for any section, add screenshots, or centralize the strings into a single data file.
