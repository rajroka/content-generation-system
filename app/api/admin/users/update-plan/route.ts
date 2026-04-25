export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId, plan } = await req.json();

    await prisma.user.update({
      where: { id: targetUserId },
      data: { plan: plan as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}


