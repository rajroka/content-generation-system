import { clerkClient } from "@clerk/nextjs/server";

/**
 * Make a user an admin
 * @param clerkId - The Clerk user ID
 */
export async function makeUserAdmin(clerkId: string) {
  try {
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: "admin",
      },
    });

    console.log(`User ${clerkId} promoted to ADMIN`);
  } catch (error) {
    console.error("Error making user admin:", error);
    throw error;
  }
}

/**
 * Remove admin role from a user
 * @param clerkId - The Clerk user ID
 */
export async function removeAdminRole(clerkId: string) {
  try {
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: "user",
      },
    });

    console.log(`User ${clerkId} demoted to USER`);
  } catch (error) {
    console.error("Error removing admin role:", error);
    throw error;
  }
}
