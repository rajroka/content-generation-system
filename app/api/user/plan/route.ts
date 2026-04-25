export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { plan: true },
    });

    return NextResponse.json({ plan: user?.plan || "FREE" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}
