import { clerkClient } from "@clerk/nextjs/server";

/**
 * Promote a user to admin role in Clerk publicMetadata.
 */
export async function makeUserAdmin(clerkId: string) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { role: "admin" },
  });
}

/**
 * Demote a user back to the standard user role.
 */
export async function removeAdminRole(clerkId: string) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { role: "user" },
  });
}
