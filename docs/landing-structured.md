# Landing — Structured Reference

Purpose
- This document catalogs the landing page implementation: components, props/data, editable text/assets, styling notes, routing, and run instructions.

Summary
- Entry page: [app/(landing)/page.tsx](app/(landing)/page.tsx)
- Layout: [app/(landing)/layout.tsx](app/(landing)/layout.tsx)
- Navbar: [componentss/shared/Navbar.tsx](componentss/shared/Navbar.tsx)
- Landing components: located under [componentss/landing/](componentss/landing/) — `Hero.tsx`, `Marquee.tsx`, `Features.tsx`, `Pricing.tsx`, `Testimonials.tsx`, `Footer.tsx`.

Component reference (fields, defaults, notes)

- `Hero` — `componentss/landing/Hero.tsx`
  - Purpose: primary hero block with headline, subcopy, CTAs, metrics, and sample publishing preview.
  - Exports: `Hero()` React component (client).
  - Data arrays:
    - `metrics`: [{ value: "4+", label: "social channels" }, { value: "10s", label: "caption drafts" }, { value: "24/7", label: "scheduled queue" }]
    - `queue`: sample publishing items with `{ platform, time, color }` — used to render the preview queue.
    - `platform list` (inline): Instagram, LinkedIn, X, Add media (with icons and `active` flags).
    - `tags` (inline): `#ContentMarketing`, `#CreatorTools`, `#LaunchDay`.
  - CTAs: `href` to `/sign-up` and `/sign-in` (change to alter flow).
  - Styling: heavy Tailwind usage; hero background gradients and responsive grid. Edit classnames for visual changes.

- `Marquee` — `componentss/landing/Marquee.tsx`
  - Purpose: scrolling feature list.
  - Exports: `Marquee()`.
  - Data: `marqueeItems` array of `{ icon, label }` — duplicated for continuous marquee.
  - Animation: uses `animate-[marquee_30s_linear_infinite]` CSS utility keyframe.

- `Features` — `componentss/landing/Features.tsx`
  - Purpose: feature grid and highlighted composer block.
  - Exports: `Features()`.
  - Data: `features` array of `{ icon, title, desc }` (6 items). Also platform names array ["Instagram","Facebook","LinkedIn","X"].
  - Notes: first large block is multi-platform composer; second is a small dashboard pitch block.

- `Pricing` — `componentss/landing/Pricing.tsx`
  - Purpose: pricing grid with CTA logic for logged-in state.
  - Exports: `Pricing({ currentPlan?: string })` (optional prop).
  - Data: `plans` array, each plan contains `label`, `price`, `period?`, `blurb`, `features[]`, `cta`, `ctaLoggedInFree`, `ctaLoggedInPro`, `href`, `planKey`, `highlighted`.
  - CTA routing logic (derived from `currentPlan` and `planKey`) maps to `/user/dashboard`, `/api/billing-portal`, `/api/checkout`, or signup links.
  - Styling: highlighted plan uses stronger border + shadow.

- `Testimonials` — `componentss/landing/Testimonials.tsx`
  - Purpose: customer quotes grid.
  - Exports: `Testimonials()`.
  - Data: `testimonials` array: `{ photo, name, role, quote }`. Photos use external `https://i.pravatar.cc` placeholders.

- `Footer` — `componentss/landing/Footer.tsx`
  - Purpose: site footer with link groups and socials.
  - Exports: `Footer()`.
  - Data:
    - `footerLinks`: object with `Product`, `Resources`, `Company` arrays of `{ label, href }`.
    - `socials`: `{ label, href, icon }` array.
  - Uses shared `Logo` component from `componentss/shared/Logo.tsx`.

Shared
- `Navbar` — `componentss/shared/Navbar.tsx`
  - Purpose: top navigation used across landing layout.
  - Exports: `Navbar()`.
  - Behavior: uses Clerk `useUser()` for sign-in state; displays `Dashboard` or `Get started` accordingly. Includes mobile menu, theme toggle (`ModeToggle`), and role-based admin detection using `user.publicMetadata.role`.
  - Links: `navLinks` target `#features`, `#pricing`, `#testimonials` anchors on the landing page.

Routing & layout
- The landing route is in the `app` router under the `(landing)` group. Layout file [app/(landing)/layout.tsx](app/(landing)/layout.tsx) composes `Navbar` + page `children` + `Footer`.
- To reorder sections, edit [app/(landing)/page.tsx](app/(landing)/page.tsx) where sections are imported and placed in JSX.

Styling & theme
- Tailwind CSS classes are used inline in JSX.
- Dark mode support via `dark:` utilities; `next-themes` is present in dependencies for switching themes.

Assets & images
- Most images are external or decorative (avatars use `i.pravatar.cc`). To use local images, add them to `public/` and reference `/path` in components.

Run & build
- Dev server: `pnpm dev` (see `package.json` script). Open http://localhost:3000.
- Build: `pnpm build` runs `prisma generate && next build`.

Recommendations / next steps
- Centralize editable copy: move arrays and strings to `data/landing.ts` and import into components for easier editing (and potential CMS integration).
- Add tests or storybook stories for each section if you want visual regression checks.
- Replace placeholder avatars with real customer photos and add alt text metadata for accessibility.

Where I saved this
- Structured doc: `docs/landing-structured.md` (this file)

If you'd like, I can now:
- move the component data into `data/landing.ts` and update imports, or
- generate a small markdown with screenshots for designers.
