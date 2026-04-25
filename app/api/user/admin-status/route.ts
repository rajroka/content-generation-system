export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

    return NextResponse.json({
      isAdmin: role === "admin",
      role: role,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}

