import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. ADD "imageUrls" TO THIS DESTRUCTURING LIST
    const { 
      caption, 
      hashtags, 
      platforms, 
      scheduledFor, 
      imageUrl, 
      imageUrls, // <--- Added this
      isDraft 
    } = await req.json();

    if (!caption?.trim())
      return NextResponse.json({ error: "Caption is required" }, { status: 400 });
    if (!isDraft && !scheduledFor)
      return NextResponse.json({ error: "Schedule time is required" }, { status: 400 });
    if (!platforms || platforms.length === 0)
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });

    const clerkUser = await currentUser();

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId:  userId,
        email:    clerkUser?.emailAddresses[0]?.emailAddress || `user_${userId}@fallback.com`,
        name:     `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
        imageUrl: clerkUser?.imageUrl || null,
        plan:     "FREE",
      },
    });

    if (!isDraft && user.plan === "FREE") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usage = await prisma.usage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });

      if ((usage?.scheduleCount ?? 0) >= 5) {
        return NextResponse.json(
          { error: "Daily schedule limit reached (5/day). Upgrade to Pro for unlimited." },
          { status: 403 }
        );
      }

      await prisma.usage.upsert({
        where:  { userId_date: { userId: user.id, date: today } },
        update: { scheduleCount: { increment: 1 } },
        create: { userId: user.id, date: today, scheduleCount: 1 },
      });
    }

    const post = await prisma.scheduledPost.create({
      data: {
        userId:       user.id,
        caption,
        hashtags:     hashtags || [],
        platforms,
        scheduledFor: isDraft ? null : new Date(scheduledFor),
        // Logic: Use first item of imageUrls, or fallback to single imageUrl
        imageUrl:     imageUrls?.[0] || imageUrl || null,  
        imageUrls:    imageUrls || (imageUrl ? [imageUrl] : []),
        status:       isDraft ? "DRAFT" : "SCHEDULED",
      },
    });

    return NextResponse.json({ success: true, postId: post.id });
  } catch (err: any) {
    console.error("Schedule API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}