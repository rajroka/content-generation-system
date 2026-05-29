export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateCaption } from "@/lib/model";
import prisma from "@/lib/prisma";
import { Platform } from "@/lib/generated/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, platform, tone } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const safePlatform = platform.toUpperCase() as Platform;

    // Upsert user
    const user = await prisma.user.upsert({
      where:  { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email:   `user_${userId}@postsathi.app`,
        plan:    "FREE",
      },
    });

    // Check daily caption limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.plan === "FREE") {
      const planLimit = await prisma.planLimit.findUnique({ where: { plan: "FREE" } });
      const dailyLimit = planLimit?.dailyCaptions ?? 10;

      const usage = await prisma.usage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });
      if ((usage?.captionCount ?? 0) >= dailyLimit) {
        return NextResponse.json(
          { error: `Daily caption limit reached (${dailyLimit}/day). Upgrade to Pro for unlimited.` },
          { status: 429 }
        );
      }
    }

    // Call fine-tuned model via Hugging Face Inference API
    const { caption, hashtags } = await generateCaption({ topic, platform, tone });

    // Save generation
    await prisma.generation.create({
      data: {
        userId:   user.id,
        topic,
        platform: safePlatform,
        caption,
        hashtags,
      },
    });

    // Increment usage
    await prisma.usage.upsert({
      where:  { userId_date: { userId: user.id, date: today } },
      update: { captionCount: { increment: 1 } },
      create: { userId: user.id, date: today, captionCount: 1 },
    });

    return NextResponse.json({ caption, hashtags });
  } catch (err: any) {
    console.error(err);
    // If model not deployed yet, return a clear message
    if (err.message?.includes("Model not deployed yet")) {
      return NextResponse.json(
        { error: "Caption generation is not available yet. The model is being deployed." },
        { status: 503 }
      );
    }
    if (err.message?.includes("timed out")) {
      return NextResponse.json(
        { error: "The model is taking too long to respond. Please try again in a moment." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
