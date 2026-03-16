import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — fetch all content for current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ contents: [] });
    }

    const contents = await prisma.content.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contents });
  } catch (error) {
    console.error("[CONTENT GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

// POST — save generated content
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { topic, platform, tone, titles, captions, hashtags, imageUrl, imagePrompt } = body;

    if (!topic || !platform || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const content = await prisma.content.create({
      data: {
        userId: dbUser.id,
        topic,
        platform,
        tone,
        titles: titles || [],
        captions: captions || [],
        hashtags: hashtags || [],
        imageUrl: imageUrl || null,
        imagePrompt: imagePrompt || null,
      },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[CONTENT POST ERROR]", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
