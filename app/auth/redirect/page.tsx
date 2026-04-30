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

  // If role is not set, default them to "user"
  if (!role) {
    console.log(`[auth/redirect] Role not set for user ${userId}. Defaulting to "user".`);
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "user" },
    });
    role = "user";
  }
  console.log(`[auth/redirect] User ${userId} has role: ${role}`);

  if (role === "admin") {
    redirect("/admin");
  
  } else {
    redirect("/user/dashboard");
    
  }
}
