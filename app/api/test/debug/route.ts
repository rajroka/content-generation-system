import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * DEBUG ENDPOINT - Use this to:
 * 1. Check current user's info
 * 2. Set yourself as admin: GET /api/test/debug?action=makeAdmin
 * 3. Check admin status: GET /api/test/debug?action=checkAdmin
 * 
 * IMPORTANT: Remove this endpoint in production!
 */

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in first." },
        { status: 401 }
      );
    }

    // Check current admin status
    if (action === "checkAdmin") {
      const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
      return NextResponse.json({
        userId,
        currentRole: role,
        isAdmin: role === "admin",
        sessionClaims: sessionClaims?.publicMetadata,
      });
    }

    // Make current user admin
    if (action === "makeAdmin") {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "admin",
        },
      });

      return NextResponse.json({
        success: true,
        message: `User ${userId} is now an admin. Please refresh your browser.`,
        nextAction: "Refresh your browser and navigate to /admin",
      });
    }

    // Remove admin role
    if (action === "removeAdmin") {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "user",
        },
      });

      return NextResponse.json({
        success: true,
        message: `User ${userId} is now a regular user.`,
      });
    }

    // Default: show current user info
    return NextResponse.json({
      userId,
      email: sessionClaims?.primaryEmailAddress,
      role: (sessionClaims?.publicMetadata as { role?: string })?.role,
      allMetadata: sessionClaims?.publicMetadata,
      instructions: {
        1: "To make yourself admin: GET /api/test/debug?action=makeAdmin",
        2: "To check admin status: GET /api/test/debug?action=checkAdmin",
        3: "To remove admin role: GET /api/test/debug?action=removeAdmin",
        4: "After making admin, refresh browser and try /admin",
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
