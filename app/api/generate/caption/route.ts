import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import prisma from "@/lib/prisma"; // This now points to your custom generated client
// Import your Enums from your generated path to ensure type safety
import { Platform, Plan } from "@/lib/generated/prisma"; 

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, platform, tone } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
    const userName = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim();

    // Map strings to your Prisma Enums safely
    const safePlatform = platform.toUpperCase() as Platform;

    const platformLimits: Record<string, number> = {
      INSTAGRAM: 2200,
      FACEBOOK: 500,
      TWITTER: 280,
      LINKEDIN: 3000,
    };

    const toneDescriptions: Record<string, string> = {
      CASUAL: "casual and friendly",
      PROFESSIONAL: "professional and formal",
      INSPIRATIONAL: "motivational and inspiring",
      HUMOROUS: "funny and witty",
    };

    const prompt = `Generate a ${toneDescriptions[tone] || "casual"} social media caption for ${platform} about: "${topic}".
    Return ONLY a JSON object: { "caption": "...", "hashtags": ["#1", "#2"] }`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const parsed = JSON.parse(jsonMatch[0]);

    // 1. Get/Update User
    let user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { imageUrl: clerkUser?.imageUrl || null },
      create: {
        clerkId: userId,
        email: userEmail || `user_${userId}@fallback.com`,
        name: userName || null,
        imageUrl: clerkUser?.imageUrl || null,
        plan: "FREE",
      },
    });

    // 2. Check Limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.plan === "FREE") {
      const usage = await prisma.usage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });
      if ((usage?.captionCount ?? 0) >= 50) {
        return NextResponse.json({ error: "Limit reached" }, { status: 403 });
      }
    }

    // 3. Save Generation 
    // NOTE: If 'tone' isn't in your schema, I've commented it out
    await prisma.generation.create({
      data: {
        userId: user.id,
        topic,
        platform: safePlatform,
        // tone: tone, // Add this to schema.prisma first if you want to save it!
        caption: parsed.caption,
        hashtags: parsed.hashtags,
      },
    });

    // 4. Increment Usage
    await prisma.usage.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: { captionCount: { increment: 1 } },
      create: { userId: user.id, date: today, captionCount: 1 },
    });

    return NextResponse.json({
      caption: parsed.caption,
      hashtags: parsed.hashtags,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}