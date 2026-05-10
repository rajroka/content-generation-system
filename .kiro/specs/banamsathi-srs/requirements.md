# Requirements Document

## Introduction

PostSathi is an AI-powered SaaS platform for social media content generation and scheduling. Users provide a topic, target platform, and tone; the system generates platform-optimized captions and hashtags using Groq (Llama 3). Generated content can be published immediately or scheduled to connected social accounts (Instagram, Facebook, Twitter/X, LinkedIn, YouTube) via the Zernio API. The platform enforces per-user usage limits based on subscription tier (FREE / PRO), manages billing through Stripe, and provides an admin panel for user management, analytics, and content moderation.

This document specifies the complete functional and non-functional requirements for PostSathi as a production SaaS system.

---

## Glossary

- **System**: The PostSathi application as a whole.
- **User**: An authenticated individual with the USER role who accesses the dashboard and content features.
- **Admin**: An authenticated individual with the ADMIN role who accesses the admin panel.
- **Caption_Generator**: The subsystem responsible for producing AI-generated captions and hashtags via the Groq API.
- **Scheduler**: The subsystem responsible for creating, storing, and managing scheduled and draft posts.
- **Publisher**: The subsystem responsible for immediately publishing posts to connected social platforms via the Zernio API.
- **Usage_Enforcer**: The subsystem responsible for tracking and enforcing per-user daily and monthly usage limits.
- **Auth_Service**: Clerk — the external service handling user authentication, session management, and role assignment.
- **Zernio**: The third-party API (`@zernio/node`) used for social media OAuth connection and post publishing.
- **ImageKit**: The CDN service used for storing and serving uploaded images and videos.
- **Stripe**: The payment processor used for subscription billing and checkout.
- **Generation**: A single AI content generation event, producing a caption and hashtags, stored in the `Generation` database model.
- **ScheduledPost**: A database record representing a post in DRAFT, SCHEDULED, PUBLISHED, FAILED, or CANCELLED state.
- **SocialAccount**: A database record linking a User to a connected social media platform account via Zernio.
- **Plan**: A subscription tier — FREE or PRO — that determines usage limits and feature access.
- **PlanLimit**: A database record defining the daily caption, image, and platform limits for each Plan.
- **Usage**: A database record tracking a User's daily consumption of captions, images, and posts.
- **Platform**: One of INSTAGRAM, FACEBOOK, TWITTER, LINKEDIN, or YOUTUBE.
- **Tone**: One of PROFESSIONAL, CASUAL, INSPIRATIONAL, or HUMOROUS — the stylistic register for generated content.
- **Webhook**: An HTTP callback from an external service (Stripe or Clerk) to notify the System of events.
- **CDN_URL**: A publicly accessible URL returned by ImageKit after a successful media upload.

---

## Requirements

### Requirement 1: User Authentication and Session Management

**User Story:** As a visitor, I want to sign up and sign in securely, so that I can access my personal dashboard and content history.

#### Acceptance Criteria

1. THE Auth_Service SHALL provide sign-up and sign-in flows accessible at `/sign-up` and `/sign-in` respectively.
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

1. THE System SHALL recognize exactly two roles: USER and ADMIN, stored in Clerk `publicMetadata.role`.
2. WHEN a request is made to any route under `/admin/*`, THE System SHALL verify the authenticated user's role is ADMIN by querying the Clerk client directly.
3. IF a User with the USER role attempts to access any route under `/admin/*`, THEN THE System SHALL redirect the request to `/user/dashboard`.
4. WHEN a User completes sign-in, THE System SHALL redirect the User to `/admin` if the role is ADMIN, or to `/user/dashboard` if the role is USER.
5. THE System SHALL not rely solely on session claims for admin authorization; THE System SHALL re-verify the role via a fresh Clerk client call in `app/admin/layout.tsx`.
6. THE Admin SHALL be able to assign or revoke the ADMIN role for any User via the admin panel.

---

### Requirement 3: AI Caption and Hashtag Generation

**User Story:** As a User, I want to generate platform-optimized captions and hashtags from a topic and tone, so that I can create engaging social media content quickly.

#### Acceptance Criteria

1. WHEN a User submits a generation request with a `topic`, `platform`, and `tone`, THE Caption_Generator SHALL return a caption and an array of hashtags.
2. THE Caption_Generator SHALL use the Groq API with model `llama-3.3-70b-versatile` for caption generation and `llama-3.1-8b-instant` for hashtag generation.
3. THE Caption_Generator SHALL tailor the caption style and length to the specified Platform (e.g., concise for TWITTER, professional for LINKEDIN).
4. THE Caption_Generator SHALL tailor the caption register to the specified Tone.
5. WHEN a caption is successfully generated, THE System SHALL persist a Generation record with `userId`, `topic`, `platform`, `caption`, and `hashtags`.
6. WHEN a User on the FREE plan has reached 10 captions in the current calendar day, THE Usage_Enforcer SHALL reject the generation request with HTTP 429 and a descriptive error message.
7. WHEN a caption generation request is rejected due to usage limits, THE System SHALL not create a Generation record or increment the usage counter.
8. WHEN a caption is successfully generated, THE Usage_Enforcer SHALL increment `captionCount` in the User's Usage record for the current date.
9. IF the Groq API returns an error, THEN THE Caption_Generator SHALL return HTTP 500 with a descriptive error message.
10. THE Caption_Generator SHALL accept exactly one of the four defined Tone values: PROFESSIONAL, CASUAL, INSPIRATIONAL, HUMOROUS.

---

### Requirement 4: Media Upload

**User Story:** As a User, I want to upload my own images and videos to attach to posts, so that I can use custom media alongside AI-generated content.

#### Acceptance Criteria

1. WHEN a User uploads an image file via `/api/upload/image`, THE System SHALL upload the file to ImageKit and return the CDN_URL and `imageKitId`.
2. WHEN a User uploads a video file via `/api/upload/video`, THE System SHALL upload the file to ImageKit and return the CDN_URL.
3. THE System SHALL accept image files in JPEG, PNG, GIF, and WebP formats.
4. THE System SHALL accept video files in MP4 and MOV formats.
5. IF an uploaded file exceeds the maximum allowed size, THEN THE System SHALL reject the request with HTTP 413 and a descriptive error message.
6. IF an unauthenticated request is made to `/api/upload/image` or `/api/upload/video`, THEN THE System SHALL reject the request with HTTP 401.

---

### Requirement 5: Social Account OAuth Connection

**User Story:** As a User, I want to connect my social media accounts, so that I can publish and schedule posts directly from PostSathi.

#### Acceptance Criteria

1. WHEN a User initiates a connection for a Platform, THE System SHALL call `zernio.connect.getConnectUrl()` and redirect the User to the Zernio OAuth authorization URL.
2. WHEN the Zernio OAuth callback is received at `/api/auth/{platform}/callback`, THE System SHALL store a SocialAccount record with `userId`, `platform`, `accountId` (Zernio `account._id`), `accountName`, and `isActive: true`.
3. IF a SocialAccount record already exists for the same `userId` and `platform`, THEN THE System SHALL update the existing record rather than creating a duplicate.
4. WHEN a User disconnects a Platform, THE System SHALL call `zernio.accounts.deleteAccount(accountId)` and then delete the corresponding SocialAccount record from the database.
5. THE System SHALL support OAuth connection for INSTAGRAM, FACEBOOK, TWITTER, and LINKEDIN platforms.
6. WHEN a User requests the list of connected accounts via `/api/social/connections`, THE System SHALL return all SocialAccount records for that User from the local database.
7. IF the Zernio OAuth callback contains an error parameter, THEN THE System SHALL redirect the User to the platforms page with a descriptive error message.
8. THE System SHALL enforce the maximum number of connected social accounts per User based on the User's Plan (FREE: 2 accounts, PRO: unlimited).

---

### Requirement 5: Immediate Post Publishing

**User Story:** As a User, I want to publish a post immediately to one or more connected social platforms, so that I can share content in real time.

#### Acceptance Criteria

1. WHEN a User submits a publish request with a `caption`, `hashtags`, and one or more `platforms`, THE Publisher SHALL call `zernio.posts.createPost({ publishNow: true, platforms: [...] })` using the stored Zernio account IDs.
2. WHEN a post is successfully published, THE System SHALL create a ScheduledPost record with `status: PUBLISHED` and `publishedAt` set to the current timestamp.
3. IF the Zernio API returns an error during publishing, THEN THE System SHALL create a ScheduledPost record with `status: FAILED` and store the error message in `failureReason`.
4. IF a User attempts to publish to a Platform for which no active SocialAccount exists, THEN THE System SHALL reject the request with HTTP 400 and a descriptive error message.
5. WHEN a publish request is made, THE Usage_Enforcer SHALL increment `postCount` in the User's Usage record for the current date.
6. IF an unauthenticated request is made to `/api/social/publish`, THEN THE System SHALL reject the request with HTTP 401.

---

### Requirement 5: Post Scheduling and Drafts

**User Story:** As a User, I want to schedule posts for a future date and time or save them as drafts, so that I can plan my content calendar in advance.

#### Acceptance Criteria

1. WHEN a User submits a schedule request with a `caption`, `platforms`, and a future `scheduledFor` datetime, THE Scheduler SHALL call `zernio.posts.createPost({ scheduledFor: "...", platforms: [...] })` and create a ScheduledPost record with `status: SCHEDULED`.
2. WHEN a User submits a draft request without a `scheduledFor` datetime, THE Scheduler SHALL create a ScheduledPost record with `status: DRAFT` and SHALL NOT call the Zernio API.
3. THE System SHALL store `caption`, `hashtags`, `imageUrl`, `imageUrls`, `platforms`, `scheduledFor`, and `status` on the ScheduledPost record.
4. WHEN a ScheduledPost is successfully created with `status: SCHEDULED`, THE Usage_Enforcer SHALL increment `scheduleCount` in the User's Usage record for the current calendar month.
5. WHEN a User on the FREE plan has reached 15 scheduled posts in the current calendar month, THE Usage_Enforcer SHALL reject the schedule request with HTTP 429 and a descriptive error message.
6. IF the `scheduledFor` datetime is in the past, THEN THE System SHALL reject the schedule request with HTTP 400 and a descriptive error message.
7. WHEN a User cancels a scheduled post, THE System SHALL update the ScheduledPost `status` to CANCELLED.
8. IF an unauthenticated request is made to `/api/social/schedule`, THEN THE System SHALL reject the request with HTTP 401.
9. THE System SHALL allow a ScheduledPost to be linked to an existing Generation record via `generationId`.

---

### Requirement 5: Content Calendar

**User Story:** As a User, I want to view all my scheduled and published posts in a calendar view, so that I can manage my posting schedule visually.

#### Acceptance Criteria

1. THE System SHALL provide a calendar view at `/user/calendar` displaying all ScheduledPost records for the authenticated User.
2. WHEN the calendar is rendered, THE System SHALL display posts grouped by their `scheduledFor` date.
3. THE System SHALL visually distinguish posts by their `status` (DRAFT, SCHEDULED, PUBLISHED, FAILED, CANCELLED) using distinct color coding or badges.
4. WHEN a User selects a date on the calendar, THE System SHALL display all ScheduledPost records for that date.
5. THE System SHALL display the `caption`, `platforms`, and `status` for each post in the calendar view.

---

### Requirement 5: Generation History

**User Story:** As a User, I want to view my past AI-generated content, so that I can reuse or review previous generations.

#### Acceptance Criteria

1. THE System SHALL provide a history view at `/user/history` listing all Generation records for the authenticated User where `isDeleted` is `false`.
2. THE System SHALL display the `topic`, `platform`, `caption`, `hashtags`, and `createdAt` for each Generation record.
3. WHEN a User copies a caption or hashtag set, THE System SHALL copy the text to the clipboard.
4. THE System SHALL display Generation records in reverse chronological order by `createdAt`.
5. WHEN a Generation record has `isFlagged` set to `true`, THE System SHALL display a visual indicator on that record.

---

### Requirement 5: User Analytics Dashboard

**User Story:** As a User, I want to see analytics about my content generation and posting activity, so that I can understand my usage patterns.

#### Acceptance Criteria

1. THE System SHALL provide an analytics view at `/user/analytics` displaying usage statistics for the authenticated User.
2. THE System SHALL display the total number of captions generated and posts published for the User.
3. THE System SHALL display the User's current daily caption usage against the Plan limit.
4. THE System SHALL display the User's current monthly scheduled post count against the Plan limit.
5. THE System SHALL display a breakdown of Generation records by Platform.
6. THE System SHALL display usage trend data over the past 30 days using a chart visualization.

---

### Requirement 5: Usage Limit Enforcement

**User Story:** As a platform operator, I want usage limits enforced per plan tier, so that free users do not exceed their allocation and paid users receive their entitled capacity.

#### Acceptance Criteria

1. THE Usage_Enforcer SHALL enforce the following daily caption limits: FREE plan — 10 captions per calendar day; PRO plan — unlimited.
2. THE Usage_Enforcer SHALL enforce the following monthly scheduled post limits: FREE plan — 15 scheduled posts per calendar month; PRO plan — unlimited.
4. WHEN a User's daily usage resets at midnight UTC, THE Usage_Enforcer SHALL allow the User to generate content up to the daily limit again.
5. THE System SHALL read plan limits from the PlanLimit database table, not from hardcoded values in application logic.
6. WHEN a limit is reached, THE System SHALL return HTTP 429 with a message indicating the limit type and the User's current Plan.
7. THE Usage_Enforcer SHALL create a new Usage record for the current date if one does not already exist for the User.

---

### Requirement 5: Subscription Billing

**User Story:** As a User, I want to upgrade my plan via a secure checkout, so that I can access higher usage limits and additional features.

#### Acceptance Criteria

1. WHEN a User initiates a plan upgrade, THE System SHALL create a Stripe Checkout Session via `/api/checkout` and redirect the User to the Stripe-hosted checkout page.
2. WHEN a Stripe `checkout.session.completed` webhook is received at `/api/webhooks/stripe`, THE System SHALL update the User's `plan`, `stripeCustomerId`, and `stripeSubscriptionId` in the database.
3. WHEN a Stripe `customer.subscription.deleted` webhook is received, THE System SHALL downgrade the User's `plan` to FREE and clear `stripeSubscriptionId`.
4. WHEN a Stripe `customer.subscription.updated` webhook is received, THE System SHALL update the User's `plan` to reflect the new subscription tier.
5. THE System SHALL verify the Stripe webhook signature using the `STRIPE_WEBHOOK_SECRET` before processing any webhook event.
6. IF the Stripe webhook signature verification fails, THEN THE System SHALL reject the request with HTTP 400.
7. WHEN a User requests access to the Stripe billing portal via `/api/billing-portal`, THE System SHALL create a Stripe Billing Portal Session and redirect the User to it.
8. THE PRO plan SHALL be priced at $12 per month.
9. THE System SHALL support the following plan tiers: FREE (no charge), PRO ($12/month).

---

### Requirement 5: Admin User Management

**User Story:** As an Admin, I want to view and manage all users, so that I can maintain platform health and enforce policies.

#### Acceptance Criteria

1. THE System SHALL provide an admin users view at `/admin/users` listing all User records.
2. THE System SHALL display `name`, `email`, `plan`, `role`, `isActive`, and `createdAt` for each User.
3. WHEN an Admin toggles a User's active status, THE System SHALL update `isActive` on the User record via `/api/admin/users/toggle-active`.
4. WHEN an Admin updates a User's plan, THE System SHALL update the `plan` field on the User record via `/api/admin/users/update-plan`.
5. THE System SHALL paginate the user list when the total number of User records exceeds 50.
6. THE System SHALL allow the Admin to search users by `email` or `name`.

---

### Requirement 5: Admin Content Moderation

**User Story:** As an Admin, I want to flag and delete inappropriate generated content, so that I can enforce the platform's content policy.

#### Acceptance Criteria

1. THE System SHALL provide an admin generations view listing all Generation records where `isDeleted` is `false`.
2. WHEN an Admin flags a Generation record, THE System SHALL set `isFlagged` to `true` on that record via `/api/admin/generations/flag`.
3. WHEN an Admin deletes a Generation record, THE System SHALL set `isDeleted` to `true` on that record via `/api/admin/generations/delete`.
4. THE System SHALL provide a flagged content view at `/api/admin/generations/flagged` listing all Generation records where `isFlagged` is `true` and `isDeleted` is `false`.
5. WHEN a Generation record has `isDeleted` set to `true`, THE System SHALL exclude it from all User-facing history views.
6. IF an unauthenticated or non-ADMIN request is made to any `/api/admin/*` endpoint, THEN THE System SHALL reject the request with HTTP 403.

---

### Requirement 5: Admin Analytics

**User Story:** As an Admin, I want to view platform-wide analytics, so that I can monitor growth, usage, and revenue.

#### Acceptance Criteria

1. THE System SHALL provide an admin analytics view at `/admin/analytics` displaying platform-wide statistics.
2. THE System SHALL display the total number of registered Users, total Generations, total ScheduledPosts, and total published posts.
3. THE System SHALL display a breakdown of Users by Plan (FREE, PRO).
4. THE System SHALL display a breakdown of Generations by Platform.
5. THE System SHALL display recent platform activity via `/api/admin/activity`, including new user registrations and recent generations.
6. THE System SHALL display usage trend data over a configurable time range using chart visualizations.

---

### Requirement 5: Admin Subscription Overrides

**User Story:** As an Admin, I want to manually override a user's subscription plan, so that I can handle support cases and grant special access.

#### Acceptance Criteria

1. WHEN an Admin updates a User's plan via the admin panel, THE System SHALL update the `plan` field on the User record immediately without requiring a Stripe transaction.
2. THE System SHALL allow the Admin to set any User's plan to FREE or PRO.
3. WHEN an Admin overrides a plan, THE System SHALL apply the new PlanLimit immediately for all subsequent requests by that User.

---

### Requirement 5: Theme and UI

**User Story:** As a User, I want to switch between dark and light themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE System SHALL provide a theme toggle control accessible from the dashboard navigation bar.
2. WHEN a User activates dark mode, THE System SHALL apply a dark color scheme to all UI components.
3. WHEN a User activates light mode, THE System SHALL apply a light color scheme to all UI components.
4. THE System SHALL persist the User's theme preference across sessions using `next-themes`.
5. THE System SHALL default to the User's operating system theme preference on first visit.

---

### Requirement 5: API Security and Authentication

**User Story:** As a platform operator, I want all API routes to be protected, so that only authenticated users can access their own data.

#### Acceptance Criteria

1. THE System SHALL call `auth()` from `@clerk/nextjs/server` as the first operation in every API route handler.
2. IF `auth()` returns no `userId`, THEN THE System SHALL return HTTP 401 before executing any business logic.
3. THE System SHALL scope all database queries to the authenticated User's `userId` to prevent cross-user data access.
4. THE System SHALL add `export const dynamic = "force-dynamic"` to all API routes and pages that read authentication or request data.
5. THE System SHALL validate all incoming request bodies against expected schemas before processing.
6. IF a request body fails validation, THEN THE System SHALL return HTTP 400 with a descriptive error message.

---

### Requirement 5: Data Integrity and Cascading Deletes

**User Story:** As a platform operator, I want data integrity enforced at the database level, so that orphaned records do not accumulate.

#### Acceptance Criteria

1. WHEN a User record is deleted, THE System SHALL cascade-delete all associated Generation, ScheduledPost, Usage, and SocialAccount records.
2. WHEN a Generation record is deleted, THE System SHALL set `generationId` to NULL on any associated ScheduledPost record (SetNull behavior).
3. THE System SHALL enforce a unique constraint on `[userId, platform]` in the SocialAccount table to prevent duplicate connections.
4. THE System SHALL enforce a unique constraint on `[userId, date]` in the Usage table to ensure one Usage record per User per day.
5. THE System SHALL enforce a unique constraint on `generationId` in the ScheduledPost table to ensure a Generation is linked to at most one ScheduledPost.

---

### Requirement 5: Performance and Scalability

**User Story:** As a User, I want the application to respond quickly, so that content generation and publishing feel seamless.

#### Acceptance Criteria

1. WHEN a caption generation request is submitted, THE System SHALL return a response within 10 seconds under normal load conditions.
3. THE System SHALL use a Prisma client singleton with a global variable guard to prevent connection pool exhaustion during Next.js hot-reload in development.
4. THE System SHALL use the `@prisma/adapter-pg` (`PrismaPg`) adapter for serverless-compatible database connections on Neon PostgreSQL.
5. THE System SHALL serve all uploaded media via the ImageKit CDN to minimize origin server load.

---

### Requirement 5: Environment Configuration

**User Story:** As a developer, I want all external service credentials managed via environment variables, so that secrets are never hardcoded in source code.

#### Acceptance Criteria

1. THE System SHALL read all external service credentials exclusively from environment variables defined in `.env.local`.
2. THE System SHALL expose only the following variables to the client via the `NEXT_PUBLIC_` prefix: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_APP_URL`.
3. IF a required server-side environment variable is absent at startup, THE System SHALL fail to start and log a descriptive error identifying the missing variable.
4. THE System SHALL not commit `.env` or `.env.local` files to version control.
