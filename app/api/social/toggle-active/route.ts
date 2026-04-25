export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform, isActive } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.socialAccount.update({
      where: {
        userId_platform: {
          userId: user.id,
          platform: platform,
        },
      },
      data: { isActive },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
