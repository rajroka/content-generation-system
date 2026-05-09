export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";
import { startOfMonth, endOfMonth } from "date-fns";

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
      isDraft,
    } = await req.json();

    const hasCaption = caption?.trim();
    const hasImage   = imageUrls?.length > 0 || imageUrl;
    if (!hasCaption && !hasImage)
      return NextResponse.json({ error: "Post must have a caption or an image" }, { status: 400 });

    if (!isDraft && !scheduledFor)
      return NextResponse.json({ error: "Schedule time is required" }, { status: 400 });
    if (!platforms || platforms.length === 0)
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });

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

    // FREE plan: 15 scheduled posts per month (not drafts)
    if (!isDraft && user.plan === "FREE") {
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.usage.upsert({
        where:  { userId_date: { userId: user.id, date: today } },
        update: { scheduleCount: { increment: 1 } },
        create: { userId: user.id, date: today, scheduleCount: 1 },
      });
    }

    let zernioPostId: string | undefined;

    // For non-draft posts, schedule via Zernio
    if (!isDraft) {
      const socialAccounts = await prisma.socialAccount.findMany({
        where: { userId: user.id, platform: { in: platforms }, isActive: true },
      });

      if (socialAccounts.length > 0) {
        const zernioPlatforms = socialAccounts.map((account) => ({
          platform:  account.platform.toLowerCase(),
          accountId: account.accountId!,
        }));

        const allMedia: string[] = imageUrls || (imageUrl ? [imageUrl] : []);
        const mediaItems = allMedia.map((url) => ({
          type: /\.(mp4|mov|webm|avi|mpeg|mkv)(\?|$)/i.test(url) ? "video" as const : "image" as const,
          url,
        }));

        const result = await zernio.posts.createPost({
          body: {
            content:      hasCaption ? caption.trim() : "",
            scheduledFor: new Date(scheduledFor).toISOString(),
            platforms:    zernioPlatforms,
            ...(mediaItems.length > 0 && { mediaItems }),
          },
        });

        zernioPostId = result.data?.post?._id;
      }
    }

    const post = await prisma.scheduledPost.create({
      data: {
        userId:       user.id,
        caption:      hasCaption ? caption.trim() : null,
        hashtags:     hashtags || [],
        platforms,
        scheduledFor: isDraft ? null : new Date(scheduledFor),
        imageUrl:     imageUrls?.[0] || imageUrl || null,
        imageUrls:    imageUrls || (imageUrl ? [imageUrl] : []),
        status:       isDraft ? "DRAFT" : "SCHEDULED",
        // Store Zernio post ID in failureReason field temporarily for reference
        // (schema doesn't have a zernioPostId field yet)
        ...(zernioPostId && { failureReason: `zernio:${zernioPostId}` }),
      },
    });

    return NextResponse.json({ success: true, postId: post.id, zernioPostId });
  } catch (err: any) {
    console.error("Schedule API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
