export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId, isActive } = await req.json();

    if (!targetUserId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid user status update" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
