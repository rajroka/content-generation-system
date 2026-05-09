export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";
import { SocialPlatform } from "@/lib/generated/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { platform } = await req.json();
    if (!platform)
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const platformUpper = platform.toUpperCase() as SocialPlatform;

    // Find the account
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId: user.id, platform: platformUpper } },
    });

    if (!socialAccount) {
      return NextResponse.json({ error: "Account not connected" }, { status: 404 });
    }

    // Try to remove from Zernio — always best-effort, never block the DB delete
    if (socialAccount.accountId) {
      try {
        await zernio.accounts.deleteAccount({
          path: { accountId: socialAccount.accountId },
        });
      } catch (zernioErr: any) {
        // Log but don't fail — the local record must still be removed
        console.warn(`Zernio disconnect warning for ${platformUpper}:`, zernioErr.message);
      }
    }

    // Always delete from local DB regardless of Zernio result
    await prisma.socialAccount.delete({
      where: { userId_platform: { userId: user.id, platform: platformUpper } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
