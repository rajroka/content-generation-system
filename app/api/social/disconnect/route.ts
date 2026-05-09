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

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const platformUpper = platform.toUpperCase() as SocialPlatform;

    // Find the account to get the Zernio account ID before deleting
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId: user.id, platform: platformUpper } },
    });

    if (socialAccount?.accountId) {
      try {
        // Remove from Zernio — best effort, don't fail if Zernio call errors
        await zernio.accounts.deleteAccount(socialAccount.accountId);
      } catch (zernioErr: any) {
        console.warn(`Zernio disconnect warning for ${platform}:`, zernioErr.message);
      }
    }

    // Remove from local DB
    await prisma.socialAccount.delete({
      where: { userId_platform: { userId: user.id, platform: platformUpper } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disconnect:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
