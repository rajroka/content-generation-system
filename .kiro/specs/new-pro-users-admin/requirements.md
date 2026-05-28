# Requirements Document

## Introduction

This feature adds a "New PRO Users" section to the PostSathi admin panel that highlights users who have recently upgraded from the FREE plan to the PRO plan. Currently, the `User.updatedAt` field is used as a proxy for upgrade time, which is unreliable because any update to the user record (e.g., name change) would incorrectly surface a user as a recent PRO upgrade. This feature introduces a dedicated `upgradedToPROAt` timestamp field on the `User` model, populates it via the Stripe webhook, and surfaces the data in the admin overview and a dedicated section — giving admins clear, accurate visibility into recent PRO conversions.

## Glossary

- **Admin_Panel**: The admin-only area of PostSathi accessible at `/admin`, protected by Clerk role `"admin"`.
- **Admin_Overview**: The main admin dashboard page at `/admin` rendered by `AdminOverviewClient`.
- **New_Pro_Users_Section**: The UI section within the Admin_Overview that lists recently upgraded PRO users.
- **PRO_User**: A user whose `plan` field in the database is set to `PRO`.
- **FREE_User**: A user whose `plan` field in the database is set to `FREE`.
- **Upgrade_Event**: The moment a user's `plan` transitions from `FREE` to `PRO`, triggered by a successful Stripe checkout or subscription event.
- **Upgrade_Timestamp**: The `upgradedToPROAt` field on the `User` model — a nullable `DateTime` that records when the most recent FREE-to-PRO upgrade occurred.
- **Stripe_Webhook**: The handler at `app/api/webhooks/stripe/route.ts` that processes Stripe subscription lifecycle events.
- **Admin_Analytics_Lib**: The `lib/admin-analytics.ts` module that queries the database and returns aggregated data for the admin panel.
- **Date_Range**: The time window selected by the admin for analytics, one of `"7d"`, `"30d"`, or `"90d"`. Defaults to `"30d"`.
- **Prisma_Client**: The database ORM client, always imported from `@/lib/prisma`.

---

## Requirements

### Requirement 1: Dedicated Upgrade Timestamp Field

**User Story:** As an admin, I want PRO upgrade times to be recorded accurately, so that the "New PRO Users" list reflects genuine FREE-to-PRO conversions rather than any incidental record update.

#### Acceptance Criteria

1. THE `User` model in `prisma/schema.prisma` SHALL include a nullable `DateTime` field named `upgradedToPROAt` with a default value of `null`.
2. WHEN a Prisma migration is generated and applied, THE database `User` table SHALL gain the `upgradedToPROAt` column with all pre-existing rows receiving a value of `null` and no other columns or rows being modified.
3. THE Prisma_Client SHALL be regenerated after the schema change so that the TypeScript type for the `User` model includes `upgradedToPROAt` as a `Date | null` field accessible without a compile error.
4. WHEN a `User` record's `plan` field is updated to `PRO` and the user's current `plan` is `FREE`, THE system SHALL set `upgradedToPROAt` to the current UTC timestamp in the same database write operation, regardless of whether the upgrade originates from the Stripe webhook handler or the admin update-plan route.
5. IF a `User` record's `plan` field is updated to `FREE` from `PRO`, THEN THE system SHALL preserve the existing `upgradedToPROAt` value unchanged.

---

### Requirement 2: Populate Upgrade Timestamp via Stripe Webhook

**User Story:** As an admin, I want the upgrade timestamp to be set automatically when a user pays for PRO, so that the data is always accurate and requires no manual intervention.

#### Acceptance Criteria

1. WHEN the Stripe_Webhook receives a `checkout.session.completed` event and the resolved user's current `plan` is `FREE`, THE Stripe_Webhook SHALL set `upgradedToPROAt` to the current UTC date-time (ISO 8601 format) and set `plan` to `PRO`, `stripeCustomerId`, and `stripeSubscriptionId` in the same database write.
2. WHEN the Stripe_Webhook receives a `checkout.session.completed` event and the resolved user's current `plan` is already `PRO`, THE Stripe_Webhook SHALL update `plan`, `stripeCustomerId`, and `stripeSubscriptionId` as normal but SHALL NOT overwrite the existing `upgradedToPROAt` value.
3. WHEN the Stripe_Webhook receives an `invoice.payment_succeeded` event and the resolved user's current `plan` is `FREE`, THE Stripe_Webhook SHALL set `upgradedToPROAt` to the current UTC date-time (ISO 8601 format) while also setting `plan` to `PRO` in the same database write.
4. WHEN the Stripe_Webhook receives an `invoice.payment_succeeded` event and the resolved user's current `plan` is already `PRO`, THE Stripe_Webhook SHALL update `plan` to `PRO` but SHALL NOT overwrite the existing `upgradedToPROAt` value.
5. WHEN the Stripe_Webhook receives a `customer.subscription.deleted` event, THE Stripe_Webhook SHALL set `plan` to `FREE` and `stripeSubscriptionId` to `null` but SHALL NOT modify `upgradedToPROAt`, preserving the historical upgrade record.
6. WHEN the Stripe_Webhook receives an `invoice.payment_failed` event, THE Stripe_Webhook SHALL set `plan` to `FREE` but SHALL NOT modify `upgradedToPROAt`.
7. WHEN the Stripe_Webhook receives a `customer.subscription.updated` event that resolves to `plan = FREE`, THE Stripe_Webhook SHALL set `plan` to `FREE` but SHALL NOT modify `upgradedToPROAt`.
8. IF the Stripe_Webhook receives a `checkout.session.completed` event and `session.metadata.userId` is absent or empty, THEN THE Stripe_Webhook SHALL leave the database unchanged and return HTTP 200 to Stripe.
9. IF the Stripe_Webhook receives an invoice or subscription event and no `User` record matches the event's `stripeCustomerId`, THEN THE Stripe_Webhook SHALL leave the database unchanged and return HTTP 200 to Stripe.

---

### Requirement 3: Query New PRO Users in Admin Analytics

**User Story:** As an admin, I want the analytics library to return a list of users who recently upgraded to PRO within the selected date range, so that the admin overview can display accurate conversion data.

#### Acceptance Criteria

1. THE `upgradedToPROAt` field SHALL exist on the `User` model in `prisma/schema.prisma` as a nullable `DateTime` before any query in this requirement can be executed.
2. IF a Date_Range is selected, THEN THE Admin_Analytics_Lib SHALL query the database for users where `plan = PRO` AND `upgradedToPROAt >= rangeStart` AND `upgradedToPROAt <= rangeEnd`.
3. THE Admin_Analytics_Lib SHALL sort the resulting list by `upgradedToPROAt` descending (most recent first).
4. THE Admin_Analytics_Lib SHALL limit the returned list to a maximum of 10 users.
5. THE Admin_Analytics_Lib SHALL return the following fields for each user in the `newProUsers` array: `id`, `name`, `email`, and `upgradedToPROAt` serialized as an ISO 8601 string under the key `upgradedAt`.
6. IF no users have upgraded to PRO within the selected Date_Range, THEN THE Admin_Analytics_Lib SHALL return an empty array for `newProUsers`.
7. THE Admin_Analytics_Lib SHALL NOT use `updatedAt` as a proxy for upgrade time in the `newProUsers` query.

---

### Requirement 4: Display New PRO Users Section in Admin Overview

**User Story:** As an admin, I want to see a clearly highlighted list of recent PRO conversions on the admin overview page, so that I can quickly identify and track new paying customers.

#### Acceptance Criteria

1. THE Admin_Overview SHALL render a "New PRO Users" section that displays the list returned by `data.newProUsers`.
2. WHEN `data.newProUsers` contains one or more entries, THE New_Pro_Users_Section SHALL display each user's name (or email prefix if name is absent), email address, and upgrade date formatted as `"MMM d, yyyy"` (e.g., "Jan 5, 2025").
3. WHEN `data.newProUsers` is empty, THE New_Pro_Users_Section SHALL display an empty-state message: "No new Pro upgrades in this period."
4. WHEN `data.newProUsers.length > 0`, THE New_Pro_Users_Section SHALL display a count badge adjacent to the section heading showing the number of new PRO users (e.g., "(3 this period)").
5. WHEN the admin changes the Date_Range selector, THE Admin_Overview SHALL re-fetch analytics data and reflect the updated `newProUsers` list corresponding to the new range without a full page reload.
6. THE New_Pro_Users_Section SHALL visually distinguish PRO upgrade entries using a `Crown` icon from `lucide-react` with amber accent color (`text-amber-500`, `bg-amber-100 dark:bg-amber-950/40`) consistent with the existing PRO plan styling in the codebase.
7. THE crown icon in each list item SHALL be marked as decorative with `aria-hidden="true"` so screen readers skip it.
8. WHEN `data.newProUsers` contains entries, each list item SHALL display the user's name (or email prefix) in `text-foreground` and the email in `text-muted-foreground` to ensure sufficient color contrast in both light and dark modes.

---

### Requirement 5: Admin Authorization on New PRO Users Data

**User Story:** As a system operator, I want the new PRO users data to be accessible only to authenticated admins, so that user upgrade information is not exposed to unauthorized parties.

#### Acceptance Criteria

1. WHEN a request is made to `app/api/admin/analytics`, THE route SHALL call `auth()` from `@clerk/nextjs/server` and then call `clerkClient().users.getUser(userId)` to read `publicMetadata.role` before returning any data.
2. IF the requesting user is not authenticated (no valid Clerk session), THEN THE `app/api/admin/analytics` route SHALL return HTTP 401 with `{ "error": "Unauthorized" }` and no user data.
3. IF the requesting user is authenticated but `publicMetadata.role` is not the lowercase string `"admin"`, THEN THE `app/api/admin/analytics` route SHALL return HTTP 401 with `{ "error": "Unauthorized" }` and no user data.
4. WHEN the Admin_Overview page is rendered server-side, THE page SHALL re-verify the Clerk role via `clerkClient` and redirect unauthenticated or non-admin users to `/sign-in`, consistent with the existing pattern in `app/admin/layout.tsx`.
