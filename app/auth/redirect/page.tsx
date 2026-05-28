export const dynamic = "force-dynamic";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

/**
 * This page is the landing target after every sign-in / sign-up.
 * It checks whether the logged-in user is an admin and redirects
 * them to the correct dashboard. This avoids Clerk's static
 * AFTER_SIGN_IN_URL from sending admins to the wrong place.
 *
 * It also acts as a webhook fallback: if the Clerk webhook missed
 * (e.g. local dev with no tunnel), the user record is created here.
 */
export default async function AuthRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  let role = clerkUser.publicMetadata?.role as string | undefined;

  // If role is not set, default them to "user"
  if (!role) {
    console.log(`[auth/redirect] Role not set for user ${userId}. Defaulting to "user".`);
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "user" },
    });
    role = "user";
  }

  // ── Webhook fallback: ensure user exists in DB ──────────────────────────
  // The Clerk webhook may not fire in local dev (no public tunnel).
  // We upsert here so the admin users list always stays in sync.
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  const name  = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  await prisma.user.upsert({
    where:  { clerkId: userId },
    update: { email, name, imageUrl: clerkUser.imageUrl ?? null },
    create: {
      clerkId:  userId,
      email,
      name,
      imageUrl: clerkUser.imageUrl ?? null,
      plan:     "FREE",
      role:     role === "admin" ? "ADMIN" : "USER",
      isActive: true,
    },
  });
  // ────────────────────────────────────────────────────────────────────────

  console.log(`[auth/redirect] User ${userId} has role: ${role}`);

  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/user/dashboard");
  }
}
