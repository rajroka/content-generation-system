export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";
import { startOfMonth, endOfMonth } from "date-fns";

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi|mpeg|mkv)(\?|$)/i.test(url);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      caption,
      hashtags,
      platforms,
      scheduledFor,
      imageUrl,
      imageUrls,
    } = await req.json();

    const selectedPlatforms = Array.isArray(platforms) ? platforms : [];
    const allMedia: string[] = Array.isArray(imageUrls)
      ? imageUrls.filter(Boolean)
      : imageUrl
        ? [imageUrl]
        : [];
    const hasCaption = caption?.trim();
    const hasImage   = allMedia.length > 0;
    if (!hasCaption && !hasImage)
      return NextResponse.json({ error: "Post must have a caption or media" }, { status: 400 });

    if (!scheduledFor)
      return NextResponse.json({ error: "Schedule time is required" }, { status: 400 });
    if (selectedPlatforms.length === 0)
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });

    const scheduleDate = new Date(scheduledFor);
    if (Number.isNaN(scheduleDate.getTime())) {
      return NextResponse.json({ error: "Invalid schedule time" }, { status: 400 });
    }
    if (scheduleDate <= new Date()) {
      return NextResponse.json({ error: "Cannot schedule in the past" }, { status: 400 });
    }

    const clerkUser = await currentUser();
    const user = await prisma.user.upsert({
      where:  { clerkId: userId },
      update: {},
      create: {
        clerkId:  userId,
        email:    clerkUser?.emailAddresses[0]?.emailAddress || `user_${userId}@fallback.com`,
        name:     `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
        imageUrl: clerkUser?.imageUrl || null,
        plan:     "FREE",
      },
    });

    if (user.plan === "FREE") {
      const monthStart = startOfMonth(new Date());
      const monthEnd   = endOfMonth(new Date());

      const monthlyCount = await prisma.scheduledPost.count({
        where: {
          userId:    user.id,
          status:    { in: ["SCHEDULED", "PUBLISHED"] },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });

      if (monthlyCount >= 15) {
        return NextResponse.json(
          { error: "Monthly schedule limit reached (15/month). Upgrade to Pro for unlimited." },
          { status: 403 }
        );
      }
    }

    let zernioPostId: string | undefined;

    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: user.id,
        platform: { in: selectedPlatforms },
        isActive: true,
        accountId: { not: null },
      },
    });

    const connectedPlatforms = socialAccounts.map((account) => account.platform as string);
    const missingPlatforms = selectedPlatforms.filter((platform: string) => !connectedPlatforms.includes(platform));
    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Not connected to: ${missingPlatforms.join(", ")}. Go to Connections to link your accounts.` },
        { status: 400 }
      );
    }

    const zernioPlatforms = socialAccounts.map((account) => ({
      platform:  account.platform.toLowerCase(),
      accountId: account.accountId!,
    }));

    const mediaItems = allMedia.map((url) => ({
      type: isVideo(url) ? "video" as const : "image" as const,
      url,
    }));

    const result = await zernio.posts.createPost({
      body: {
        content:      hasCaption ? caption.trim() : "",
        scheduledFor: scheduleDate.toISOString(),
        platforms:    zernioPlatforms,
        ...(mediaItems.length > 0 && { mediaItems }),
      },
    });

    zernioPostId = result.data?.post?._id;

    const post = await prisma.scheduledPost.create({
      data: {
        userId:       user.id,
        caption:      hasCaption ? caption.trim() : null,
        hashtags:     hashtags || [],
        platforms:    selectedPlatforms,
        scheduledFor: scheduleDate,
        imageUrl:     allMedia[0] || null,
        imageUrls:    allMedia,
        status:       "SCHEDULED",
        ...(zernioPostId && { zernioPostId }),
      },
    });

    if (user.plan === "FREE") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.usage.upsert({
        where:  { userId_date: { userId: user.id, date: today } },
        update: { scheduleCount: { increment: 1 } },
        create: { userId: user.id, date: today, scheduleCount: 1 },
      });
    }

    return NextResponse.json({ success: true, postId: post.id, zernioPostId });
  } catch (err: any) {
    console.error("Schedule API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
