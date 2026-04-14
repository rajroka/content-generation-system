import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    // Must have at least a caption or an image
    const hasCaption = caption?.trim();
    const hasImage = imageUrls?.length > 0 || imageUrl;
    if (!hasCaption && !hasImage)
      return NextResponse.json(
        { error: "Post must have a caption or an image" },
        { status: 400 }
      );

    if (!isDraft && !scheduledFor)
      return NextResponse.json({ error: "Schedule time is required" }, { status: 400 });
    if (!platforms || platforms.length === 0)
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });

    const clerkUser = await currentUser();

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || `user_${userId}@fallback.com`,
        name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
        imageUrl: clerkUser?.imageUrl || null,
        plan: "FREE",
      },
    });

    // FREE plan: 15 scheduled posts per month (not drafts)
    if (!isDraft && user.plan === "FREE") {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());

      const monthlyScheduleCount = await prisma.scheduledPost.count({
        where: {
          userId: user.id,
          status: { in: ["SCHEDULED", "PUBLISHED"] },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });

      if (monthlyScheduleCount >= 15) {
        return NextResponse.json(
          { error: "Monthly schedule limit reached (15/month). Upgrade to Pro for unlimited." },
          { status: 403 }
        );
      }

      // Track in Usage for dashboard display
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.usage.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        update: { scheduleCount: { increment: 1 } },
        create: { userId: user.id, date: today, scheduleCount: 1 },
      });
    }

    const post = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        caption: hasCaption ? caption.trim() : null,
        hashtags: hashtags || [],
        platforms,
        scheduledFor: isDraft ? null : new Date(scheduledFor),
        imageUrl: imageUrls?.[0] || imageUrl || null,
        imageUrls: imageUrls || (imageUrl ? [imageUrl] : []),
        status: isDraft ? "DRAFT" : "SCHEDULED",
      },
    });

    return NextResponse.json({ success: true, postId: post.id });
  } catch (err: any) {
    console.error("Schedule API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}