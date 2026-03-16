import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateAndStoreImage } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, platform } = await req.json();

    if (!topic || !platform) {
      return NextResponse.json(
        { error: "Topic and platform are required" },
        { status: 400 }
      );
    }

    const result = await generateAndStoreImage(topic, platform);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[IMAGE GENERATION ERROR]", error);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
