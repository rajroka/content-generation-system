export const dynamic = "force-dynamic";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * This page is the landing target after every sign-in / sign-up.
 * It checks whether the logged-in user is an admin and redirects
 * them to the correct dashboard. This avoids Clerk's static
 * AFTER_SIGN_IN_URL from sending admins to the wrong place.
 */
export default async function AuthRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  let role = user.publicMetadata?.role as string | undefined;

  // Auto-promote if email matches ADMIN_EMAIL env var
  const primaryEmailObj = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  );
  const primaryEmail = primaryEmailObj?.emailAddress?.toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdminEmail =
    primaryEmail &&
    (adminEmails.includes(primaryEmail) || primaryEmail.startsWith("admin"));

  if (isAdminEmail && role !== "admin") {
    console.log(`[auth/redirect] Auto-promoting ${primaryEmail} to admin`);
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "admin" },
    });
    role = "admin";
  }

  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/user/dashboard");
  }
}
