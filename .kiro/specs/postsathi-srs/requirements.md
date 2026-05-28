# Requirements Document

## Introduction

PostSathi is a web-based social media content management and scheduling SaaS platform. Users provide a topic, target platform, and tone; the system generates platform-optimized captions and hashtags using a fine-tuned Phi-2 model trained on PostSathi's own dataset. Generated content can be published immediately or scheduled to connected social accounts (Instagram, Facebook, YouTube, TikTok) via the Zernio API. The platform enforces per-user usage limits based on subscription tier (FREE / PRO), manages billing through Stripe, and provides an admin panel for user management, analytics, and content moderation.

---

## Glossary

- **System**: The PostSathi application as a whole.
- **User**: An authenticated individual with the USER role who accesses the dashboard and content features.
- **Admin**: An authenticated individual with the ADMIN role who accesses the admin panel.
- **Caption_Generator**: The subsystem responsible for producing captions and hashtags via the fine-tuned Phi-2 model hosted on Hugging Face Inference API.
- **Scheduler**: The subsystem responsible for creating, storing, and managing scheduled posts.
- **Publisher**: The subsystem responsible for immediately publishing posts to connected social platforms via the Zernio API.
- **Usage_Enforcer**: The subsystem responsible for tracking and enforcing per-user daily and monthly usage limits.
- **Auth_Service**: Clerk — the external service handling user authentication, session management, and role assignment.
- **Zernio**: The third-party API (`@zernio/node`) used for social media OAuth connection and post publishing.
- **ImageKit**: The CDN service used for storing and serving uploaded images and videos.
- **Stripe**: The payment processor used for subscription billing and checkout.
- **Generation**: A single content generation event, producing a caption and hashtags, stored in the `Generation` database model.
- **ScheduledPost**: A database record representing a post in SCHEDULED, PUBLISHED, FAILED, or CANCELLED state.
- **SocialAccount**: A database record linking a User to a connected social media platform account via Zernio.
- **Plan**: A subscription tier — FREE or PRO — that determines usage limits and feature access.
- **PlanLimit**: A database record defining the daily caption limit for each Plan. Note: the `monthlySchedules` limit is hardcoded in application logic, not stored in this table.
- **Usage**: A database record tracking a User's daily consumption of captions, images, and posts.
- **Platform**: One of INSTAGRAM, FACEBOOK, YOUTUBE, or TIKTOK.
- **Tone**: One of PROFESSIONAL, CASUAL, INSPIRATIONAL, or HUMOROUS — the stylistic register for generated content.
- **Webhook**: An HTTP callback from an external service (Stripe or Clerk) to notify the System of events.
- **CDN_URL**: A publicly accessible URL returned by ImageKit after a successful media upload.

---

## Requirements

### Requirement 1: User Authentication and Session Management

**User Story:** As a visitor, I want to sign up and sign in securely, so that I can access my personal dashboard and content history.

#### Acceptance Criteria

1. THE Auth_Service SHALL provide sign-up and sign-in flows accessible at `/sign-up` and `/sign-in` respectively, rendered in a split-screen layout with branding on the left and the Clerk component on the right.
2. WHEN a User completes sign-up, THE System SHALL create a corresponding User record in the database via the Clerk webhook at `/api/webhooks/clerk`.
3. WHEN a User signs in, THE Auth_Service SHALL issue a session token that the System uses to identify the User on all subsequent requests.
4. WHEN an unauthenticated request is made to any route under `/user/*` or `/admin/*`, THE System SHALL redirect the request to the sign-in page.
5. WHEN a User's session expires or is revoked, THE System SHALL redirect the User to the sign-in page on the next request.
6. IF the Clerk webhook payload signature is invalid, THEN THE System SHALL reject the webhook request with HTTP 400.
7. THE System SHALL store the User's `clerkId`, `email`, `name`, and `imageUrl` in the User database record.
8. WHEN a User account is deleted in Clerk, THE System SHALL set `isActive` to `false` on the corresponding User record.

---

### Requirement 2: Role-Based Access Control

**User Story:** As a platform operator, I want role-based access control, so that only authorized administrators can access the admin panel.

#### Acceptance Criteria

1. THE System SHALL recognize exactly two roles: USER and ADMIN, stored in Clerk `publicMetadata.role` as lowercase strings (`"user"`, `"admin"`).
2. WHEN a request is made to any route under `/admin/*`, THE System SHALL verify the authenticated user's role is `"admin"` by querying the Clerk client directly in `app/admin/layout.tsx`.
3. IF a User with the USER role attempts to access any route under `/admin/*`, THEN THE System SHALL redirect the request to `/user/dashboard`.
4. WHEN a User completes sign-in, THE System SHALL redirect the User to `/admin` if the role is `"admin"`, or to `/user/dashboard` if the role is `"user"`, via the `/auth/redirect` route.
5. THE System SHALL not rely solely on session claims for admin authorization; THE System SHALL re-verify the role via a fresh Clerk client call in `app/admin/layout.tsx`.
6. THE Admin SHALL be able to assign or revoke the ADMIN role for any User via the admin panel.

---

### Requirement 3: Caption and Hashtag Generation

**User Story:** As a User, I want to generate platform-optimized captions and hashtags from a topic and tone, so that I can create engaging social media content quickly.

#### Acceptance Criteria

1. WHEN a User submits a generation request with a `topic`, `platform`, and `tone`, THE Caption_Generator SHALL return a caption and an array of hashtags.
2. THE Caption_Generator SHALL use a fine-tuned Phi-2 model hosted on Hugging Face Inference API (`lib/model.ts`) for caption and hashtag generation.
3. THE Caption_Generator SHALL tailor the caption style and length to the specified Platform.
4. THE Caption_Generator SHALL tailor the caption register to the specified Tone.
5. WHEN a caption is successfully generated, THE System SHALL persist a Generation record with `userId`, `topic`, `platform`, `caption`, and `hashtags`. Note: the `tone` field is accepted as input but is not persisted to the Generation record.
6. WHEN a User on the FREE plan has reached the daily caption limit, THE Usage_Enforcer SHALL reject the generation request with HTTP 429 and a descriptive error message indicating the limit and plan.
7. WHEN a caption generation request is rejected due to usage limits, THE System SHALL not create a Generation record or increment the usage counter.
8. WHEN a caption is successfully generated, THE Usage_Enforcer SHALL increment `captionCount` in the User's Usage record for the current date.
9. IF the model API is unavailable or not yet deployed, THEN THE Caption_Generator SHALL return HTTP 503 with a descriptive error message.
10. THE Caption_Generator SHALL accept exactly one of the four defined Tone values: PROFESSIONAL, CASUAL, INSPIRATIONAL, HUMOROUS.
11. WHEN the model is deployed, THE System SHALL read `HF_MODEL_ID` and `HF_API_KEY` from environment variables to call the Hugging Face Inference API.

---

### Requirement 4: Social Account OAuth Connection

**User Story:** As a User, I want to connect my social media accounts, so that I can publish and schedule posts directly from PostSathi.

#### Acceptance Criteria

1. WHEN a User initiates a connection for a Platform, THE System SHALL call `zernio.connect.getConnectUrl()` and redirect the User to the Zernio OAuth authorization URL.
2. WHEN the Zernio OAuth callback is received at `/api/auth/{platform}/callback`, THE System SHALL upsert a SocialAccount record with `userId`, `platform`, `accountId`, `accountName`, and `isActive: true`.
3. IF a SocialAccount record already exists for the same `userId` and `platform`, THEN THE System SHALL update the existing record rather than creating a duplicate.
4. WHEN a User disconnects a Platform, THE System SHALL call `zernio.accounts.deleteAccount(accountId)` (best-effort) and then delete the corresponding SocialAccount record from the database regardless of the Zernio API result.
5. THE System SHALL support OAuth connection for INSTAGRAM, FACEBOOK, YOUTUBE, and TIKTOK platforms only.
6. WHEN a User requests the list of connected accounts via `/api/social/connections`, THE System SHALL return all SocialAccount records for that User from the local database.
7. IF the Zernio OAuth callback contains an error parameter, THEN THE System SHALL display a descriptive error message to the User.
8. THE System SHALL allow a User to toggle auto-publishing on or off for each connected platform via a Switch control, updating `isActive` on the SocialAccount record.

---

### Requirement 5: Immediate Post Publishing

**User Story:** As a User, I want to publish a post immediately to one or more connected social platforms, so that I can share content in real time.

#### Acceptance Criteria

1. WHEN a User submits a publish request with a `caption` and/or `mediaUrls` and one or more `platforms`, THE Publisher SHALL call `zernio.posts.createPost({ publishNow: true, platforms: [...] })` using the stored Zernio account IDs.
2. WHEN a post is successfully published, THE System SHALL create a ScheduledPost record with `status: PUBLISHED` and `publishedAt` set to the current timestamp.
3. IF the Zernio API returns an error during publishing, THEN THE System SHALL return an error response with the Zernio error message.
4. IF a User attempts to publish to a Platform for which no active SocialAccount exists, THEN THE System SHALL reject the request with HTTP 400 and a descriptive error message listing the missing platforms.
5. THE System SHALL allow posting with caption-only, media-only, or both caption and media.
6. WHEN a publish request is made, THE Usage_Enforcer SHALL increment `postCount` in the User's Usage record for the current date.
7. IF an unauthenticated request is made to `/api/social/publish`, THEN THE System SHALL reject the request with HTTP 401.
8. WHEN publishing to Instagram with a portrait image (aspect ratio below 0.75), THE System SHALL automatically set the content type to `"story"` in the Zernio request.

---

### Requirement 6: Post Scheduling

**User Story:** As a User, I want to schedule posts for a future date and time, so that I can plan my content calendar in advance.

#### Acceptance Criteria

1. WHEN a User submits a schedule request with a `caption`, `platforms`, and a future `scheduledFor` datetime, THE Scheduler SHALL call `zernio.posts.createPost({ scheduledFor: "...", platforms: [...] })` and create a ScheduledPost record with `status: SCHEDULED`.
2. THE System SHALL store `caption`, `hashtags`, `imageUrl`, `imageUrls`, `platforms`, `scheduledFor`, and `status` on the ScheduledPost record.
3. WHEN a ScheduledPost is successfully created with `status: SCHEDULED`, THE Usage_Enforcer SHALL increment `scheduleCount` in the User's Usage record for the current calendar day.
4. WHEN a User on the FREE plan has reached 15 scheduled posts in the current calendar month (counting SCHEDULED and PUBLISHED statuses), THE Usage_Enforcer SHALL reject the schedule request with HTTP 429 and a descriptive error message.
5. IF the `scheduledFor` datetime is in the past or invalid, THEN THE System SHALL reject the schedule request with HTTP 400 and a descriptive error message.
6. IF an unauthenticated request is made to `/api/social/schedule`, THEN THE System SHALL reject the request with HTTP 401.
7. IF a User attempts to schedule to a Platform for which no active SocialAccount exists, THEN THE System SHALL reject the request with HTTP 400 listing the missing platforms.

---

### Requirement 7: Post Preview

**User Story:** As a User, I want to preview how my post will look on different platforms before publishing, so that I can ensure the content looks correct.

#### Acceptance Criteria

1. THE generate page SHALL display a live preview panel that updates in real time as the User types a caption or uploads media.
2. THE System SHALL provide a platform preview selector with the following options: Facebook Post, Facebook Reel, Instagram.
3. WHEN a User selects a preview type, THE System SHALL render a mock UI matching that platform's post format.
4. WHEN a User has connected a Facebook account, THE System SHALL fetch and display the Facebook profile photo in the preview.
5. THE preview SHALL display the full media without cropping, using `object-contain` layout.
6. WHEN a User navigates from the connections page using the "Change Preview" button, THE generate page SHALL pre-select that platform's preview.
7. THE generate page caption input area SHALL display a character count indicator.
8. THE generate button SHALL use the `Wand2` icon from lucide-react and SHALL be visually smaller than the primary publish buttons.
9. THE date picker in the Schedule & Publish section SHALL use the application's teal color (`#0D7C8A`) for the selected date highlight, matching the rest of the UI.

---

### Requirement 8: Usage Limit Display

**User Story:** As a User, I want to see my current usage against my plan limits, so that I know how many captions and schedules I have remaining.

#### Acceptance Criteria

1. THE analytics page SHALL display two circular gauge widgets side by side showing daily caption usage and monthly schedule usage against their respective limits.
2. THE System SHALL fetch usage data from `/api/user/usage` which returns `captions`, `schedules`, `posts`, `plan`, `captionLimit`, and `scheduleLimit`.
3. WHEN a User is on the PRO plan, THE System SHALL return `null` for `captionLimit` and `scheduleLimit`, and the gauges SHALL display `∞` with "Unlimited" as the sub-label and render as fully filled circles.
4. THE daily caption limit SHALL be read from the `PlanLimit` database table when available, falling back to the hardcoded default of 10 for FREE users. The monthly schedule limit of 15 for FREE users is hardcoded in application logic.
5. WHEN a FREE User's daily caption limit is reached, THE analytics page SHALL display a toast notification prompting the User to upgrade, and SHALL show an inline "Upgrade →" link beneath the gauge.
6. WHEN a FREE User's monthly schedule limit is reached, THE analytics page SHALL display a toast notification prompting the User to upgrade, and SHALL show an inline "Upgrade →" link beneath the gauge.
7. THE limit-hit toast notifications SHALL fire at most once per page session (tracked via a ref) to avoid repeated toasts on re-renders.
8. THE analytics page SHALL display a note for FREE users indicating that caption limits reset every 24 hours and schedule limits reset monthly.

---

### Requirement 9: Content Calendar

**User Story:** As a User, I want to view all my scheduled and published posts in a calendar view, so that I can manage my posting schedule visually.

#### Acceptance Criteria

1. THE System SHALL provide a calendar view at `/user/calendar` displaying all ScheduledPost records for the authenticated User.
2. WHEN the calendar is rendered, THE System SHALL display posts grouped by their `scheduledFor` date.
3. THE System SHALL visually distinguish posts by their `status` (SCHEDULED, PUBLISHED, FAILED, CANCELLED) using distinct color-coded badges.
4. WHEN a User selects a date on the calendar, THE System SHALL display all ScheduledPost records for that date.
5. THE System SHALL display the `caption`, `platforms`, and `status` for each post in the calendar view.
6. THE calendar SHALL poll for updates every 60 seconds to reflect status changes.
7. THE System SHALL allow a User to reschedule, publish immediately, or delete a scheduled post from the calendar via a post detail drawer.

---

### Requirement 10: Generation History

**User Story:** As a User, I want to view my past generated content, so that I can reuse or review previous generations.

#### Acceptance Criteria

1. THE System SHALL provide a history view at `/user/history` listing all Generation records for the authenticated User where `isDeleted` is `false`.
2. THE System SHALL display the `topic`, `platform`, `caption`, `hashtags`, and `createdAt` for each Generation record.
3. WHEN a User copies a caption or hashtag set, THE System SHALL copy the text to the clipboard.
4. THE System SHALL display Generation records in reverse chronological order by `createdAt`.

---

### Requirement 11: User Dashboard

**User Story:** As a User, I want a dashboard overview of my activity, so that I can quickly see my recent posts, upcoming scheduled posts, and plan status.

#### Acceptance Criteria

1. THE System SHALL provide a dashboard at `/user/dashboard` with the following sections: Quick Actions, Recent Posts, Upcoming Posts, and Plan Banner.
2. THE Quick Actions section SHALL provide direct navigation links to: Create Post (`/user/generate`), View Calendar (`/user/calendar`), and Analytics (`/user/analytics`).
3. THE Recent Posts section SHALL display the last 5 ScheduledPost records with a thumbnail image (or a placeholder icon if no image), caption preview, status badge, platform icons, and date.
4. THE Upcoming Posts section SHALL display the next 3 scheduled posts with thumbnail, caption preview, scheduled time, and platform icon.
5. THE Plan Banner SHALL display the User's current plan with an "Upgrade Now" link to `/api/checkout` for FREE users and a "Manage Plan" link to `/api/billing-portal` for PRO users.
6. THE status badges SHALL use dark colored backgrounds (dark green for Published, dark blue for Scheduled) with white text.
7. THE platform column SHALL display real brand SVG icons instead of text abbreviations.
8. WHEN the dashboard loads, THE System SHALL auto-publish any ScheduledPost records whose `scheduledFor` datetime has passed and whose status is still `SCHEDULED`, setting their status to `PUBLISHED`.

---

### Requirement 12: User Analytics

**User Story:** As a User, I want to see analytics about my content generation and posting activity, so that I can understand my usage patterns.

#### Acceptance Criteria

1. THE System SHALL provide an analytics view at `/user/analytics` displaying usage statistics for the authenticated User.
2. THE System SHALL display four stat cards: Total Captions Generated, Posts Published, Scheduled Posts, and Connected Accounts.
3. THE System SHALL display a Publishing Activity line chart showing captions generated and posts published over the selected date range (7d, 30d, 90d), powered by `recharts`.
4. THE System SHALL display a Platform Breakdown donut chart with a legend showing each platform's post count and percentage, powered by `recharts`.
5. THE System SHALL display a Caption Limit card alongside the Platform Breakdown, containing two circular arc gauges side by side: one for daily captions (teal) and one for monthly schedules (blue).
6. THE analytics data SHALL only be shown when the User has at least one connected social account; otherwise all charts display zero/empty states.

---

### Requirement 13: Usage Limit Enforcement

**User Story:** As a platform operator, I want usage limits enforced per plan tier, so that free users do not exceed their allocation and paid users receive their entitled capacity.

#### Acceptance Criteria

1. THE Usage_Enforcer SHALL enforce the following daily caption limits: FREE plan — 10 captions per calendar day (read from `PlanLimit` DB table when available, hardcoded as fallback); PRO plan — unlimited.
2. THE Usage_Enforcer SHALL enforce the following monthly scheduled post limits: FREE plan — 15 scheduled posts per calendar month (hardcoded); PRO plan — unlimited.
3. WHEN a User's daily usage resets at midnight UTC, THE Usage_Enforcer SHALL allow the User to generate content up to the daily limit again.
4. WHEN a caption limit is reached, THE System SHALL return HTTP 429 with a message indicating the limit and the User's current Plan.
5. WHEN a schedule limit is reached, THE System SHALL return HTTP 429 with a message indicating the limit and the User's current Plan.
6. PRO users SHALL have no caption or schedule limit checks applied.

---

### Requirement 14: Subscription Billing

**User Story:** As a User, I want to upgrade my plan via a secure checkout and manage my subscription, so that I can access higher usage limits.

#### Acceptance Criteria

1. WHEN a FREE User initiates a plan upgrade, THE System SHALL create a Stripe Checkout Session via `/api/checkout` at $10/month and redirect the User to the Stripe-hosted checkout page.
2. IF a User is already PRO and visits `/api/checkout`, THE System SHALL redirect them to the Stripe Billing Portal instead.
3. WHEN a Stripe `checkout.session.completed` webhook is received, THE System SHALL update the User's `plan` to `PRO` and store `stripeCustomerId` and `stripeSubscriptionId` in the database.
4. WHEN a Stripe `invoice.payment_succeeded` webhook is received, THE System SHALL keep the User's `plan` as `PRO`.
5. WHEN a Stripe `invoice.payment_failed` webhook is received, THE System SHALL downgrade the User's `plan` to `FREE`.
6. WHEN a Stripe `customer.subscription.deleted` webhook is received, THE System SHALL downgrade the User's `plan` to `FREE` and clear `stripeSubscriptionId`.
7. WHEN a Stripe `customer.subscription.updated` webhook is received, THE System SHALL set `plan` to `PRO` if the subscription status is `active` or `trialing`, otherwise `FREE`.
8. THE System SHALL verify the Stripe webhook signature using `STRIPE_WEBHOOK_SECRET` before processing any webhook event, rejecting invalid signatures with HTTP 400.
9. WHEN a PRO User visits `/api/billing-portal`, THE System SHALL create a Stripe Billing Portal session and redirect the User to manage their subscription. If the User has no `stripeCustomerId`, THE System SHALL redirect to `/pricing`.
10. THE System SHALL support the following plan tiers: FREE ($0), PRO ($10/month).

---

### Requirement 15: Admin User Management

**User Story:** As an Admin, I want to view and manage all users, so that I can maintain platform health and enforce policies.

#### Acceptance Criteria

1. THE System SHALL provide an admin users view at `/admin/users` listing all User records with `name`, `email`, `plan`, `role`, `isActive`, and `createdAt`.
2. WHEN an Admin toggles a User's active status, THE System SHALL update `isActive` on the User record via `/api/admin/users/toggle-active`.
3. WHEN an Admin updates a User's plan, THE System SHALL update the `plan` field on the User record immediately via `/api/admin/users/update-plan` without requiring a Stripe transaction.
4. THE System SHALL allow the Admin to search users by `email` or `name`.

---

### Requirement 16: Admin Content Moderation

**User Story:** As an Admin, I want to flag and delete inappropriate generated content, so that I can enforce the platform's content policy.

#### Acceptance Criteria

1. THE System SHALL provide an admin content view at `/admin/content` listing all Generation records where `isDeleted` is `false`.
2. WHEN an Admin flags a Generation record, THE System SHALL set `isFlagged` to `true` on that record via `/api/admin/generations/flag`.
3. WHEN an Admin deletes a Generation record, THE System SHALL set `isDeleted` to `true` on that record via `/api/admin/generations/delete`.
4. WHEN a Generation record has `isDeleted` set to `true`, THE System SHALL exclude it from all User-facing history views.
5. IF an unauthenticated or non-ADMIN request is made to any `/api/admin/*` endpoint, THEN THE System SHALL reject the request with HTTP 403.

---

### Requirement 17: Admin Analytics

**User Story:** As an Admin, I want to view platform-wide analytics, so that I can monitor growth, usage, and revenue.

#### Acceptance Criteria

1. THE System SHALL provide an admin analytics view at `/admin/analytics` displaying total Users, total Generations, total ScheduledPosts, and total published posts.
2. THE System SHALL display a breakdown of Users by Plan (FREE, PRO).
3. THE System SHALL display a breakdown of Generations by Platform.
4. THE System SHALL display recent platform activity including new user registrations and recent generations.
5. THE System SHALL display usage trend data using chart visualizations powered by `recharts`.

---

### Requirement 18: Admin Subscriptions

**User Story:** As an Admin, I want to view subscription and billing data for all users, so that I can monitor revenue and manage plan overrides.

#### Acceptance Criteria

1. THE System SHALL provide an admin subscriptions view at `/admin/subscriptions` displaying summary cards for total users, PRO users, FREE users, and estimated monthly recurring revenue (MRR).
2. THE System SHALL display a billing table listing users with their `plan`, `stripeCustomerId`, `stripeSubscriptionId`, and `createdAt`.
3. WHEN an Admin upgrades or downgrades a User's plan from the subscriptions view, THE System SHALL update the `plan` field on the User record immediately.

---

### Requirement 19: Theme and UI

**User Story:** As a User, I want to switch between dark and light themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE System SHALL provide a theme toggle control accessible from the navigation bar on all pages.
2. WHEN a User activates dark mode, THE System SHALL apply a dark color scheme with pure white (`hsl(0 0% 100%)`) as the primary text color and cool blue-gray (`hsl(220 20% 65%)`) as the secondary text color.
3. WHEN a User activates light mode, THE System SHALL apply a light color scheme to all UI components.
4. THE System SHALL persist the User's theme preference across sessions using `next-themes`.
5. THE System SHALL default to the User's operating system theme preference on first visit.
6. THE theme transition SHALL be instant with no visible lag.
7. THE System SHALL use the Inter font globally across all pages via a CSS variable (`--font-inter`).

---

### Requirement 20: Landing Page

**User Story:** As a visitor, I want to understand what PostSathi offers before signing up, so that I can decide if it meets my needs.

#### Acceptance Criteria

1. THE landing page SHALL include the following sections in order: Hero, Social Connect, Features, Pricing, Testimonials, Footer.
2. THE Hero section SHALL display the tagline "Create once. Post everywhere." with CTA buttons linking to sign-up and sign-in.
3. THE Social Connect section SHALL display brand icons for social platforms (Facebook, Instagram, X, YouTube, TikTok, Threads, Telegram, Snapchat, WhatsApp) as a decorative showcase with the heading "Connect your favorite accounts". Note: X (Twitter) appears here as a visual element only — it is not a connectable platform in the app.
4. THE Pricing section SHALL display Free ($0) and Premium ($10/mo) plan cards with feature lists.
5. THE Testimonials section SHALL display 3 cards with the side cards tilted and the center card scaled up.
6. THE landing page SHALL be fully responsive and dark mode compatible.
7. THE navigation bar SHALL display links to Features, Pricing, and Testimonials sections with `text-slate-400` color and `hover:text-foreground` on hover.

---

### Requirement 21: API Security

**User Story:** As a platform operator, I want all API routes to be protected, so that only authenticated users can access their own data.

#### Acceptance Criteria

1. THE System SHALL call `auth()` from `@clerk/nextjs/server` as the first operation in every API route handler.
2. IF `auth()` returns no `userId`, THEN THE System SHALL return HTTP 401 before executing any business logic.
3. THE System SHALL scope all database queries to the authenticated User's `userId` to prevent cross-user data access.
4. THE System SHALL add `export const dynamic = "force-dynamic"` to all API routes and pages that read authentication or request data.

---

### Requirement 22: Data Integrity

**User Story:** As a platform operator, I want data integrity enforced at the database level, so that orphaned records do not accumulate.

#### Acceptance Criteria

1. WHEN a User record is deleted, THE System SHALL cascade-delete all associated Generation, ScheduledPost, Usage, and SocialAccount records.
2. THE System SHALL enforce a unique constraint on `[userId, platform]` in the SocialAccount table to prevent duplicate connections.
3. THE System SHALL enforce a unique constraint on `[userId, date]` in the Usage table to ensure one Usage record per User per day.

---

### Requirement 23: Performance

**User Story:** As a User, I want the application to respond quickly, so that content generation and publishing feel seamless.

#### Acceptance Criteria

1. WHEN a caption generation request is submitted, THE System SHALL return a response within 10 seconds under normal load conditions.
2. THE System SHALL use a Prisma client singleton with a global variable guard to prevent connection pool exhaustion during Next.js hot-reload in development.
3. THE System SHALL use the `@prisma/adapter-pg` (`PrismaPg`) adapter for serverless-compatible database connections on Neon PostgreSQL.
4. THE System SHALL serve all uploaded media via the ImageKit CDN to minimize origin server load.
